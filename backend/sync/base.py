import json
import sqlite3
import shutil
import tempfile
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse


@dataclass
class RawBookmark:
    title: str
    url: str
    folder: str | None = None
    added_at: float | None = None  # unix timestamp


class BrowserSync(ABC):
    """Base class for browser bookmark synchronization."""

    browser_name: str = ""

    @abstractmethod
    def get_profile_paths(self) -> list[Path]:
        """Return list of possible bookmark file paths for this browser."""
        ...

    @abstractmethod
    def parse_bookmarks(self, path: Path) -> list[RawBookmark]:
        """Parse bookmarks from the browser's bookmark file."""
        ...

    def sync(self) -> list[RawBookmark]:
        """Main sync entry point. Finds and parses bookmarks."""
        all_bookmarks: list[RawBookmark] = []
        for path in self.get_profile_paths():
            if path.exists():
                try:
                    bookmarks = self.parse_bookmarks(path)
                    all_bookmarks.extend(bookmarks)
                except Exception as e:
                    print(f"[{self.browser_name}] Error parsing {path}: {e}")
        return all_bookmarks

    @staticmethod
    def extract_domain(url: str) -> str:
        try:
            parsed = urlparse(url)
            return parsed.netloc or parsed.path
        except Exception:
            return url

    @staticmethod
    def safe_copy_sqlite(db_path: Path) -> Path:
        """Copy a locked SQLite database to a temp file for safe reading."""
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        shutil.copy2(db_path, tmp.name)
        return Path(tmp.name)


class ChromiumSync(BrowserSync):
    """Base for Chromium-based browsers (Chrome, Edge, Brave)."""

    def parse_bookmarks(self, path: Path) -> list[RawBookmark]:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        bookmarks: list[RawBookmark] = []
        roots = data.get("roots", {})
        for root_name, root_node in roots.items():
            if isinstance(root_node, dict):
                self._walk_chromium_tree(root_node, root_name, bookmarks)
        return bookmarks

    def _walk_chromium_tree(self, node: dict, folder: str, out: list[RawBookmark]):
        if node.get("type") == "url":
            url = node.get("url", "")
            if url.startswith(("http://", "https://")):
                added_ts = node.get("date_added")
                added_at = None
                if added_ts:
                    # Chrome uses microseconds since 1601-01-01
                    try:
                        added_at = (int(added_ts) - 11644473600000000) / 1_000_000
                    except (ValueError, OverflowError):
                        pass
                out.append(RawBookmark(
                    title=node.get("name", ""),
                    url=url,
                    folder=folder,
                    added_at=added_at,
                ))
        for child in node.get("children", []):
            child_folder = f"{folder} / {node.get('name', '')}" if node.get("name") else folder
            self._walk_chromium_tree(child, child_folder, out)
