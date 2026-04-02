import platform
import sqlite3
from pathlib import Path
from sync.base import BrowserSync, RawBookmark


class FirefoxSync(BrowserSync):
    browser_name = "firefox"

    def get_profile_paths(self) -> list[Path]:
        system = platform.system()
        home = Path.home()

        if system == "Darwin":
            base = home / "Library" / "Application Support" / "Firefox" / "Profiles"
        elif system == "Windows":
            base = home / "AppData" / "Roaming" / "Mozilla" / "Firefox" / "Profiles"
        else:
            base = home / ".mozilla" / "firefox"

        paths = []
        if base.exists():
            for profile_dir in base.iterdir():
                if profile_dir.is_dir():
                    db_path = profile_dir / "places.sqlite"
                    if db_path.exists():
                        paths.append(db_path)
        return paths

    def parse_bookmarks(self, path: Path) -> list[RawBookmark]:
        """
        Parse Firefox bookmarks with proper folder hierarchy and French names.

        Firefox root folders:
        - ID 2: 'menu' → Menu des marque-pages
        - ID 3: 'toolbar' → Barre personnelle
        - ID 4: 'tags' → Tags
        - ID 5: 'unfiled' → Autres marque-pages
        - ID 6: 'mobile' → Mobile
        """
        tmp_path = self.safe_copy_sqlite(path)
        bookmarks: list[RawBookmark] = []

        # Mapping of Firefox internal folder names to user-friendly French names
        FIREFOX_FOLDER_NAMES = {
            "menu": "Menu des marque-pages",
            "toolbar": "Barre personnelle",
            "unfiled": "Autres marque-pages",
            "mobile": "Mobile",
            "tags": "Tags",
        }

        try:
            conn = sqlite3.connect(str(tmp_path))
            cursor = conn.cursor()

            # Build a map of all folders with their parent IDs for hierarchy reconstruction
            cursor.execute("""
                SELECT id, title, parent, type
                FROM moz_bookmarks
                WHERE type = 2
            """)
            folders = {}
            for folder_id, title, parent_id, folder_type in cursor.fetchall():
                folders[folder_id] = {
                    'title': title,
                    'parent': parent_id,
                }

            # Get all bookmarks with their immediate parent info
            cursor.execute("""
                SELECT b.id, b.title, p.url, b.dateAdded, b.parent
                FROM moz_bookmarks b
                JOIN moz_places p ON b.fk = p.id
                WHERE b.type = 1
                AND p.url LIKE 'http%'
            """)

            def build_folder_path(parent_id: int) -> str:
                """Build full folder path from parent hierarchy."""
                path_parts = []
                current_id = parent_id
                visited = set()

                while current_id and current_id not in visited:
                    visited.add(current_id)

                    if current_id in folders:
                        folder = folders[current_id]
                        folder_title = folder['title']

                        # Map root folders to French names
                        if folder_title in FIREFOX_FOLDER_NAMES:
                            folder_title = FIREFOX_FOLDER_NAMES[folder_title]

                        # Add to path if not the root (ID 1)
                        if folder_title:
                            path_parts.insert(0, folder_title)

                        current_id = folder['parent']
                    else:
                        break

                return " / ".join(["Firefox"] + path_parts) if path_parts else "Firefox"

            for bookmark_id, title, url, date_added, parent_id in cursor.fetchall():
                added_at = date_added / 1_000_000 if date_added else None
                folder_path = build_folder_path(parent_id)

                bookmarks.append(RawBookmark(
                    title=title or "",
                    url=url,
                    folder=folder_path,
                    added_at=added_at,
                ))

            conn.close()
        finally:
            tmp_path.unlink(missing_ok=True)

        return bookmarks
