from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
import os
import socket

from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import init_db, get_db
from models import Bookmark, Tag, Collection, SyncLog, BrowserConfig, bookmark_tags, bookmark_collections
from sync import BROWSER_SYNCS
from thumbnail_service import get_or_generate_thumbnail, generate_thumbnail
from favicon_service import get_or_fetch_favicon, fetch_favicon, FAVICON_DIR
from scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Seed default browser configs
    async for db in get_db():
        for browser in ["chrome", "firefox", "safari", "edge", "brave", "arc"]:
            existing = await db.execute(select(BrowserConfig).where(BrowserConfig.browser == browser))
            if not existing.scalar_one_or_none():
                db.add(BrowserConfig(browser=browser, enabled=browser in ("chrome", "firefox")))
        await db.commit()

    # Start automatic sync scheduler
    start_scheduler()

    yield

    # Stop scheduler on shutdown
    stop_scheduler()


app = FastAPI(title="Favoxia API", version="1.0.0", lifespan=lifespan)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Schemas ---

class TagCreate(BaseModel):
    name: str
    color: str = "#A855F7"

class TagOut(BaseModel):
    id: int
    name: str
    color: str
    bookmark_count: int = 0

class CollectionCreate(BaseModel):
    name: str
    icon: str = "📁"

class CollectionOut(BaseModel):
    id: int
    name: str
    icon: str
    bookmark_count: int = 0

class BookmarkOut(BaseModel):
    id: int
    title: str
    url: str
    domain: str
    description: str | None
    favicon_url: str | None
    browser: str
    folder: str | None
    is_favorite: bool
    visit_count: int
    note: str | None
    added_at: datetime
    last_visited: datetime | None
    tags: list[TagOut]
    collections: list[CollectionOut]

class BookmarkUpdate(BaseModel):
    is_favorite: bool | None = None
    note: str | None = None
    tag_ids: list[int] | None = None
    collection_ids: list[int] | None = None

class SyncLogOut(BaseModel):
    id: int
    browser: str
    action: str
    count: int
    status: str
    synced_at: datetime

class BrowserConfigOut(BaseModel):
    id: int
    browser: str
    enabled: bool
    sync_frequency: int
    last_sync: datetime | None
    bookmark_count: int

class StatsOut(BaseModel):
    total_bookmarks: int
    total_browsers: int
    total_tags: int
    favorites_count: int
    browser_counts: dict[str, int]

class BookmarkMetadataOut(BaseModel):
    url: str
    domain: str
    ip_address: str | None
    protocol: str


# --- Bookmarks ---

@app.get("/api/bookmarks", response_model=list[BookmarkOut])
async def list_bookmarks(
    browser: str | None = None,
    tag: str | None = None,
    search: str | None = None,
    favorite: bool | None = None,
    sort: str = "added_at",
    limit: int = Query(10000, le=50000),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(Bookmark).options(selectinload(Bookmark.tags), selectinload(Bookmark.collections))

    if browser:
        query = query.where(Bookmark.browser == browser)
    if favorite is not None:
        query = query.where(Bookmark.is_favorite == favorite)
    if search:
        pattern = f"%{search}%"
        query = query.where(Bookmark.title.ilike(pattern) | Bookmark.url.ilike(pattern))
    if tag:
        query = query.join(Bookmark.tags).where(Tag.name == tag)

    order_col = getattr(Bookmark, sort, Bookmark.added_at)
    query = query.order_by(order_col.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    bookmarks = result.scalars().unique().all()
    return [_bookmark_to_out(b) for b in bookmarks]


@app.get("/api/bookmarks/{bookmark_id}", response_model=BookmarkOut)
async def get_bookmark(bookmark_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Bookmark).options(selectinload(Bookmark.tags), selectinload(Bookmark.collections)).where(Bookmark.id == bookmark_id)
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(404, "Bookmark not found")
    return _bookmark_to_out(bookmark)


@app.patch("/api/bookmarks/{bookmark_id}", response_model=BookmarkOut)
async def update_bookmark(bookmark_id: int, data: BookmarkUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Bookmark).options(selectinload(Bookmark.tags), selectinload(Bookmark.collections)).where(Bookmark.id == bookmark_id)
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(404, "Bookmark not found")

    if data.is_favorite is not None:
        bookmark.is_favorite = data.is_favorite
    if data.note is not None:
        bookmark.note = data.note
    if data.tag_ids is not None:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(data.tag_ids)))
        bookmark.tags = list(tag_result.scalars().all())
    if data.collection_ids is not None:
        collection_result = await db.execute(select(Collection).where(Collection.id.in_(data.collection_ids)))
        bookmark.collections = list(collection_result.scalars().all())

    await db.commit()
    await db.refresh(bookmark)
    return _bookmark_to_out(bookmark)


