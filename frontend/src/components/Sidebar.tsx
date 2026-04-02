"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookMarked } from "lucide-react";
import Link from "next/link";

interface BrowserItem {
  name: string;
  key: string;
  color: string;
  count: number;
}

interface TagItem {
  name: string;
  color: string;
  count: number;
}

interface CollectionItem {
  name: string;
  icon: string;
  count: number;
}

interface SidebarProps {
  browsers: BrowserItem[];
  tags: TagItem[];
  collections: CollectionItem[];
  activeBrowser: string | null;
  activeTag: string | null;
  activeCollection: string | null;
  onBrowserClick: (key: string | null) => void;
  onTagClick: (name: string | null) => void;
  onCollectionClick: (name: string | null) => void;
}

const BROWSER_ICONS: Record<string, string> = {
  chrome: "🟡",
  firefox: "🟠",
  safari: "🔵",
  edge: "🔷",
  brave: "🔴",
};

export function Sidebar({ browsers, tags, collections, activeBrowser, activeTag, activeCollection, onBrowserClick, onTagClick, onCollectionClick }: SidebarProps) {
  const [showTags, setShowTags] = useState(true);
  const [showCollections, setShowCollections] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('favoxia_ui_preferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          setShowTags(prefs.showTags ?? true);
          setShowCollections(prefs.showCollections ?? true);
        }
      } catch (error) {
        console.error('Failed to load UI preferences:', error);
      }
    };

    loadPreferences();

    // Listen for preference changes
    const handlePreferenceChange = () => {
      loadPreferences();
    };

    window.addEventListener('favoxia_ui_preferences_changed', handlePreferenceChange);
    return () => {
      window.removeEventListener('favoxia_ui_preferences_changed', handlePreferenceChange);
    };
  }, []);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-6 border-r border-[var(--bh-border)] bg-[var(--bh-sidebar-bg)] p-4">
      {/* Browsers */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">Navigateurs</h3>
        {browsers.map((b) => (
          <button
            key={b.key}
            onClick={() => onBrowserClick(b.key === activeBrowser ? null : b.key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
              activeBrowser === b.key ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]" : "text-[var(--bh-text-secondary)] hover:bg-[var(--bh-glass-bg)]"
            }`}
          >
            <span className="text-xs">{BROWSER_ICONS[b.key] || "🌐"}</span>
            <span className="flex-1 text-left">{b.name}</span>
            <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{b.count}</span>
          </button>
        ))}
      </div>

      {/* Tags */}
      {showTags && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">Tags</h3>
          {tags.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--bh-text-muted)] italic">Aucun tag créé</p>
          ) : (
            tags.map((t) => (
              <button
                key={t.name}
                onClick={() => onTagClick(t.name === activeTag ? null : t.name)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  activeTag === t.name ? "bg-[var(--bh-primary-muted)] text-[var(--bh-text-primary)]" : "text-[var(--bh-text-secondary)] hover:bg-[var(--bh-glass-bg)]"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="flex-1 text-left">{t.name}</span>
                <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{t.count}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Collections */}
      {showCollections && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">Collections</h3>
          {collections.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--bh-text-muted)] italic">Aucune collection créée</p>
          ) : (
            collections.map((c) => (
              <button
                key={c.name}
                onClick={() => onCollectionClick(c.name === activeCollection ? null : c.name)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  activeCollection === c.name ? "bg-[var(--bh-primary-muted)] text-[var(--bh-text-primary)]" : "text-[var(--bh-text-secondary)] hover:bg-[var(--bh-glass-bg)]"
                }`}
              >
                <span className="text-xs">{c.icon}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{c.count}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Documentation Link */}
      <div className="mt-auto">
        <Link
          href="/docs"
          className="flex items-center gap-2 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-3 py-2.5 text-[13px] text-[var(--bh-text-secondary)] transition-all hover:border-[var(--bh-primary)] hover:bg-[var(--bh-primary-muted)] hover:text-[var(--bh-primary)] hover:scale-105"
        >
          <BookMarked className="h-4 w-4" />
          <span className="flex-1 text-left font-medium">Documentation</span>
        </Link>
      </div>
    </aside>
  );
}
