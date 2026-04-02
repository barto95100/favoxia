import platform
from pathlib import Path
from sync.base import ChromiumSync


class EdgeSync(ChromiumSync):
    browser_name = "edge"

    def get_profile_paths(self) -> list[Path]:
        system = platform.system()
        home = Path.home()

        if system == "Darwin":
            base = home / "Library" / "Application Support" / "Microsoft Edge"
        elif system == "Windows":
            base = home / "AppData" / "Local" / "Microsoft" / "Edge" / "User Data"
        else:
            base = home / ".config" / "microsoft-edge"

        paths = []
        for profile in ["Default", "Profile 1", "Profile 2"]:
            paths.append(base / profile / "Bookmarks")
        return paths
