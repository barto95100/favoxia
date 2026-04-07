"""
Service to fetch and store real favicons from websites.
Tries multiple strategies to get the best quality favicon.
"""
import hashlib
import logging
from pathlib import Path
from urllib.parse import urljoin, urlparse
import aiohttp
from bs4 import BeautifulSoup
import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import io

logger = logging.getLogger(__name__)

FAVICON_DIR = Path(__file__).parent / "data" / "favicons"
FAVICON_DIR.mkdir(parents=True, exist_ok=True)

# Timeout for favicon requests (in seconds)
FAVICON_TIMEOUT = 10

# Standard favicon size (in pixels)
FAVICON_SIZE = 32


def resize_favicon(image_path: Path, target_size: int = FAVICON_SIZE) -> bool:
    """
    Resize a favicon to the standard size (32x32 by default).
    Replaces the original file with the resized version to save disk space.

    Args:
        image_path: Path to the favicon image file
        target_size: Target size in pixels (width and height, defaults to 32)

    Returns:
        True if resizing was successful, False otherwise
    """
    try:
        with Image.open(image_path) as img:
            # Check current size
            width, height = img.size

            # If already the right size, nothing to do
            if width == target_size and height == target_size:
                logger.debug(f"Favicon already {target_size}x{target_size}: {image_path}")
                return True

            # Log if we're downsizing a large favicon
            if width > target_size or height > target_size:
                logger.info(f"Resizing favicon from {width}x{height} to {target_size}x{target_size}: {image_path}")

            # Convert to RGBA if necessary (for transparency support)
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGBA')

            # Resize with high-quality resampling
            resized = img.resize((target_size, target_size), Image.Resampling.LANCZOS)

            # Save as PNG (overwrite original to save space)
            resized.save(image_path, 'PNG', optimize=True)

            logger.debug(f"Successfully resized favicon to {target_size}x{target_size}")
            return True

    except Exception as e:
        logger.error(f"Error resizing favicon {image_path}: {e}")
        return False


def get_favicon_path(url: str) -> Path:
    """Generate a unique filename for the favicon based on domain hash."""
    domain = urlparse(url).netloc
    domain_hash = hashlib.md5(domain.encode()).hexdigest()
    return FAVICON_DIR / f"{domain_hash}.png"


def get_favicon_url_for_domain(domain: str) -> str:
    """Generate the local API URL for a favicon based on domain."""
    domain_hash = hashlib.md5(domain.encode()).hexdigest()
    return f"http://localhost:8000/api/favicons/{domain_hash}.png"


async def fetch_favicon(url: str) -> Path | None:
    """
    Fetch and store the real favicon for a given URL.

    Tries multiple strategies:
    1. Use Playwright to load page and extract favicon from browser
    2. Parse HTML to find <link rel="icon"> tags and download directly
    3. Try common favicon locations (/favicon.ico, /favicon.png)
    4. Fallback to Google Favicons API

    Args:
        url: The website URL to fetch favicon from

    Returns:
        Path to the saved favicon file, or None if failed
    """
    favicon_path = get_favicon_path(url)

    # If favicon already exists, return it
    if favicon_path.exists():
        return favicon_path

    domain = urlparse(url).netloc
    base_url = f"{urlparse(url).scheme}://{domain}"

    logger.info(f"Fetching favicon for {domain}")

    # Strategy 1: Use Playwright to extract favicon from loaded page
    try:
        playwright_favicon = await _extract_favicon_with_playwright(url, base_url, favicon_path)
        if playwright_favicon:
            return playwright_favicon
    except Exception as e:
        logger.debug(f"Playwright favicon extraction failed for {url}: {e}")

    # Strategy 2: Try traditional HTTP methods
    try:
        timeout = aiohttp.ClientTimeout(total=FAVICON_TIMEOUT)
        async with aiohttp.ClientSession(timeout=timeout) as session:

            # Parse HTML to find favicon links
            favicon_url = await _find_favicon_in_html(session, url, base_url)

            # Try common favicon locations
            if not favicon_url:
                favicon_url = await _try_common_locations(session, base_url)

            # Download the favicon
            if favicon_url:
                success = await _download_favicon(session, favicon_url, favicon_path)
                if success:
                    return favicon_path

    except Exception as e:
        logger.debug(f"HTTP favicon fetch failed for {url}: {e}")

    return None