@app.delete("/api/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Bookmark).where(Bookmark.id == bookmark_id))
    await db.commit()
    return {"ok": True}


@app.get("/api/bookmarks/{bookmark_id}/metadata", response_model=BookmarkMetadataOut)
async def get_bookmark_metadata(bookmark_id: int, db: AsyncSession = Depends(get_db)):
    """Get metadata including IP address for a bookmark."""
    result = await db.execute(select(Bookmark).where(Bookmark.id == bookmark_id))
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(404, "Bookmark not found")

    parsed = urlparse(bookmark.url)
    domain = parsed.netloc
    protocol = parsed.scheme

    # Resolve IP address
    ip_address = None
    try:
        # Remove port if present
        hostname = domain.split(':')[0]
        ip_address = socket.gethostbyname(hostname)
    except (socket.gaierror, socket.herror, OSError):
        # DNS resolution failed - keep ip_address as None
        pass

    return BookmarkMetadataOut(
        url=bookmark.url,
        domain=domain,
        ip_address=ip_address,
        protocol=protocol
    )


# --- Tags ---

@app.get("/api/tags", response_model=list[TagOut])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag))
    tags = result.scalars().all()
    out = []
    for t in tags:
        count_result = await db.execute(
            select(func.count()).select_from(bookmark_tags).where(bookmark_tags.c.tag_id == t.id)
        )
        out.append(TagOut(id=t.id, name=t.name, color=t.color, bookmark_count=count_result.scalar() or 0))
    return out


@app.post("/api/tags", response_model=TagOut)
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)):
    tag = Tag(name=data.name, color=data.color)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return TagOut(id=tag.id, name=tag.name, color=tag.color, bookmark_count=0)


@app.patch("/api/tags/{tag_id}", response_model=TagOut)
async def update_tag(tag_id: int, data: TagCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(404, "Tag not found")

    if data.name:
        tag.name = data.name
    if data.color:
        tag.color = data.color

    await db.commit()
    await db.refresh(tag)

    # Count bookmarks with this tag
    count_result = await db.execute(
        select(func.count()).select_from(bookmark_tags).where(bookmark_tags.c.tag_id == tag.id)
    )
    return TagOut(id=tag.id, name=tag.name, color=tag.color, bookmark_count=count_result.scalar() or 0)


@app.delete("/api/tags/{tag_id}")
async def delete_tag(tag_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Tag).where(Tag.id == tag_id))
    await db.commit()
    return {"ok": True}


# --- Collections ---

@app.get("/api/collections", response_model=list[CollectionOut])
async def list_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection))
    collections = result.scalars().all()
    out = []
    for c in collections:
        count_result = await db.execute(
            select(func.count()).select_from(bookmark_collections).where(bookmark_collections.c.collection_id == c.id)
        )
        out.append(CollectionOut(id=c.id, name=c.name, icon=c.icon, bookmark_count=count_result.scalar() or 0))
    return out


@app.post("/api/collections", response_model=CollectionOut)
async def create_collection(data: CollectionCreate, db: AsyncSession = Depends(get_db)):
    collection = Collection(name=data.name, icon=data.icon)
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    return CollectionOut(id=collection.id, name=collection.name, icon=collection.icon, bookmark_count=0)


@app.patch("/api/collections/{collection_id}", response_model=CollectionOut)
async def update_collection(collection_id: int, data: CollectionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(404, "Collection not found")

    if data.name:
        collection.name = data.name
    if data.icon:
        collection.icon = data.icon

    await db.commit()
    await db.refresh(collection)

    # Count bookmarks in this collection
    count_result = await db.execute(
        select(func.count()).select_from(bookmark_collections).where(bookmark_collections.c.collection_id == collection.id)
    )
    return CollectionOut(id=collection.id, name=collection.name, icon=collection.icon, bookmark_count=count_result.scalar() or 0)


@app.delete("/api/collections/{collection_id}")
async def delete_collection(collection_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Collection).where(Collection.id == collection_id))
    await db.commit()
    return {"ok": True}


# --- Sync ---

