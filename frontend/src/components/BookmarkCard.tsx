"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, MoreHorizontal, StickyNote, FolderOpen, Folder, Pencil } from "lucide-react";
import { TagPill } from "./TagPill";
import type { Bookmark } from "@/lib/api";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onOpen?: (bookmark: Bookmark) => void;
  variant?: "grid" | "list";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return `Il y a ${Math.floor(days / 7)} sem.`;
}

const BROWSER_COLORS: Record<string, string> = {
  chrome: "var(--bh-accent-amber)",
  firefox: "#F97316",
  safari: "var(--bh-accent-blue)",
  edge: "var(--bh-accent-cyan)",
  brave: "var(--bh-accent-red)",
  arc: "#A855F7",
};

export function BookmarkCard({ bookmark, onToggleFavorite, onOpen, variant = "grid" }: BookmarkCardProps) {
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const [showCollectionsTooltip, setShowCollectionsTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [noteTooltipPosition, setNoteTooltipPosition] = useState({ x: 0, y: 0 });
  const [collectionsTooltipPosition, setCollectionsTooltipPosition] = useState({ x: 0, y: 0 });
  const browserColor = BROWSER_COLORS[bookmark.browser] || "var(--bh-text-muted)";

  useEffect(() => {
    setMounted(true);
  }, []);

  const PREVIEW_WIDTH = 340;
  const PREVIEW_HEIGHT = 280;
  const OFFSET = 15;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mounted) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculer la position pour garder la modale dans les limites de la fenêtre
    let x = e.clientX + OFFSET;
    let y = e.clientY + OFFSET;

    // Si la modale dépasse à droite, la placer à gauche de la souris
    if (x + PREVIEW_WIDTH > viewportWidth) {
      x = e.clientX - PREVIEW_WIDTH - OFFSET;
    }

    // Si la modale dépasse en bas, la placer au-dessus de la souris
    if (y + PREVIEW_HEIGHT > viewportHeight) {
      y = e.clientY - PREVIEW_HEIGHT - OFFSET;
    }

    // S'assurer que la modale ne sort pas à gauche ou en haut
    x = Math.max(10, x);
    y = Math.max(10, y);

    setMousePosition({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mounted) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = e.clientX + OFFSET;
    let y = e.clientY + OFFSET;

    if (x + PREVIEW_WIDTH > viewportWidth) {
      x = e.clientX - PREVIEW_WIDTH - OFFSET;
    }

    if (y + PREVIEW_HEIGHT > viewportHeight) {
      y = e.clientY - PREVIEW_HEIGHT - OFFSET;
    }

    x = Math.max(10, x);
    y = Math.max(10, y);

    setMousePosition({ x, y });
    setShowPreview(true);
  };

  const handleNoteMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!mounted || !bookmark.note) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setNoteTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowNoteTooltip(true);
  };

  const handleCollectionsMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!mounted || bookmark.collections.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setCollectionsTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowCollectionsTooltip(true);
  };

  const noteTooltip = mounted && showNoteTooltip && bookmark.note && (
    <div
      className="fixed pointer-events-none z-[999999]"
      style={{
        left: `${noteTooltipPosition.x}px`,
        top: `${noteTooltipPosition.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="max-w-[280px] rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3 shadow-xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--bh-primary)]">
          <StickyNote className="h-3.5 w-3.5" />
          Note
        </div>
        <p className="text-xs text-[var(--bh-text-secondary)] leading-relaxed whitespace-pre-wrap">{bookmark.note}</p>
      </div>
    </div>
  );

  const collectionsTooltip = mounted && showCollectionsTooltip && bookmark.collections.length > 0 && (
    <div
      className="fixed pointer-events-none z-[999999]"
      style={{
        left: `${collectionsTooltipPosition.x}px`,
        top: `${collectionsTooltipPosition.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="max-w-[280px] rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3 shadow-xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--bh-primary)]">
          <FolderOpen className="h-3.5 w-3.5" />
          Collections
        </div>
        <div className="flex flex-wrap gap-1.5">
          {bookmark.collections.map(c => (
            <div key={c.id} className="flex items-center gap-1 text-xs text-[var(--bh-text-secondary)]">
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === "list") {
    return (
      <>
        <div
          className="flex items-center gap-3 rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] px-4 py-3 transition-all hover:border-[var(--bh-border-hover)] hover:bg-[var(--bh-bg-card-hover)] cursor-pointer"
          onClick={() => window.open(bookmark.url, '_blank')}
        >
          <img
            src={bookmark.favicon_url || `https://www.google.com/s2/favicons?domain=${bookmark.domain}&sz=64`}
            alt=""
            className="h-5 w-5 rounded"
          />
          <span className="flex-1 truncate text-sm font-medium">{bookmark.title}</span>
          {bookmark.folder && (
            <div className="flex items-center gap-1 rounded-md bg-[var(--bh-glass-bg)] px-2 py-1">
              <Folder className="h-3 w-3 text-[var(--bh-text-muted)]" />
              <span className="text-[10px] text-[var(--bh-text-muted)] max-w-[200px] truncate">{bookmark.folder}</span>
            </div>
          )}
          <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{bookmark.domain}</span>
          <div className="flex items-center gap-1.5">
            {bookmark.tags.slice(0, 2).map((tag) => (
              <TagPill key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {bookmark.collections.length > 0 && (
              <button
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={handleCollectionsMouseEnter}
                onMouseLeave={() => setShowCollectionsTooltip(false)}
                className="text-[var(--bh-primary)] hover:text-[var(--bh-primary)] transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
            )}
            {bookmark.note && (
              <button
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={handleNoteMouseEnter}
                onMouseLeave={() => setShowNoteTooltip(false)}
                className="text-[var(--bh-primary)] hover:text-[var(--bh-primary)] transition-colors"
              >
                <StickyNote className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(bookmark); }}
              className="text-[var(--bh-text-muted)] hover:text-[var(--bh-primary)] transition-colors"
              title="Modifier les métadonnées"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        {mounted && noteTooltip && typeof window !== 'undefined' && createPortal(noteTooltip, document.body)}
        {mounted && collectionsTooltip && typeof window !== 'undefined' && createPortal(collectionsTooltip, document.body)}
      </>
    );
  }

  const previewContent = mounted && showPreview && (
    <div
      className="fixed pointer-events-none"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        zIndex: 999999,
        width: `${PREVIEW_WIDTH}px`,
        maxHeight: `${PREVIEW_HEIGHT}px`
      }}
    >
      <div className="rounded-xl border-2 border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3 shadow-2xl backdrop-blur-xl">
        <div className="relative h-[180px] w-full overflow-hidden rounded-lg bg-[var(--bh-glass-bg)]">
          <img
            src={`http://localhost:8000/api/thumbnails/${bookmark.id}`}
            alt={`Aperçu de ${bookmark.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bh-glass-bg)] to-[var(--bh-bg-card)]">
            <div className="text-center p-4">
              <div className="mb-2 text-4xl opacity-50">🖼️</div>
              <div className="text-xs text-[var(--bh-text-muted)]">Aperçu non disponible</div>
              <div className="mt-1 text-[10px] text-[var(--bh-text-muted)] opacity-70">
                (Adresses locales et certains sites ne peuvent être capturés)
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2.5 space-y-1">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--bh-text-primary)]">{bookmark.title}</p>
          {bookmark.description && (
            <p className="line-clamp-2 text-[11px] leading-snug text-[var(--bh-text-secondary)]">{bookmark.description}</p>
          )}
          <p className="truncate font-mono text-[10px] text-[var(--bh-text-muted)] pt-0.5">{bookmark.url}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="group relative flex flex-col gap-2.5 rounded-[14px] border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3.5 transition-all hover:border-[var(--bh-border-hover)] hover:bg-[var(--bh-bg-card-hover)] backdrop-blur-xl cursor-pointer"
        onClick={() => window.open(bookmark.url, '_blank')}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowPreview(false)}
      >
      {/* Top: Favicon + Title + Note + Star */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${browserColor}20` }}
        >
          <img
            src={bookmark.favicon_url || `https://www.google.com/s2/favicons?domain=${bookmark.domain}&sz=64`}
            alt=""
            className="h-4 w-4"
          />
        </div>
        <div className="flex flex-1 flex-col gap-px min-w-0">
          <span className="truncate text-sm font-semibold">{bookmark.title}</span>
          <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{bookmark.domain}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {bookmark.collections.length > 0 && (
            <button
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleCollectionsMouseEnter}
              onMouseLeave={() => setShowCollectionsTooltip(false)}
              className="text-[var(--bh-primary)] hover:text-[var(--bh-primary)] transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
          )}
          {bookmark.note && (
            <button
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleNoteMouseEnter}
              onMouseLeave={() => setShowNoteTooltip(false)}
              className="text-[var(--bh-primary)] hover:text-[var(--bh-primary)] transition-colors"
            >
              <StickyNote className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onOpen?.(bookmark); }}
            className="text-[var(--bh-text-muted)] hover:text-[var(--bh-primary)] transition-colors"
            title="Modifier les métadonnées"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {bookmark.description && (
        <p className="line-clamp-2 text-xs text-[var(--bh-text-secondary)]">{bookmark.description}</p>
      )}

      {/* Meta + Tags */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Meta info */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {bookmark.folder && (
            <div className="flex items-center gap-1 rounded-md bg-[var(--bh-glass-bg)] px-2 py-0.5">
              <Folder className="h-3 w-3 text-[var(--bh-text-muted)]" />
              <span className="text-[9px] text-[var(--bh-text-muted)]">{bookmark.folder}</span>
            </div>
          )}
          <span className="font-mono text-[9px] text-[var(--bh-text-muted)]">
            · {bookmark.browser.charAt(0).toUpperCase() + bookmark.browser.slice(1)} · {timeAgo(bookmark.added_at)}
          </span>
        </div>

        {/* Right: Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {bookmark.tags.map((tag) => (
            <TagPill key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      </div>
    </div>
    {mounted && previewContent && typeof window !== 'undefined' && createPortal(previewContent, document.body)}
    {mounted && noteTooltip && typeof window !== 'undefined' && createPortal(noteTooltip, document.body)}
    {mounted && collectionsTooltip && typeof window !== 'undefined' && createPortal(collectionsTooltip, document.body)}
    </>
  );
}
