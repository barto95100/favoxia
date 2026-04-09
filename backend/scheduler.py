"""
Automatic sync scheduler for Favoxia.
Checks browser configurations and syncs bookmarks automatically based on sync_frequency.
"""
from datetime import datetime, timedelta
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from models import BrowserConfig, Bookmark, SyncLog, Collection, Notification
from sync import BROWSER_SYNCS
from database import DATABASE_URL
from urllib.parse import urlparse
from favicon_service import get_or_fetch_favicon

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create async engine and session for the scheduler
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def auto_sync_browsers():
    """Check and sync browsers that are due for automatic synchronization."""
    async with async_session() as db:
        try:
            # Get all enabled browsers
            result = await db.execute(
                select(BrowserConfig).where(BrowserConfig.enabled == True)
            )
            configs = result.scalars().all()

            now = datetime.utcnow()
            synced_browsers = []

            for config in configs:
                # Check if sync is needed based on last_sync + sync_frequency
                if config.last_sync is None:
                    # Never synced before, sync now
                    should_sync = True
                else:
                    next_sync_time = config.last_sync + timedelta(minutes=config.sync_frequency)
                    should_sync = now >= next_sync_time

                if should_sync:
                    logger.info(f"Auto-syncing {config.browser} (frequency: {config.sync_frequency} minutes)")

                    syncer_cls = BROWSER_SYNCS.get(config.browser)
                    if not syncer_cls:
                        logger.warning(f"No syncer found for {config.browser}")
                        continue

                    try:
                        syncer = syncer_cls()
                        raw_bookmarks = syncer.sync()

                        imported = 0
                        collections_created = 0

                        # Helper function to get or create collection
                        async def get_or_create_collection(collection_name: str, icon: str = "📁") -> Collection:
                            nonlocal collections_created
                            result = await db.execute(select(Collection).where(Collection.name == collection_name))
                            collection = result.scalar_one_or_none()
                            if not collection:
                                collection = Collection(name=collection_name, icon=icon)
                                db.add(collection)
                                await db.flush()
                                collections_created += 1
                            return collection

                        for rb in raw_bookmarks:
                            # Check if bookmark already exists
                            existing = await db.execute(
                                select(Bookmark).where(Bookmark.url == rb.url)
                            )
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
                                    min_date = datetime(2000, 1, 1)
                                    max_date = datetime.utcnow() + timedelta(days=1)
                                    if added_at < min_date or added_at > max_date:
                                        logger.warning(f"Invalid date for {rb.title}: {added_at}, using current time")
                                        added_at = datetime.utcnow()
                                except (ValueError, OSError):
                                    logger.warning(f"Invalid timestamp for {rb.title}, using current time")
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
                                folder_path = rb.folder
                                if folder_path.startswith("Arc / "):
                                    folder_path = folder_path[6:]

                                if folder_path:
                                    icon = "📁"
                                    if "Pinned" in folder_path or "pinned" in folder_path:
                                        icon = "📌"
                                    elif "Work" in folder_path or "Travail" in folder_path:
                                        icon = "💼"
                                    elif "Personal" in folder_path:
                                        icon = "👤"

                                    collection = await get_or_create_collection(folder_path, icon)
                                    bookmark.collections.append(collection)

                            db.add(bookmark)
                            imported += 1

                        # Update config
                        config.last_sync = now
                        config.bookmark_count = config.bookmark_count + imported

                        # Log the sync
                        db.add(SyncLog(
                            browser=config.browser,
                            action=f"Auto-sync: {imported} favoris importés",
                            count=imported,
                            status="success",
                        ))

                        # Create notification for auto-sync if bookmarks were imported
                        if imported > 0:
                            browser_name = config.browser.capitalize()
                            message = f"{imported} nouveau{'x' if imported > 1 else ''} favori{'s' if imported > 1 else ''} depuis {browser_name}"

                            notification = Notification(
                                type="sync",
                                title="Synchronisation automatique",
                                message=message,
                                is_read=False
                            )
                            db.add(notification)

                        await db.commit()
                        synced_browsers.append(config.browser)

                        logger.info(f"Auto-synced {config.browser}: {imported} new bookmarks, {collections_created} collections created")

                    except Exception as e:
                        logger.error(f"Error auto-syncing {config.browser}: {e}")
                        db.add(SyncLog(
                            browser=config.browser,
                            action=f"Auto-sync failed: {str(e)}",
                            count=0,
                            status="error",
                        ))
                        await db.commit()

            if synced_browsers:
                logger.info(f"Auto-sync completed for: {', '.join(synced_browsers)}")

        except Exception as e:
            logger.error(f"Error in auto_sync_browsers: {e}")


def run_auto_sync():
    """Wrapper to run async auto_sync_browsers in sync context."""
    import asyncio
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(auto_sync_browsers())
    except Exception as e:
        logger.error(f"Error running auto sync: {e}")
    finally:
        loop.close()


# Global scheduler instance
scheduler = None


def start_scheduler():
    """Start the background scheduler for automatic syncs."""
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already started")
        return

    scheduler = BackgroundScheduler()

    # Run auto-sync every minute to check if any browser needs syncing
    scheduler.add_job(
        run_auto_sync,
        trigger=IntervalTrigger(minutes=1),
        id='auto_sync_job',
        name='Auto-sync bookmarks',
        replace_existing=True
    )

    scheduler.start()
    logger.info("Scheduler started - checking for auto-sync every minute")


def stop_scheduler():
    """Stop the background scheduler."""
    global scheduler

    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler stopped")