@app.post("/api/sync")
async def trigger_sync(background_tasks: BackgroundTasks, browser: str | None = None, db: AsyncSession = Depends(get_db)):
    """Sync bookmarks from all enabled browsers (or a specific one)."""
    configs_q = select(BrowserConfig).where(BrowserConfig.enabled == True)
    if browser:
        configs_q = configs_q.where(BrowserConfig.browser == browser)

    result = await db.execute(configs_q)
    configs = result.scalars().all()
    total_imported = 0
    new_bookmark_urls = []
    collections_created = 0

    # Helper function to get or create collection
    async def get_or_create_collection(collection_name: str, icon: str = "📁") -> Collection:
        nonlocal collections_created
        result = await db.execute(select(Collection).where(Collection.name == collection_name))
        collection = result.scalar_one_or_none()
        if not collection:
            collection = Collection(name=collection_name, icon=icon)
            db.add(collection)
            await db.flush()  # Get the ID without committing
            collections_created += 1
        return collection

    for config in configs:
        syncer_cls = BROWSER_SYNCS.get(config.browser)
        if not syncer_cls:
            continue

        syncer = syncer_cls()
        raw_bookmarks = syncer.sync()

        imported = 0
        for rb in raw_bookmarks:
            existing = await db.execute(select(Bookmark).where(Bookmark.url == rb.url))
            if existing.scalar_one_or_none():
                continue

            domain = urlparse(rb.url).netloc
            # Fetch real favicon from the website
            favicon = await get_or_fetch_favicon(rb.url)

            # Validate timestamp - if invalid (before 2000 or in future), use current time
            if rb.added_at:
                try:
                    added_at = datetime.fromtimestamp(rb.added_at)
                    # Check if date is reasonable (between 2000 and now + 1 day)
                    from datetime import timedelta
                    min_date = datetime(2000, 1, 1)
                    max_date = datetime.utcnow() + timedelta(days=1)
                    if added_at < min_date or added_at > max_date:
                        added_at = datetime.utcnow()
                except (ValueError, OSError):
                    added_at = datetime.utcnow()
            else:
                added_at = datetime.utcnow()

            bookmark = Bookmark(
                title=rb.title or domain,
                url=rb.url,
                domain=domain,
                favicon_url=favicon,
                browser=config.browser,
                folder=rb.folder,
                added_at=added_at,
            )

            # Auto-create collections from Arc folder structure
            if config.browser == "arc" and rb.folder:
                # Remove "Arc / " prefix and create collection
                folder_path = rb.folder
                if folder_path.startswith("Arc / "):
                    folder_path = folder_path[6:]  # Remove "Arc / "

                if folder_path:  # Only if there's something left after removing prefix
                    # Choose icon based on folder keywords
                    icon = "📁"
                    if "Pinned" in folder_path or "pinned" in folder_path:
                        icon = "📌"
                    elif "Work" in folder_path or "Travail" in folder_path:
                        icon = "💼"
                    elif "Personal" in folder_path:
                        icon = "👤"

                    # Create/get collection
                    collection = await get_or_create_collection(folder_path, icon)
                    bookmark.collections.append(collection)

            db.add(bookmark)
            new_bookmark_urls.append(rb.url)
            imported += 1

        config.last_sync = datetime.utcnow()
        config.bookmark_count = imported + config.bookmark_count

        db.add(SyncLog(
            browser=config.browser,
            action=f"{imported} favoris importés depuis {config.browser.title()}",
            count=imported,
            status="success",
        ))
        total_imported += imported

    await db.commit()

    # Générer les thumbnails en arrière-plan pour les nouveaux favoris
    if new_bookmark_urls:
        for url in new_bookmark_urls:
            background_tasks.add_task(generate_thumbnail, url)

    return {
        "imported": total_imported,
        "browsers": len(configs),
        "thumbnails_queued": len(new_bookmark_urls),
        "collections_created": collections_created
    }


@app.get("/api/sync/logs", response_model=list[SyncLogOut])
async def get_sync_logs(limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SyncLog).order_by(SyncLog.synced_at.desc()).limit(limit))
    return result.scalars().all()


@app.get("/api/sync/browsers", response_model=list[BrowserConfigOut])
async def get_browser_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BrowserConfig))
    return result.scalars().all()


@app.patch("/api/sync/browsers/{browser}")
async def update_browser_config(browser: str, enabled: bool, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BrowserConfig).where(BrowserConfig.browser == browser))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(404, "Browser not found")
    config.enabled = enabled
    await db.commit()
    return {"ok": True}


