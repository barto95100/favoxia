"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[var(--bh-border)] bg-[var(--bh-input-bg)] px-3.5">
      <Search className="h-4 w-4 text-[var(--bh-text-muted)]" />
      <input
        type="text"
        placeholder="Rechercher un favori..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[13px] text-[var(--bh-text-primary)] placeholder-[var(--bh-text-muted)] outline-none"
      />
      <button onClick={onFilterClick} className="text-[var(--bh-text-secondary)] transition-colors hover:text-[var(--bh-text-primary)]">
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
