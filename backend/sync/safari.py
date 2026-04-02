import plistlib
import platform
from pathlib import Path
from sync.base import BrowserSync, RawBookmark


class SafariSync(BrowserSync):
    browser_name = "safari"

    def get_profile_paths(self) -> list[Path]:
        if platform.system() != "Darwin":
            return []
        return [Path.home() / "Library" / "Safari" / "Bookmarks.plist"]

    def parse_bookmarks(self, path: Path) -> list[RawBookmark]:
        with open(path, "rb") as f:
            data = plistlib.load(f)

        bookmarks: list[RawBookmark] = []
        self._walk_safari_tree(data, "Safari", bookmarks)
        return bookmarks

    def _walk_safari_tree(self, node: dict, folder: str, out: list[RawBookmark]):
        if node.get("WebBookmarkType") == "WebBookmarkTypeLeaf":
            url = node.get("URLString", "")
            if url.startswith(("http://", "https://")):
                title = node.get("URIDictionary", {}).get("title", "")

                # Safari stores dates as NSDate objects (Python datetime when loaded by plistlib)
                # Note: the key is "dateAdded" (lowercase d), not "DateAdded"
                added_at = None
                date_added = node.get("dateAdded")  # lowercase 'd'!

                if date_added:
                    try:
                        # If it's a datetime object, convert to Unix timestamp
                        if hasattr(date_added, 'timestamp'):
                            added_at = date_added.timestamp()
                        # If it's already a number (timestamp), use it directly
                        elif isinstance(date_added, (int, float)):
                            added_at = float(date_added)
                    except Exception as e:
                        print(f"[safari] Failed to extract date for '{title}': {e}, type: {type(date_added)}")

                out.append(RawBookmark(title=title, url=url, folder=folder, added_at=added_at))

        for child in node.get("Children", []):
            child_folder = folder
            if child.get("Title"):
                child_folder = f"{folder} / {child['Title']}"
            self._walk_safari_tree(child, child_folder, out)
