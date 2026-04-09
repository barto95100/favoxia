import hashlib
import asyncio
import platform
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image
import io

THUMBNAIL_DIR = Path(__file__).parent / "data" / "thumbnails"
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)


def get_thumbnail_path(url: str) -> Path:
    """Generate a unique filename for the thumbnail based on URL hash."""
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return THUMBNAIL_DIR / f"{url_hash}.jpg"


async def generate_thumbnail(url: str, width: int = 600, height: int = 400) -> Path | None:
    """
    Generate a thumbnail for a given URL using Playwright.

    Args:
        url: The URL to screenshot
        width: Desired thumbnail width
        height: Desired thumbnail height

    Returns:
        Path to the thumbnail file, or None if generation failed
    """
    # Check if thumbnail already exists
    thumbnail_path = get_thumbnail_path(url)
    if thumbnail_path.exists():
        return thumbnail_path

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )

            if platform.system() == "Darwin":
                ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            else:
                ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

            context = await browser.new_context(
                viewport={'width': 1280, 'height': 800},
                user_agent=ua
            )

            page = await context.new_page()

            # Try multiple strategies to load the page
            page_loaded = False

            # Strategy 1: Try networkidle with longer timeout
            try:
                await page.goto(url, wait_until='networkidle', timeout=20000)
                page_loaded = True
            except Exception:
                pass

            # Strategy 2: If networkidle failed, try domcontentloaded
            if not page_loaded:
                try:
                    await page.goto(url, wait_until='domcontentloaded', timeout=15000)
                    page_loaded = True
                except Exception:
                    pass

            # Strategy 3: Last resort - just load whatever is visible
            if not page_loaded:
                await page.goto(url, wait_until='commit', timeout=10000)

            # Wait a bit for content to render (especially for auth pages)
            await asyncio.sleep(2)

            # Take screenshot
            screenshot_bytes = await page.screenshot(type='jpeg', quality=85, full_page=False)

            await browser.close()

            # Resize image to desired dimensions
            img = Image.open(io.BytesIO(screenshot_bytes))
            img.thumbnail((width, height), Image.Resampling.LANCZOS)

            # Save thumbnail
            img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)

            return thumbnail_path

    except Exception as e:
        print(f"[thumbnail] Failed to generate thumbnail for {url}: {e}")
        return None


async def get_or_generate_thumbnail(url: str) -> Path | None:
    """
    Get existing thumbnail or generate a new one.

    Returns:
        Path to the thumbnail file, or None if unavailable
    """
    thumbnail_path = get_thumbnail_path(url)

    if thumbnail_path.exists():
        return thumbnail_path

    return await generate_thumbnail(url)
