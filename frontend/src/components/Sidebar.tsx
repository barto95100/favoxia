"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  BROWSER_ICON_COMPONENTS,
  DefaultBrowserIcon
} from "./BrowserIcons";

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

export function Sidebar({ browsers, tags, collections, activeBrowser, activeTag, activeCollection, onBrowserClick, onTagClick, onCollectionClick }: SidebarProps) {
  const [showBrowsers, setShowBrowsers] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showCollections, setShowCollections] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('favoxia_ui_preferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          setShowBrowsers(prefs.showBrowsers ?? true);
          setShowTags(prefs.showTags ?? true);
          setShowCollections(prefs.showCollections ?? true);
        }

        // Load sidebar collapsed state
        const collapsedState = localStorage.getItem('favoxia_sidebar_collapsed');
        if (collapsedState !== null) {
          const collapsed = collapsedState === 'true';
          setIsCollapsed(collapsed);
          setShowText(!collapsed);
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

  const toggleSidebar = () => {
    const newState = !isCollapsed;

    if (newState) {
      // Si on ferme la sidebar, cacher le texte immédiatement
      setShowText(false);
      setIsCollapsed(true);
    } else {
      // Si on ouvre la sidebar, attendre la fin de l'animation avant d'afficher le texte
      setIsCollapsed(false);
      setTimeout(() => {
        setShowText(true);
      }, 250); // Délai légèrement avant la fin de l'animation (300ms)
    }

    localStorage.setItem('favoxia_sidebar_collapsed', String(newState));
  };

  // Si toutes les sections sont désactivées, ne pas afficher la sidebar
  if (!showBrowsers && !showTags && !showCollections) {
    return null;
  }

  return (
    <aside className={`relative flex shrink-0 flex-col gap-6 border-r border-[var(--bh-border)] bg-[var(--bh-sidebar-bg)] p-4 transition-all duration-300 ${
      isCollapsed ? "w-[64px]" : "w-[240px]"
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bh-border)] bg-[var(--bh-bg-card)] text-[var(--bh-text-muted)] shadow-md transition-all hover:scale-110 hover:border-[var(--bh-primary)] hover:text-[var(--bh-primary)]"
        title={isCollapsed ? "Ouvrir la sidebar" : "Fermer la sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Browsers */}
      {showBrowsers && !isCollapsed && (
        <div className="flex flex-col gap-2">
          {showText && (
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">Navigateurs</h3>
          )}
          {browsers.map((b) => {
          const IconComponent = BROWSER_ICON_COMPONENTS[b.key as keyof typeof BROWSER_ICON_COMPONENTS] || DefaultBrowserIcon;
          return (
            <button
              key={b.key}
              onClick={() => onBrowserClick(b.key === activeBrowser ? null : b.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                activeBrowser === b.key ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]" : "text-[var(--bh-text-secondary)] hover:bg-[var(--bh-glass-bg)]"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? `${b.name} (${b.count})` : undefined}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              {showText && (
                <>
                  <span className="flex-1 text-left">{b.name}</span>
                  <span className="font-mono text-[10px] text-[var(--bh-text-muted)]">{b.count}</span>
                </>
              )}
            </button>
          );
        })}
        </div>
      )}

      {/* Tags */}
      {showTags && !isCollapsed && (
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
      {showCollections && !isCollapsed && (
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
      {!isCollapsed && (
        <div className="mt-auto">
          <Link
            href="/docs"
            className="flex items-center gap-2 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] px-3 py-2.5 text-[13px] text-[var(--bh-text-secondary)] transition-all hover:border-[var(--bh-primary)] hover:bg-[var(--bh-primary-muted)] hover:text-[var(--bh-primary)] hover:scale-105"
          >
            <BookMarked className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">Documentation</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
