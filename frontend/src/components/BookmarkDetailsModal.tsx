"use client";

import { useState, useEffect } from "react";
import { X, Tag as TagIcon, Plus, Trash2, ExternalLink, Copy, Save, Calendar, Globe, Server, StickyNote, CheckCircle2, AlertCircle, TrendingUp, Monitor, FolderOpen } from "lucide-react";
import { api, API_BASE, type Bookmark, type Tag, type Collection, type BookmarkMetadata } from "@/lib/api";

interface BookmarkDetailsModalProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

type ToastType = "success" | "error" | null;

export function BookmarkDetailsModal({ bookmark, isOpen, onClose, onUpdate }: BookmarkDetailsModalProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionIcon, setNewCollectionIcon] = useState("📁");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: null, message: "" });
  const [metadata, setMetadata] = useState<BookmarkMetadata | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Tag[]>([]);
  const [showCollectionSuggestions, setShowCollectionSuggestions] = useState(false);
  const [filteredCollectionSuggestions, setFilteredCollectionSuggestions] = useState<Collection[]>([]);

  useEffect(() => {
    if (isOpen && bookmark) {
      loadTags();
      loadCollections();
      loadMetadata();
      setSelectedTagIds(bookmark.tags.map(t => t.id));
      setSelectedCollectionIds(bookmark.collections.map(c => c.id));
      setNote(bookmark.note || "");
    }
  }, [isOpen, bookmark]);

  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => {
        setToast({ type: null, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadTags = async () => {
    try {
      const tags = await api.tags.list();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const loadCollections = async () => {
    try {
      const collections = await api.collections.list();
      setAvailableCollections(collections);
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  };

  const loadMetadata = async () => {
    if (!bookmark) return;
    try {
      const meta = await api.bookmarks.getMetadata(bookmark.id);
      setMetadata(meta);
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  const handleTagInputChange = (value: string) => {
    setNewTagName(value);

    // Get all unselected tags
    const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id));

    if (value.trim()) {
      // Filter tags that match the input (case-insensitive)
      const matches = unselectedTags.filter(tag =>
        tag.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      // Show all unselected tags when input is empty
      setFilteredSuggestions(unselectedTags);
      setShowSuggestions(unselectedTags.length > 0);
    }
  };

  const handleTagInputFocus = () => {
    // Show all available unselected tags when focusing
    const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id));
    setFilteredSuggestions(unselectedTags);
    setShowSuggestions(unselectedTags.length > 0);
  };

  const handleSelectSuggestion = (tag: Tag) => {
    // Add the existing tag instead of creating a new one
    setSelectedTagIds([...selectedTagIds, tag.id]);
    setNewTagName("");
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    // Check for duplicate (case-insensitive)
    const duplicate = availableTags.find(
      tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (duplicate) {
      // If tag already exists, just add it to selected tags
      if (!selectedTagIds.includes(duplicate.id)) {
        setSelectedTagIds([...selectedTagIds, duplicate.id]);
      }
      setNewTagName("");
      setShowSuggestions(false);
      setToast({ type: "error", message: `Le tag "${duplicate.name}" existe déjà` });
      return;
    }

    try {
      const colors = ["#A855F7", "#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#EC4899"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTag = await api.tags.create({ name: newTagName.trim(), color: randomColor });
      setAvailableTags([...availableTags, newTag]);
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      setNewTagName("");
      setShowSuggestions(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCollectionInputChange = (value: string) => {
    setNewCollectionName(value);

    const unselectedCollections = availableCollections.filter(c => !selectedCollectionIds.includes(c.id));

    if (value.trim()) {
      const matches = unselectedCollections.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCollectionSuggestions(matches);
      setShowCollectionSuggestions(matches.length > 0);
    } else {
      setFilteredCollectionSuggestions(unselectedCollections);
      setShowCollectionSuggestions(unselectedCollections.length > 0);
    }
  };

  const handleCollectionInputFocus = () => {
    const unselectedCollections = availableCollections.filter(c => !selectedCollectionIds.includes(c.id));
    setFilteredCollectionSuggestions(unselectedCollections);
    setShowCollectionSuggestions(unselectedCollections.length > 0);
  };

  const handleSelectCollectionSuggestion = (collection: Collection) => {
    setSelectedCollectionIds([...selectedCollectionIds, collection.id]);
    setNewCollectionName("");
    setShowCollectionSuggestions(false);
    setFilteredCollectionSuggestions([]);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const duplicate = availableCollections.find(
      c => c.name.toLowerCase() === newCollectionName.trim().toLowerCase()
    );

    if (duplicate) {
      if (!selectedCollectionIds.includes(duplicate.id)) {
        setSelectedCollectionIds([...selectedCollectionIds, duplicate.id]);
      }
      setNewCollectionName("");
      setShowCollectionSuggestions(false);
      setToast({ type: "error", message: `La collection "${duplicate.name}" existe déjà` });
      return;
    }

    try {
      const newCollection = await api.collections.create({ name: newCollectionName.trim(), icon: newCollectionIcon });
      setAvailableCollections([...availableCollections, newCollection]);
      setSelectedCollectionIds([...selectedCollectionIds, newCollection.id]);
      setNewCollectionName("");
      setShowCollectionSuggestions(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  };

  const toggleCollection = (collectionId: number) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId) ? prev.filter(id => id !== collectionId) : [...prev, collectionId]
    );
  };

  const handleSave = async () => {
    if (!bookmark) return;

    try {
      setSaving(true);
      await api.bookmarks.update(bookmark.id, {
        tag_ids: selectedTagIds,
        collection_ids: selectedCollectionIds,
        note: note.trim() || null
      });
      setToast({ type: "success", message: "Modifications enregistrées avec succès!" });

      // Fermer le modal immédiatement
      onClose();

      // Rafraîchir les données après la fermeture pour éviter le scintillement
      setTimeout(() => {
        onUpdate();
      }, 100);
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      setToast({ type: "error", message: "Échec de l'enregistrement des modifications" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bookmark) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${bookmark.title}" ?`)) return;

    try {
      setDeleting(true);
      await api.bookmarks.delete(bookmark.id);
      setToast({ type: "success", message: "Favori supprimé avec succès!" });
      onUpdate();
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      setToast({ type: "error", message: "Échec de la suppression" });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (!bookmark) return;
    navigator.clipboard.writeText(bookmark.url);
    setToast({ type: "success", message: "Lien copié dans le presse-papiers!" });
  };

  const handleOpenInNewTab = () => {
    if (!bookmark) return;
    window.open(bookmark.url, '_blank');
  };

  if (!isOpen || !bookmark) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] shadow-2xl">
        {/* Toast Notification */}
        {toast.type && (
          <div className={`fixed top-6 right-6 z-[100000] flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg backdrop-blur-xl ${
            toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-[var(--bh-text-primary)]">Détails du favori</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--bh-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-110 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Top Section: Metadata (Left) + Image (Right) */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left: Metadata Section */}
              <div className="lg:w-[280px] flex-shrink-0">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--bh-text-primary)]">
                  <Server className="h-4 w-4" />
                  Métadonnées
                </h3>
                <div className="space-y-2 rounded-lg bg-[var(--bh-glass-bg)] p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="h-4 w-4 text-[var(--bh-text-muted)]" />
                    <span className="font-semibold text-[var(--bh-text-muted)]">Navigateur:</span>
                    <span className="text-[var(--bh-text-secondary)]">
                      {bookmark.browser.charAt(0).toUpperCase() + bookmark.browser.slice(1)}
                    </span>
                  </div>
                  {bookmark.folder && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 text-center text-[var(--bh-text-muted)]">📁</span>
                      <span className="font-semibold text-[var(--bh-text-muted)]">Dossier:</span>
                      <span className="text-[var(--bh-text-secondary)]">{bookmark.folder}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--bh-text-muted)]" />
                    <span className="font-semibold text-[var(--bh-text-muted)]">Ajouté le:</span>
                    <span className="text-[var(--bh-text-secondary)]">
                      {new Date(bookmark.added_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {bookmark.last_visited && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[var(--bh-text-muted)]" />
                      <span className="font-semibold text-[var(--bh-text-muted)]">Dernière visite:</span>
                      <span className="text-[var(--bh-text-secondary)]">
                        {new Date(bookmark.last_visited).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {bookmark.visit_count > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-[var(--bh-text-muted)]" />
                      <span className="font-semibold text-[var(--bh-text-muted)]">Visites:</span>
                      <span className="text-[var(--bh-text-secondary)]">{bookmark.visit_count}</span>
                    </div>
                  )}
                  {metadata?.ip_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-[var(--bh-text-muted)]" />
                      <span className="font-semibold text-[var(--bh-text-muted)]">Adresse IP:</span>
                      <span className="text-[var(--bh-text-secondary)] font-mono">{metadata.ip_address}</span>
                    </div>
                  )}
                  {metadata?.protocol && (
                    <div className="flex items-center gap-2 text-sm">
                      <Server className="h-4 w-4 text-[var(--bh-text-muted)]" />
                      <span className="font-semibold text-[var(--bh-text-muted)]">Protocole:</span>
                      <span className="text-[var(--bh-text-secondary)] font-mono">{metadata.protocol.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Thumbnail Preview */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={`${API_BASE}/api/thumbnails/${bookmark.id}`}
                  alt={bookmark.title}
                  className="max-w-full rounded-xl border border-[var(--bh-border)] shadow-md"
                  style={{ maxHeight: '400px' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif"%3EAperçu non disponible%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>

            {/* Title & Domain */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--bh-text-primary)] mb-1">{bookmark.title}</h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[var(--bh-primary)] hover:underline"
              >
                <Globe className="h-3 w-3" />
                {bookmark.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* URL Display */}
            <div className="rounded-lg bg-[var(--bh-glass-bg)] p-3">
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 mt-0.5 text-[var(--bh-text-muted)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--bh-text-muted)] mb-1">URL</p>
                  <p className="text-xs text-[var(--bh-text-secondary)] break-all">{bookmark.url}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {bookmark.description && (
              <div className="rounded-lg bg-[var(--bh-glass-bg)] p-3">
                <p className="text-xs font-semibold text-[var(--bh-text-muted)] mb-1">Description</p>
                <p className="text-sm text-[var(--bh-text-secondary)]">{bookmark.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleOpenInNewTab}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-4 py-2.5 text-sm font-medium text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-primary)] hover:text-white hover:border-[var(--bh-primary)] hover:scale-105 hover:shadow-lg"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-4 py-2.5 text-sm font-medium text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-primary)] hover:text-white hover:border-[var(--bh-primary)] hover:scale-105 hover:shadow-lg"
              >
                <Copy className="h-4 w-4" />
                Copier
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Tags Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--bh-text-primary)]">
                <TagIcon className="h-4 w-4" />
                Tags assignés
              </h3>

              {/* Selected Tags List - Only show selected tags */}
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTagIds.length === 0 ? (
                  <p className="text-sm text-[var(--bh-text-muted)] italic">
                    Aucun tag assigné. Utilisez le champ ci-dessous pour en ajouter.
                  </p>
                ) : (
                  availableTags
                    .filter(tag => selectedTagIds.includes(tag.id))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-110 hover:shadow-md bg-[var(--bh-primary)] text-white shadow-md hover:brightness-90"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    ))
                )}
              </div>

              {/* Create New Tag */}
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
                    onFocus={handleTagInputFocus}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Ajouter ou créer un tag..."
                    className="w-full rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-3 py-2 text-sm text-[var(--bh-text-primary)] placeholder-[var(--bh-text-muted)] focus:border-[var(--bh-primary)] focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--bh-primary)]/20"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] shadow-xl backdrop-blur-xl">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleSelectSuggestion(tag)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--bh-text-primary)] hover:bg-[var(--bh-primary)] hover:text-white transition-colors"
                          >
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <span className="ml-auto text-xs text-[var(--bh-text-muted)] hover:text-white/70">
                              {tag.bookmark_count} favoris
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[var(--bh-text-muted)] italic">
                          {newTagName.trim()
                            ? `Aucun tag trouvé. Appuyez sur + pour créer "${newTagName}"`
                            : "Tous les tags sont déjà assignés"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateTag}
                  className="rounded-lg bg-[var(--bh-primary)] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Collections Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--bh-text-primary)]">
                <FolderOpen className="h-4 w-4" />
                Collections
              </h3>

              {/* Selected Collections List */}
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedCollectionIds.length === 0 ? (
                  <p className="text-sm text-[var(--bh-text-muted)] italic">
                    Aucune collection assignée. Utilisez le champ ci-dessous pour en ajouter.
                  </p>
                ) : (
                  availableCollections
                    .filter(c => selectedCollectionIds.includes(c.id))
                    .map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => toggleCollection(collection.id)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-110 hover:shadow-md bg-[var(--bh-primary)] text-white shadow-md hover:brightness-90"
                      >
                        <span>{collection.icon}</span>
                        {collection.name}
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    ))
                )}
              </div>

              {/* Create New Collection */}
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => handleCollectionInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateCollection()}
                    onFocus={handleCollectionInputFocus}
                    onBlur={() => {
                      setTimeout(() => setShowCollectionSuggestions(false), 200);
                    }}
                    placeholder="Ajouter ou créer une collection..."
                    className="w-full rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-3 py-2 text-sm text-[var(--bh-text-primary)] placeholder-[var(--bh-text-muted)] focus:border-[var(--bh-primary)] focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--bh-primary)]/20"
                  />

                  {/* Suggestions Dropdown */}
                  {showCollectionSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] shadow-xl backdrop-blur-xl">
                      {filteredCollectionSuggestions.length > 0 ? (
                        filteredCollectionSuggestions.map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => handleSelectCollectionSuggestion(collection)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--bh-text-primary)] hover:bg-[var(--bh-primary)] hover:text-white transition-colors"
                          >
                            <span>{collection.icon}</span>
                            <span>{collection.name}</span>
                            <span className="ml-auto text-xs text-[var(--bh-text-muted)] hover:text-white/70">
                              {collection.bookmark_count} favoris
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[var(--bh-text-muted)] italic">
                          {newCollectionName.trim()
                            ? `Aucune collection trouvée. Appuyez sur + pour créer "${newCollectionName}"`
                            : "Toutes les collections sont déjà assignées"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateCollection}
                  className="rounded-lg bg-[var(--bh-primary)] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--bh-text-primary)]">
                <StickyNote className="h-4 w-4" />
                Notes personnelles
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajoutez vos notes ici..."
                rows={4}
                className="w-full rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-3 py-2 text-sm text-[var(--bh-text-primary)] placeholder-[var(--bh-text-muted)] focus:border-[var(--bh-primary)] focus:outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-[var(--bh-primary)]/20 focus:shadow-lg"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-3 border-t border-[var(--bh-border)] pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--bh-border)] px-6 py-2.5 text-sm font-medium text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:scale-105 hover:shadow-md hover:text-[var(--bh-text-primary)]"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[var(--bh-primary)] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
