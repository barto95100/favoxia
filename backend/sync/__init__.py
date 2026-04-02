from sync.chrome import ChromeSync
from sync.firefox import FirefoxSync
from sync.safari import SafariSync
from sync.edge import EdgeSync
from sync.brave import BraveSync
from sync.arc import ArcSync

BROWSER_SYNCS = {
    "chrome": ChromeSync,
    "firefox": FirefoxSync,
    "safari": SafariSync,
    "edge": EdgeSync,
    "brave": BraveSync,
    "arc": ArcSync,
}

__all__ = ["BROWSER_SYNCS", "ChromeSync", "FirefoxSync", "SafariSync", "EdgeSync", "BraveSync", "ArcSync"]