async def _extract_favicon_with_playwright(url: str, base_url: str, save_path: Path) -> Path | None:
    """
    Use Playwright to load the page and extract the favicon from browser resources.
    This works even for pages with authentication because the browser loads the favicon automatically.
    """
    favicon_data = None
    favicon_captured = False

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            # Capture favicon from network responses
            # Prioritize smaller favicons over apple-touch-icons
            candidates = []

            async def handle_response(response):
                nonlocal candidates

                url_lower = response.url.lower()

                # Check if this is a favicon request
                # Skip apple-touch-icon (too large, usually 180x180 or 1024x1024)
                is_apple_touch = 'apple-touch-icon' in url_lower
                is_favicon = ('icon' in url_lower or 'favicon' in url_lower or
                             response.url.endswith('.ico') or
                             (response.url.endswith('.png') and 'logo' in url_lower))

                if is_favicon:
                    content_type = response.headers.get('content-type', '').lower()

                    # Make sure it's an image
                    if 'image' in content_type or response.url.endswith('.ico'):
                        try:
                            data = await response.body()
                            if len(data) > 50:  # Minimum size check
                                # Prioritize: .ico > favicon-32x32.png > favicon-16x16.png > other
                                priority = 3  # default priority
                                if response.url.endswith('.ico'):
                                    priority = 0  # highest
                                elif '32x32' in url_lower or 'favicon-32' in url_lower:
                                    priority = 1
                                elif '16x16' in url_lower or 'favicon-16' in url_lower:
                                    priority = 2
                                elif is_apple_touch:
                                    priority = 10  # lowest (use only if nothing else)

                                candidates.append((priority, response.url, data))
                                logger.debug(f"Found favicon candidate: {response.url} (priority={priority})")
                        except Exception:
                            pass

            page.on('response', handle_response)

            # Load the page
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=15000)
            except Exception:
                # Even if page load fails, we might have captured the favicon
                pass

            # Wait a bit to ensure all favicons are loaded
            await asyncio.sleep(1)

            await browser.close()

            # Choose the best favicon from candidates
            if candidates:
                # Sort by priority (lower number = higher priority)
                candidates.sort(key=lambda x: x[0])
                best_priority, best_url, best_data = candidates[0]

                logger.info(f"Selected best favicon: {best_url} (priority={best_priority})")

                with open(save_path, 'wb') as f:
                    f.write(best_data)

                # Resize to standard favicon size
                resize_favicon(save_path)
                return save_path

    except Exception as e:
        logger.debug(f"Playwright favicon extraction error: {e}")

    return None


async def _find_favicon_in_html(session: aiohttp.ClientSession, url: str, base_url: str) -> str | None:
    """Parse HTML to find favicon link tags."""
    try:
        async with session.get(url, allow_redirects=True) as response:
            if response.status != 200:
                return None

            html = await response.text()
            soup = BeautifulSoup(html, 'html.parser')

            # Look for various favicon link tags (ordered by preference)
            for rel in ['icon', 'shortcut icon', 'apple-touch-icon']:
                link = soup.find('link', rel=lambda r: r and rel in r.lower())
                if link and link.get('href'):
                    favicon_url = link['href']
                    # Convert relative URLs to absolute
                    return urljoin(base_url, favicon_url)

    except Exception as e:
        logger.debug(f"Could not parse HTML for favicon: {e}")

    return None


async def _try_common_locations(session: aiohttp.ClientSession, base_url: str) -> str | None:
    """Try common favicon file locations."""
    common_paths = [
        '/favicon.ico',
        '/favicon.png',
        '/apple-touch-icon.png',
        '/apple-touch-icon-precomposed.png',
    ]

    for path in common_paths:
        try:
            favicon_url = urljoin(base_url, path)
            async with session.head(favicon_url, allow_redirects=True) as response:
                if response.status == 200:
                    logger.debug(f"Found favicon at {favicon_url}")
                    return favicon_url
        except Exception:
            continue

    return None


async def _download_favicon(session: aiohttp.ClientSession, favicon_url: str, save_path: Path) -> bool:
    """Download and save the favicon image."""
    try:
        async with session.get(favicon_url, allow_redirects=True) as response:
            if response.status != 200:
                return False

            # Check if we got HTML instead of an image (common with auth pages)
            content_type = response.headers.get('Content-Type', '').lower()
            if 'text/html' in content_type:
                logger.warning(f"Received HTML instead of image from {favicon_url} (likely auth page)")
                return False

            content = await response.read()

            # Verify content is actually an image (minimum size check)
            if len(content) < 50:
                logger.warning(f"Favicon content too small from {favicon_url}")
                return False

            # Save the favicon
            with open(save_path, 'wb') as f:
                f.write(content)

            logger.info(f"Saved favicon to {save_path}")

            # Resize to standard favicon size
            resize_favicon(save_path)
            return True

    except Exception as e:
        logger.error(f"Error downloading favicon from {favicon_url}: {e}")
        return False


async def get_or_fetch_favicon(url: str) -> str:
    """
    Get existing favicon or fetch a new one.

    Returns:
        Local API URL for the favicon, or Google Favicons URL as fallback
    """
    domain = urlparse(url).netloc
    favicon_path = get_favicon_path(url)

    # If favicon exists locally, return the local API URL
    if favicon_path.exists():
        return get_favicon_url_for_domain(domain)

    # Try to fetch the favicon
    result = await fetch_favicon(url)

    if result and result.exists():
        return get_favicon_url_for_domain(domain)

    # Ultimate fallback to Google Favicons
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
