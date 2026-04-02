"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Edit2, RefreshCw, Palette } from "lucide-react";
import { api, type Tag, type Collection } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { themes, applyTheme, loadTheme } from "@/lib/themes";

interface BrowserConfig {
  id: number;
  browser: string;
  enabled: boolean;
  sync_frequency: number;
  last_sync: string | null;
  bookmark_count: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const BROWSER_LABELS: Record<string, string> = {
  chrome: "Chrome",
  firefox: "Firefox",
  safari: "Safari",
  edge: "Edge",
  brave: "Brave",
  arc: "Arc",
};

const BROWSER_ICONS: Record<string, string> = {
  chrome: "🟡",
  firefox: "🟠",
  safari: "🔵",
  edge: "🔷",
  brave: "🔴",
  arc: "🟣",
};

type TabType = "browsers" | "tags" | "collections" | "interface" | "themes";

interface UIPreferences {
  showBrowsers: boolean;
  showCollections: boolean;
  showTags: boolean;
}

export function SettingsModal({ isOpen, onClose, onUpdate }: SettingsModalProps) {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType>("browsers");
  const [browsers, setBrowsers] = useState<BrowserConfig[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<{ id: number; name: string; color: string } | null>(null);
  const [editingCollection, setEditingCollection] = useState<{ id: number; name: string; icon: string } | null>(null);
  const [uiPreferences, setUiPreferences] = useState<UIPreferences>({
    showBrowsers: true,
    showCollections: true,
    showTags: true,
  });
  const [currentTheme, setCurrentTheme] = useState<string>('favoxia');

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadUIPreferences();
      setCurrentTheme(loadTheme());
    }
  }, [isOpen]);

  const loadUIPreferences = () => {
    try {
      const stored = localStorage.getItem('favoxia_ui_preferences');
      if (stored) {
        setUiPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load UI preferences:', error);
    }
  };

  const saveUIPreferences = (prefs: UIPreferences) => {
    try {
      localStorage.setItem('favoxia_ui_preferences', JSON.stringify(prefs));
      setUiPreferences(prefs);
      // Trigger reload to update sidebar
      window.dispatchEvent(new Event('favoxia_ui_preferences_changed'));
      addNotification("success", "Préférences sauvegardées", "Les préférences d'interface ont été mises à jour");
    } catch (error) {
      console.error('Failed to save UI preferences:', error);
      addNotification("error", "Erreur", "Impossible de sauvegarder les préférences");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [browsersData, tagsData, collectionsData] = await Promise.all([
        api.sync.browsers(),
        api.tags.list(),
        api.collections.list(),
      ]);
      setBrowsers(browsersData);
      setTags(tagsData);
      setCollections(collectionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBrowser = async (browser: string, enabled: boolean) => {
    try {
      await api.sync.updateBrowser(browser, enabled);
      setBrowsers((prev) =>
        prev.map((b) => (b.browser === browser ? { ...b, enabled } : b))
      );
      onUpdate?.();
    } catch (error) {
      console.error("Failed to toggle browser:", error);
    }
  };

  const syncBrowser = async (browser: string) => {
    try {
      const result = await api.sync.trigger(browser);
      await loadData();
      onUpdate?.();

      if (result.imported > 0) {
        addNotification("success", `Synchronisation de ${BROWSER_LABELS[browser]} terminée`, `${result.imported} nouveaux favoris importés`);
      } else {
        addNotification("info", `Synchronisation de ${BROWSER_LABELS[browser]} terminée`, "Aucun nouveau favori trouvé");
      }
    } catch (error) {
      console.error("Failed to sync browser:", error);
      addNotification("error", "Erreur lors de la synchronisation", `Impossible de synchroniser ${BROWSER_LABELS[browser]}`);
    }
  };

  const deleteBrowserBookmarks = async (browser: string) => {
    if (!confirm(`Supprimer tous les favoris de ${BROWSER_LABELS[browser]} ? Cette action est irréversible.`)) {
      return;
    }
    try {
      await api.bookmarks.deleteByBrowser(browser);
      await loadData();
      onUpdate?.();
      addNotification("success", "Favoris supprimés", `Tous les favoris de ${BROWSER_LABELS[browser]} ont été supprimés`);
    } catch (error) {
      console.error("Failed to delete bookmarks:", error);
      addNotification("error", "Erreur lors de la suppression", "Impossible de supprimer les favoris");
    }
  };

  const updateTag = async () => {
    if (!editingTag) return;
    try {
      await api.tags.update(editingTag.id, {
        name: editingTag.name,
        color: editingTag.color,
      });
      setTags((prev) =>
        prev.map((t) => (t.id === editingTag.id ? { ...t, name: editingTag.name, color: editingTag.color } : t))
      );
      setEditingTag(null);
      onUpdate?.();
      addNotification("success", "Tag mis à jour", `Le tag "${editingTag.name}" a été modifié`);
    } catch (error) {
      console.error("Failed to update tag:", error);
      addNotification("error", "Erreur lors de la mise à jour", "Impossible de modifier le tag");
    }
  };

  const deleteTag = async (id: number, name: string) => {
    if (!confirm(`Supprimer le tag "${name}" ? Il sera retiré de tous les favoris.`)) {
      return;
    }
    try {
      await api.tags.delete(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      onUpdate?.();
      addNotification("success", "Tag supprimé", `Le tag "${name}" a été supprimé`);
    } catch (error) {
      console.error("Failed to delete tag:", error);
      addNotification("error", "Erreur lors de la suppression", "Impossible de supprimer le tag");
    }
  };

  const updateCollection = async () => {
    if (!editingCollection) return;
    try {
      await api.collections.update(editingCollection.id, {
        name: editingCollection.name,
        icon: editingCollection.icon,
      });
      setCollections((prev) =>
        prev.map((c) => (c.id === editingCollection.id ? { ...c, name: editingCollection.name, icon: editingCollection.icon } : c))
      );
      setEditingCollection(null);
      onUpdate?.();
      addNotification("success", "Collection mise à jour", `La collection "${editingCollection.name}" a été modifiée`);
    } catch (error) {
      console.error("Failed to update collection:", error);
      addNotification("error", "Erreur lors de la mise à jour", "Impossible de modifier la collection");
    }
  };

  const deleteCollection = async (id: number, name: string) => {
    if (!confirm(`Supprimer la collection "${name}" ? Elle sera retirée de tous les favoris.`)) {
      return;
    }
    try {
      await api.collections.delete(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      onUpdate?.();
      addNotification("success", "Collection supprimée", `La collection "${name}" a été supprimée`);
    } catch (error) {
      console.error("Failed to delete collection:", error);
      addNotification("error", "Erreur lors de la suppression", "Impossible de supprimer la collection");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--bh-text-primary)]">Paramètres</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-110 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[var(--bh-border)]">
          <button
            onClick={() => setActiveTab("browsers")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "browsers"
                ? "border-[var(--bh-primary)] text-[var(--bh-primary)]"
                : "border-transparent text-[var(--bh-text-muted)] hover:text-[var(--bh-text-primary)]"
            }`}
          >
            Navigateurs
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "tags"
                ? "border-[var(--bh-primary)] text-[var(--bh-primary)]"
                : "border-transparent text-[var(--bh-text-muted)] hover:text-[var(--bh-text-primary)]"
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "collections"
                ? "border-[var(--bh-primary)] text-[var(--bh-primary)]"
                : "border-transparent text-[var(--bh-text-muted)] hover:text-[var(--bh-text-primary)]"
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("interface")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "interface"
                ? "border-[var(--bh-primary)] text-[var(--bh-primary)]"
                : "border-transparent text-[var(--bh-text-muted)] hover:text-[var(--bh-text-primary)]"
            }`}
          >
            Interface
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "themes"
                ? "border-[var(--bh-primary)] text-[var(--bh-primary)]"
                : "border-transparent text-[var(--bh-text-muted)] hover:text-[var(--bh-text-primary)]"
            }`}
          >
            <Palette className="h-4 w-4 inline mr-1" />
            Thèmes
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-[var(--bh-text-muted)]">
              Chargement...
            </div>
          ) : (
            <>
              {/* Browsers Tab */}
              {activeTab === "browsers" && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--bh-text-muted)]">
                    Activez ou désactivez la synchronisation pour chaque navigateur. Vous pouvez également re-synchroniser ou supprimer tous les favoris d'un navigateur.
                  </p>
                  <div className="space-y-2">
                    {browsers.map((browser) => (
                      <div
                        key={browser.browser}
                        className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{BROWSER_ICONS[browser.browser] || "🌐"}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-[var(--bh-text-primary)]">
                              {BROWSER_LABELS[browser.browser] || browser.browser}
                            </div>
                            <div className="text-xs text-[var(--bh-text-muted)]">
                              {browser.bookmark_count} favoris importés
                              {browser.last_sync && (
                                <> · Dernière sync: {new Date(browser.last_sync).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {browser.enabled && (
                            <>
                              <button
                                onClick={() => syncBrowser(browser.browser)}
                                className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-[var(--bh-primary-muted)] hover:text-[var(--bh-primary)] hover:scale-110 hover:shadow-md"
                                title="Re-synchroniser"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteBrowserBookmarks(browser.browser)}
                                className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-110 hover:shadow-md"
                                title="Supprimer tous les favoris"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={browser.enabled}
                              onChange={(e) => toggleBrowser(browser.browser, e.target.checked)}
                              className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-[var(--bh-border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--bh-primary)] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Tab */}
              {activeTab === "tags" && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--bh-text-muted)]">
                    Gérez vos tags. Vous pouvez modifier le nom et la couleur, ou supprimer un tag (il sera retiré de tous les favoris).
                  </p>
                  {tags.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--bh-text-muted)] italic">
                      Aucun tag créé pour le moment
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4"
                        >
                          {editingTag?.id === tag.id ? (
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="color"
                                value={editingTag.color}
                                onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                                className="h-8 w-8 cursor-pointer rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTag.name}
                                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                className="flex-1 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] px-3 py-2 text-sm text-[var(--bh-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bh-primary)]"
                              />
                              <button
                                onClick={updateTag}
                                className="rounded-lg bg-[var(--bh-primary)] px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110"
                              >
                                Sauvegarder
                              </button>
                              <button
                                onClick={() => setEditingTag(null)}
                                className="rounded-lg border border-[var(--bh-border)] px-4 py-2 text-xs font-medium text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:scale-105 hover:shadow-md hover:text-[var(--bh-text-primary)]"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-[var(--bh-text-primary)]">
                                    {tag.name}
                                  </div>
                                  <div className="text-xs text-[var(--bh-text-muted)]">
                                    {tag.bookmark_count || 0} favoris
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingTag({ id: tag.id, name: tag.name, color: tag.color })}
                                  className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-[var(--bh-primary-muted)] hover:text-[var(--bh-primary)] hover:scale-110 hover:shadow-md"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTag(tag.id, tag.name)}
                                  className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-110 hover:shadow-md"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Collections Tab */}
              {activeTab === "collections" && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--bh-text-muted)]">
                    Gérez vos collections. Vous pouvez modifier le nom et l'icône, ou supprimer une collection (elle sera retirée de tous les favoris).
                  </p>
                  {collections.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--bh-text-muted)] italic">
                      Aucune collection créée pour le moment
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4"
                        >
                          {editingCollection?.id === collection.id ? (
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="text"
                                value={editingCollection.icon}
                                onChange={(e) => setEditingCollection({ ...editingCollection, icon: e.target.value })}
                                className="w-16 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] px-3 py-2 text-center text-sm text-[var(--bh-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bh-primary)]"
                                placeholder="📁"
                              />
                              <input
                                type="text"
                                value={editingCollection.name}
                                onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                                className="flex-1 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] px-3 py-2 text-sm text-[var(--bh-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bh-primary)]"
                              />
                              <button
                                onClick={updateCollection}
                                className="rounded-lg bg-[var(--bh-primary)] px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110"
                              >
                                Sauvegarder
                              </button>
                              <button
                                onClick={() => setEditingCollection(null)}
                                className="rounded-lg border border-[var(--bh-border)] px-4 py-2 text-xs font-medium text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:scale-105 hover:shadow-md hover:text-[var(--bh-text-primary)]"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{collection.icon}</span>
                                <div>
                                  <div className="text-sm font-medium text-[var(--bh-text-primary)]">
                                    {collection.name}
                                  </div>
                                  <div className="text-xs text-[var(--bh-text-muted)]">
                                    {collection.bookmark_count || 0} favoris
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingCollection({ id: collection.id, name: collection.name, icon: collection.icon })}
                                  className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-[var(--bh-primary-muted)] hover:text-[var(--bh-primary)] hover:scale-110 hover:shadow-md"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteCollection(collection.id, collection.name)}
                                  className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-110 hover:shadow-md"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Interface Tab */}
              {activeTab === "interface" && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--bh-text-muted)]">
                    Personnalisez l'affichage de l'interface. Vous pouvez masquer ou afficher certaines sections de la sidebar.
                  </p>
                  <div className="space-y-3">
                    {/* Browsers Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--bh-text-primary)]">Afficher les navigateurs</div>
                        <div className="text-xs text-[var(--bh-text-muted)]">
                          Affiche la section navigateurs dans la barre latérale
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={uiPreferences.showBrowsers}
                          onChange={(e) => saveUIPreferences({ ...uiPreferences, showBrowsers: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-[var(--bh-border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--bh-primary)] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>

                    {/* Collections Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--bh-text-primary)]">Afficher les collections</div>
                        <div className="text-xs text-[var(--bh-text-muted)]">
                          Affiche la section collections dans la barre latérale
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={uiPreferences.showCollections}
                          onChange={(e) => saveUIPreferences({ ...uiPreferences, showCollections: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-[var(--bh-border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--bh-primary)] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>

                    {/* Tags Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--bh-text-primary)]">Afficher les tags</div>
                        <div className="text-xs text-[var(--bh-text-muted)]">
                          Affiche la section tags dans la barre latérale
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={uiPreferences.showTags}
                          onChange={(e) => saveUIPreferences({ ...uiPreferences, showTags: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-[var(--bh-border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--bh-primary)] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Themes Tab */}
              {activeTab === "themes" && (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--bh-text-muted)]">
                    Choisissez parmi plusieurs thèmes populaires. Le changement s'applique immédiatement.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          applyTheme(theme.id);
                          setCurrentTheme(theme.id);
                          addNotification("success", "Thème appliqué", `Le thème "${theme.name}" a été activé`);
                        }}
                        className={`group relative rounded-lg border-2 p-4 text-left transition-all duration-200 hover:shadow-xl hover:brightness-110 ${
                          currentTheme === theme.id
                            ? "border-[var(--bh-primary)] bg-[var(--bh-primary-muted)] shadow-md"
                            : "border-[var(--bh-border)] bg-[var(--bh-glass-bg)] hover:border-[var(--bh-primary)]"
                        }`}
                      >
                        {/* Theme colors preview */}
                        <div className="mb-3 flex gap-1">
                          <div className="h-6 w-6 rounded" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="h-6 w-6 rounded" style={{ backgroundColor: theme.colors.accentBlue }} />
                          <div className="h-6 w-6 rounded" style={{ backgroundColor: theme.colors.accentGreen }} />
                          <div className="h-6 w-6 rounded" style={{ backgroundColor: theme.colors.accentAmber }} />
                        </div>

                        <div className="text-sm font-semibold text-[var(--bh-text-primary)] mb-1">
                          {theme.name}
                          {currentTheme === theme.id && (
                            <span className="ml-2 text-xs text-[var(--bh-primary)]">✓ Actif</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--bh-text-muted)]">
                          {theme.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-[var(--bh-border)] pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--bh-primary)] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
