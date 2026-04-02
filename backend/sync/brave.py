import platform
from pathlib import Path
from sync.base import ChromiumSync


class BraveSync(ChromiumSync):
    browser_name = "brave"

    def get_profile_paths(self) -> list[Path]:
        system = platform.system()
        home = Path.home()

        if system == "Darwin":
            base = home / "Library" / "Application Support" / "BraveSoftware" / "Brave-Browser"
        elif system == "Windows":
            base = home / "AppData" / "Local" / "BraveSoftware" / "Brave-Browser" / "User Data"
        else:
            base = home / ".config" / "BraveSoftware" / "Brave-Browser"

        paths = []
        for profile in ["Default", "Profile 1"]:
            paths.append(base / profile / "Bookmarks")
        return paths
