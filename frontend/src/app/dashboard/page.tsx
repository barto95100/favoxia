"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BookmarkCard } from "@/components/BookmarkCard";
import { SettingsModal } from "@/components/SettingsModal";
import { BookmarkDetailsModal } from "@/components/BookmarkDetailsModal";
import { FilterPanel, type FilterOptions } from "@/components/FilterPanel";
import { api, type Bookmark, type Tag, type Collection, type Stats, type BrowserConfig } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";

export default function DashboardPage() {
  const { addNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeBrowser, setActiveBrowser] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // desc = plus récent en premier

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Filter options
  const [filters, setFilters] = useState<FilterOptions>({
    selectedTags: [],
    selectedCollections: [],
    hasNotes: null,
    inCollections: null,
    dateRange: "all",
  });

  // Data from API
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [browserConfigs, setBrowserConfigs] = useState<BrowserConfig[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("[Dashboard] Starting loadData...");
    try {
      setLoading(true);
      console.log("[Dashboard] Loading set to true, fetching data...");
      const [bookmarksData, tagsData, collectionsData, statsData, configsData] = await Promise.all([
        api.bookmarks.list(),
        api.tags.list(),
        api.collections.list(),
        api.stats(),
        api.sync.browsers(),
      ]);
      console.log("[Dashboard] All data fetched successfully");
      setBookmarks(bookmarksData);
      setTags(tagsData);
      setCollections(collectionsData);
      setStats(statsData);
      setBrowserConfigs(configsData);
      console.log("[Dashboard] State updated with new data");
    } catch (error) {
      console.error("[Dashboard] Failed to load data:", error);
    } finally {
      console.log("[Dashboard] Setting loading to false");
      setLoading(false);
    }
  };

  // Calculate browser data from bookmarks (only show enabled browsers)
  const browsers = [
    { name: "Chrome", key: "chrome", color: "#F59E0B" },
    { name: "Firefox", key: "firefox", color: "#F97316" },
    { name: "Safari", key: "safari", color: "#3B82F6" },
    { name: "Edge", key: "edge", color: "#06B6D4" },
    { name: "Brave", key: "brave", color: "#EF4444" },
    { name: "Arc", key: "arc", color: "#A855F7" },
  ]
    .filter(browser => {
      const config = browserConfigs.find(bc => bc.browser === browser.key);
      return config?.enabled ?? false;
    })
    .map(browser => ({
      ...browser,
      count: stats?.browser_counts[browser.key] || 0,
    }));

  // Prepare tags with counts
  const tagsWithCounts = tags.map(tag => ({
    name: tag.name,
    color: tag.color,
    count: tag.bookmark_count || 0,
  }));

  // Prepare collections with counts
  const collectionsWithCounts = collections.map(collection => ({
    name: collection.name,
    icon: collection.icon,
    count: collection.bookmark_count || 0,
  }));

  // Filter bookmarks
  const filtered = bookmarks
    .filter((b) => {
      // Sidebar filters
      if (activeBrowser && b.browser !== activeBrowser) return false;
      if (activeTag && !b.tags.some((t) => t.name === activeTag)) return false;
      if (activeCollection && !b.collections.some((c) => c.name === activeCollection)) return false;

      // Search filter
      if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.domain.includes(search.toLowerCase())) return false;

      // Advanced filters - Tags
      if (filters.selectedTags.length > 0) {
        if (!b.tags.some((t) => filters.selectedTags.includes(t.name))) return false;
      }

      // Advanced filters - Collections
      if (filters.selectedCollections.length > 0) {
        if (!b.collections.some((c) => filters.selectedCollections.includes(c.name))) return false;
      }

      // Advanced filters - Has notes
      if (filters.hasNotes !== null) {
        const hasNote = b.note !== null && b.note.trim() !== "";
        if (filters.hasNotes && !hasNote) return false;
      }

      // Advanced filters - In collections
      if (filters.inCollections !== null) {
        const inCollection = b.collections.length > 0;
        if (filters.inCollections && !inCollection) return false;
      }

      // Advanced filters - Date range
      if (filters.dateRange !== "all") {
        const addedDate = new Date(b.added_at);
        const now = new Date();

        if (filters.dateRange === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (addedDate < today) return false;
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (addedDate < weekAgo) return false;
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (addedDate < monthAgo) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.added_at).getTime();
      const dateB = new Date(b.added_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Handle browser click
  const handleBrowserClick = (browserKey: string | null) => {
    setActiveBrowser(browserKey);
  };

  // Handle tag click
  const handleTagClick = (tagName: string | null) => {
    setActiveTag(tagName);
  };

  // Handle collection click
  const handleCollectionClick = (collectionName: string | null) => {
    setActiveCollection(collectionName);
    setActiveBrowser(null);
    setActiveTag(null);
  };

  // Sync bookmarks from browsers
  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await api.sync.trigger();
      // Reload data after sync
      await loadData();

      // Show success notification with details
      if (result.imported > 0) {
        addNotification(
          "success",
          `${result.imported} nouveaux favoris importés`,
          result.collections_created > 0
            ? `${result.collections_created} ${result.collections_created === 1 ? 'collection créée' : 'collections créées'} automatiquement`
            : undefined
        );
      } else {
        addNotification("info", "Synchronisation terminée", "Aucun nouveau favori trouvé");
      }
    } catch (error) {
      console.error("Sync failed:", error);
      addNotification("error", "Échec de la synchronisation", "Vérifiez la console pour plus de détails");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[var(--bh-text-muted)]">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        search={search}
        onSearchChange={setSearch}
        onSync={handleSync}
        syncing={syncing}
        onSettingsClick={() => setSettingsOpen(true)}
        onFilterClick={() => setFilterPanelOpen(!filterPanelOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          browsers={browsers}
          tags={tagsWithCounts}
          collections={collectionsWithCounts}
          activeBrowser={activeBrowser}
          activeTag={activeTag}
          activeCollection={activeCollection}
          onBrowserClick={handleBrowserClick}
          onTagClick={handleTagClick}
          onCollectionClick={handleCollectionClick}
        />
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              {activeCollection ? activeCollection : activeBrowser ? browsers.find(b => b.key === activeBrowser)?.name : activeTag ? activeTag : "Tous les favoris"}{" "}
              <span className="font-mono text-sm text-[var(--bh-text-muted)]">({filtered.length})</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]" : "text-[var(--bh-text-muted)] hover:bg-[var(--bh-glass-bg)]"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]" : "text-[var(--bh-text-muted)] hover:bg-[var(--bh-glass-bg)]"}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="ml-2 flex items-center gap-1.5 rounded-lg border border-[var(--bh-border)] px-3 py-1.5 text-[12px] text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:border-[var(--bh-primary)] hover:text-[var(--bh-primary)] hover:scale-105"
                title={sortOrder === "desc" ? "Plus récents en premier (cliquer pour inverser)" : "Plus anciens en premier (cliquer pour inverser)"}
              >
                {sortOrder === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                Date ajout
              </button>
            </div>
          </div>

          {/* Bookmark Grid/List */}
          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="text-5xl">📚</div>
              <h2 className="text-lg font-semibold text-[var(--bh-text-primary)]">
                Aucun favori trouvé
              </h2>
              <p className="text-sm text-[var(--bh-text-muted)]">
                Cliquez sur le bouton de synchronisation pour importer vos favoris depuis vos navigateurs.
              </p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="mt-4 rounded-lg bg-[var(--bh-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {syncing ? "Synchronisation..." : "Synchroniser maintenant"}
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((bk) => (
                <BookmarkCard
                  key={bk.id}
                  bookmark={bk}
                  onOpen={() => setSelectedBookmark(bk)}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((bk) => (
                <BookmarkCard
                  key={bk.id}
                  bookmark={bk}
                  onOpen={() => setSelectedBookmark(bk)}
                  variant="list"
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onUpdate={loadData} />
      <BookmarkDetailsModal
        bookmark={selectedBookmark}
        isOpen={selectedBookmark !== null}
        onClose={() => setSelectedBookmark(null)}
        onUpdate={loadData}
      />
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={tags}
        availableCollections={collections}
      />
    </div>
  );
}
