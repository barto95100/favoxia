"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Tag as TagIcon, FolderOpen, StickyNote } from "lucide-react";
import type { Tag, Collection } from "@/lib/api";

export interface FilterOptions {
  selectedTags: string[];
  selectedCollections: string[];
  hasNotes: boolean | null;
  inCollections: boolean | null;
  dateRange: "all" | "today" | "week" | "month";
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: Tag[];
  availableCollections: Collection[];
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableTags,
  availableCollections,
  buttonRef,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (buttonRef?.current && !buttonRef.current.contains(event.target as Node)) {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen || typeof window === 'undefined') return null;

  const toggleTag = (tagName: string) => {
    const newTags = filters.selectedTags.includes(tagName)
      ? filters.selectedTags.filter(t => t !== tagName)
      : [...filters.selectedTags, tagName];
    onFiltersChange({ ...filters, selectedTags: newTags });
  };

  const toggleCollection = (collectionName: string) => {
    const newCollections = filters.selectedCollections.includes(collectionName)
      ? filters.selectedCollections.filter(c => c !== collectionName)
      : [...filters.selectedCollections, collectionName];
    onFiltersChange({ ...filters, selectedCollections: newCollections });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      selectedTags: [],
      selectedCollections: [],
      hasNotes: null,
      inCollections: null,
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.selectedTags.length > 0 ||
    filters.selectedCollections.length > 0 ||
    filters.hasNotes !== null ||
    filters.inCollections !== null ||
    filters.dateRange !== "all";

  // Calculate position
  let style: React.CSSProperties = {
    position: 'fixed',
    top: '3.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  if (buttonRef?.current) {
    const rect = buttonRef.current.getBoundingClientRect();
    style = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      transform: 'translateX(-50%)',
    };
  }

  const panel = (
    <div
      ref={panelRef}
      style={style}
      className="z-[100000] w-[500px] rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bh-border)] p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--bh-text-primary)]">Filtres avancés</h3>
          {hasActiveFilters && (
            <span className="rounded-full bg-[var(--bh-primary-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bh-primary)]">
              {filters.selectedTags.length + filters.selectedCollections.length +
               (filters.hasNotes !== null ? 1 : 0) +
               (filters.inCollections !== null ? 1 : 0) +
               (filters.dateRange !== "all" ? 1 : 0)} actif{hasActiveFilters ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="rounded-lg px-2 py-1 text-xs text-[var(--bh-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              Réinitialiser
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--bh-text-muted)] transition-colors hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        <div className="space-y-5">
          {/* Date Range */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">
              <Calendar className="h-3.5 w-3.5" />
              Date d'ajout
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Tout" },
                { value: "today", label: "Aujourd'hui" },
                { value: "week", label: "Cette semaine" },
                { value: "month", label: "Ce mois" },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => onFiltersChange({ ...filters, dateRange: option.value as any })}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    filters.dateRange === option.value
                      ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                      : "bg-[var(--bh-glass-bg)] text-[var(--bh-text-secondary)] hover:bg-[var(--bh-border)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">
                <TagIcon className="h-3.5 w-3.5" />
                Tags ({availableTags.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag.name)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      filters.selectedTags.includes(tag.name)
                        ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                        : "bg-[var(--bh-glass-bg)] text-[var(--bh-text-secondary)] hover:bg-[var(--bh-border)]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {availableCollections.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">
                <FolderOpen className="h-3.5 w-3.5" />
                Collections ({availableCollections.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCollections.map(collection => (
                  <button
                    key={collection.name}
                    onClick={() => toggleCollection(collection.name)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      filters.selectedCollections.includes(collection.name)
                        ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                        : "bg-[var(--bh-glass-bg)] text-[var(--bh-text-secondary)] hover:bg-[var(--bh-border)]"
                    }`}
                  >
                    <span>{collection.icon}</span>
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type filters */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--bh-text-muted)]">
              <StickyNote className="h-3.5 w-3.5" />
              Type de favoris
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onFiltersChange({ ...filters, hasNotes: filters.hasNotes === true ? null : true })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                  filters.hasNotes === true
                    ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                    : "bg-[var(--bh-glass-bg)] text-[var(--bh-text-secondary)] hover:bg-[var(--bh-border)]"
                }`}
              >
                <span>Avec notes uniquement</span>
                {filters.hasNotes === true && (
                  <span className="text-[10px] opacity-70">✓</span>
                )}
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, inCollections: filters.inCollections === true ? null : true })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                  filters.inCollections === true
                    ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                    : "bg-[var(--bh-glass-bg)] text-[var(--bh-text-secondary)] hover:bg-[var(--bh-border)]"
                }`}
              >
                <span>Dans des collections uniquement</span>
                {filters.inCollections === true && (
                  <span className="text-[10px] opacity-70">✓</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
