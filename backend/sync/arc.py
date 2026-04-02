import json
import platform
from pathlib import Path
from sync.base import BrowserSync, RawBookmark


class ArcSync(BrowserSync):
    """
    Arc browser sync.

    Arc doesn't use traditional bookmarks. Instead it uses:
    - Pinned Tabs in Spaces
    - Favorites Bar

    This parser extracts pinned tabs from StorableSidebar.json
    """
    browser_name = "arc"

    def get_profile_paths(self) -> list[Path]:
        if platform.system() != "Darwin":
            # Arc is currently macOS only
            return []

        base = Path.home() / "Library" / "Application Support" / "Arc"

        # Arc stores data in StorableSidebar.json
        sidebar_path = base / "StorableSidebar.json"

        # Also check for per-profile storage
        paths = [sidebar_path]

        # Check for User Data structure (if Arc changes its format)
        user_data = base / "User Data"
        if user_data.exists():
            for profile in ["Default", "Profile 1"]:
                profile_sidebar = user_data / profile / "StorableSidebar.json"
                if profile_sidebar.exists():
                    paths.append(profile_sidebar)

        return paths

    def parse_bookmarks(self, path: Path) -> list[RawBookmark]:
        """
        Parse Arc's StorableSidebar.json to extract pinned tabs.

        Arc's JSON structure (actual):
        {
          "sidebar": {
            "containers": [
              { "global": [] },
              {
                "spaces": ["space-id", {...full space object...}],
                "items": [
                  "item-id-string",
                  {
                    "id": "...",
                    "title": null,
                    "data": {
                      "tab": {
                        "savedURL": "https://...",
                        "savedTitle": "Tab Title"
                      }
                    },
                    "parentID": "space-or-container-id",
                    "createdAt": 796215252.28947
                  }
                ]
              }
            ]
          }
        }
        """
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            print(f"[arc] Error parsing {path}: {e}")
            return []

        bookmarks: list[RawBookmark] = []

        # Navigate through Arc's structure
        sidebar = data.get("sidebar", {})
        containers = sidebar.get("containers", [])

        # Skip first container (global), process second container with actual content
        for container_idx, container in enumerate(containers):
            # Skip global container
            if "global" in container and len(container.keys()) == 1:
                continue

            # Build maps for items and spaces
            items_map = {}
            container_to_space_map = {}  # Maps containerID -> space_title
            pinned_container_ids = set()  # Set of container UUIDs that contain pinned tabs

            # Process items
            items = container.get("items", [])
            for item in items:
                if isinstance(item, dict):
                    items_map[item.get("id")] = item

            # Process spaces - they can be IDs (strings) or full objects (dicts)
            spaces = container.get("spaces", [])
            for space in spaces:
                if isinstance(space, dict):
                    # Full space object
                    space_title = space.get("title", "Unnamed Space")

                    # Map all containerIDs to this space
                    container_ids = space.get("containerIDs", [])

                    # Arc structure: containerIDs = ['unpinned', UUID_unpinned, 'pinned', UUID_pinned]
                    # We only want tabs from UUID_pinned containers (position 3)
                    for idx, container_id in enumerate(container_ids):
                        if isinstance(container_id, str):
                            container_to_space_map[container_id] = space_title

                            # If this is right after 'pinned' label, it's a pinned container
                            if idx > 0 and container_ids[idx - 1] == 'pinned':
                                pinned_container_ids.add(container_id)
                        elif isinstance(container_id, dict):
                            # containerIDs can also be objects like {"pinned": {}}
                            for key in container_id.keys():
                                if key in ["pinned", "unpinned"]:
                                    # Map the keyword to the space
                                    container_to_space_map[key] = space_title

            # Helper function to check if tab is in a pinned container
            def is_tab_pinned(item_parent_id: str) -> bool:
                """Check if tab belongs to a pinned container by traversing parent hierarchy."""
                if not item_parent_id:
                    return False

                current_id = item_parent_id
                visited = set()

                while current_id and current_id not in visited:
                    visited.add(current_id)

                    # Check if this is a pinned container
                    if current_id in pinned_container_ids:
                        return True

                    # Move to parent
                    if current_id in items_map:
                        current_id = items_map[current_id].get("parentID")
                    else:
                        break

                return False

            # Helper function to build folder path recursively
            def build_folder_path(parent_id: str) -> list[str]:
                """Build folder path by traversing parent hierarchy."""
                path_parts = []

                current_id = parent_id
                visited = set()  # Prevent infinite loops

                while current_id and current_id not in visited:
                    visited.add(current_id)

                    # Check if this is a space
                    if current_id in container_to_space_map:
                        space_name = container_to_space_map[current_id]
                        path_parts.insert(0, space_name)
                        break

                    # Check if it's an item (folder/list)
                    if current_id in items_map:
                        current_item = items_map[current_id]
                        item_title = current_item.get("title")

                        # If it has a title, it's likely a named folder
                        if item_title:
                            path_parts.insert(0, item_title)

                        # Move to parent
                        current_id = current_item.get("parentID")
                    else:
                        break

                return path_parts

            # Extract tabs from all items (including nested in folders)
            for item_id, item in items_map.items():
                # Check if this item has tab data
                if "data" not in item:
                    continue

                tab_data = item.get("data", {}).get("tab", {})
                if not tab_data or "savedURL" not in tab_data:
                    continue

                # IMPORTANT: Only import pinned tabs, not open tabs
                parent_id = item.get("parentID")
                if not is_tab_pinned(parent_id):
                    continue

                url = tab_data.get("savedURL", "")
                title = tab_data.get("savedTitle", "")

                # Get creation timestamp
                added_at = None
                created_at = item.get("createdAt")
                if created_at:
                    try:
                        # Arc timestamps are in seconds (not milliseconds)
                        added_at = float(created_at)
                    except (ValueError, TypeError):
                        pass

                # Build folder path from parent hierarchy
                parent_id = item.get("parentID")
                folder_parts = ["Arc"]

                if parent_id:
                    path_parts = build_folder_path(parent_id)
                    if path_parts:
                        folder_parts.extend(path_parts)

                    # Check if parent is a pinned container
                    if parent_id in container_to_space_map:
                        folder_parts.append("Pinned")
                    elif parent_id in items_map:
                        parent_item = items_map[parent_id]
                        # If parent is an itemContainer (no title), check if it's pinned
                        if not parent_item.get("title") and "itemContainer" in parent_item.get("data", {}):
                            # This is a direct container - check parent for space
                            container_parent = parent_item.get("parentID")
                            if container_parent in container_to_space_map:
                                # Check if this container is the pinned one
                                # We can identify pinned containers vs other containers
                                folder_parts.append("Pinned")

                folder = " / ".join(folder_parts)

                # Only add valid URLs
                if url and url.startswith(("http://", "https://")):
                    bookmarks.append(RawBookmark(
                        title=title or url,
                        url=url,
                        folder=folder,
                        added_at=added_at
                    ))

        return bookmarks
