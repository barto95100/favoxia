import platform
from pathlib import Path
from sync.base import ChromiumSync


class ChromeSync(ChromiumSync):
    browser_name = "chrome"

    def get_profile_paths(self) -> list[Path]:
        system = platform.system()
        home = Path.home()

        if system == "Darwin":
            base = home / "Library" / "Application Support" / "Google" / "Chrome"
        elif system == "Windows":
            base = home / "AppData" / "Local" / "Google" / "Chrome" / "User Data"
        else:  # Linux
            base = home / ".config" / "google-chrome"

        paths = []
        for profile in ["Default", "Profile 1", "Profile 2", "Profile 3"]:
            paths.append(base / profile / "Bookmarks")
        return paths