@app.delete("/api/sync/browsers/{browser}/bookmarks")
async def delete_browser_bookmarks(browser: str, db: AsyncSession = Depends(get_db)):
    """Delete all bookmarks from a specific browser to allow re-import."""
    result = await db.execute(delete(Bookmark).where(Bookmark.browser == browser))
    await db.commit()
    return {"ok": True, "deleted": result.rowcount}


# --- Stats ---

@app.get("/api/stats", response_model=StatsOut)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count()).select_from(Bookmark))).scalar() or 0
    favs = (await db.execute(select(func.count()).select_from(Bookmark).where(Bookmark.is_favorite == True))).scalar() or 0
    tags = (await db.execute(select(func.count()).select_from(Tag))).scalar() or 0
    browsers = (await db.execute(select(func.count(func.distinct(Bookmark.browser))).select_from(Bookmark))).scalar() or 0

    browser_counts = {}
    for row in (await db.execute(
        select(Bookmark.browser, func.count()).group_by(Bookmark.browser)
    )).all():
        browser_counts[row[0]] = row[1]

    return StatsOut(
        total_bookmarks=total,
        total_browsers=browsers,
        total_tags=tags,
        favorites_count=favs,
        browser_counts=browser_counts,
    )


# --- Thumbnails ---

@app.get("/api/thumbnails/{bookmark_id}")
async def get_thumbnail(bookmark_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Get or generate thumbnail for a bookmark."""
    result = await db.execute(select(Bookmark).where(Bookmark.id == bookmark_id))
    bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise HTTPException(404, "Bookmark not found")

    # Try to get existing thumbnail or generate new one
    thumbnail_path = await get_or_generate_thumbnail(bookmark.url)

    if thumbnail_path and thumbnail_path.exists():
        return FileResponse(
            thumbnail_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=86400"}  # Cache for 1 day
        )

    # If thumbnail generation failed, return fallback image
    fallback_path = Path(__file__).parent / "data" / "thumbnails" / "fallback.jpg"
    if fallback_path.exists():
        return FileResponse(
            fallback_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=3600"}  # Cache for 1 hour
        )

    # Ultimate fallback if fallback image doesn't exist
    raise HTTPException(404, "Thumbnail not available")


@app.post("/api/thumbnails/generate-all")
async def trigger_thumbnail_generation(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Générer les thumbnails pour tous les favoris qui n'en ont pas encore."""
    from thumbnail_service import get_thumbnail_path

    result = await db.execute(select(Bookmark))
    bookmarks = result.scalars().all()

    queued = 0
    for bookmark in bookmarks:
        # Vérifier si le thumbnail existe déjà
        thumbnail_path = get_thumbnail_path(bookmark.url)
        if not thumbnail_path.exists():
            background_tasks.add_task(generate_thumbnail, bookmark.url)
            queued += 1

    return {"status": "generating", "total": len(bookmarks), "queued": queued, "already_cached": len(bookmarks) - queued}


# --- Favicons ---

@app.get("/api/favicons/{filename}")
async def get_favicon(filename: str):
    """Serve cached favicon files."""
    favicon_path = FAVICON_DIR / filename

    if favicon_path.exists() and favicon_path.is_file():
        return FileResponse(
            favicon_path,
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=604800"}  # Cache for 1 week
        )

    raise HTTPException(404, "Favicon not found")


@app.post("/api/favicons/refresh-all")
async def refresh_all_favicons(db: AsyncSession = Depends(get_db)):
    """Refresh favicons for all bookmarks and update database."""
    result = await db.execute(select(Bookmark))
    bookmarks = result.scalars().all()

    updated = 0
    for bookmark in bookmarks:
        # Fetch favicon synchronously and update bookmark
        new_favicon_url = await get_or_fetch_favicon(bookmark.url)
        if new_favicon_url != bookmark.favicon_url:
            bookmark.favicon_url = new_favicon_url
            updated += 1

    await db.commit()
    return {"status": "completed", "total": len(bookmarks), "updated": updated}


def _bookmark_to_out(b: Bookmark) -> BookmarkOut:
    return BookmarkOut(
        id=b.id, title=b.title, url=b.url, domain=b.domain,
        description=b.description, favicon_url=b.favicon_url,
        browser=b.browser, folder=b.folder, is_favorite=b.is_favorite,
        visit_count=b.visit_count, note=b.note, added_at=b.added_at,
        last_visited=b.last_visited,
        tags=[TagOut(id=t.id, name=t.name, color=t.color) for t in b.tags],
        collections=[CollectionOut(id=c.id, name=c.name, icon=c.icon) for c in b.collections],
    )
