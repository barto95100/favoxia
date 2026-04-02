"use client";

import { useState, useRef } from "react";
import { Bookmark, Bell, RefreshCw, Settings, BookMarked } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { NotificationCenter } from "./NotificationCenter";
import { useNotifications } from "@/contexts/NotificationContext";
import Link from "next/link";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSync?: () => void;
  syncing?: boolean;
  onSettingsClick?: () => void;
}

export function Header({ search, onSearchChange, onSync, syncing, onSettingsClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--bh-border)] bg-[var(--bh-header-bg)] px-6 backdrop-blur-2xl">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-[var(--bh-primary)]" />
        <span className="bg-gradient-to-r from-[#A855F7] to-[#C084FC] bg-clip-text text-base font-bold text-transparent">
          Favoxia
        </span>
      </div>

      {/* Search */}
      <div className="w-[400px]">
        <SearchBar value={search} onChange={onSearchChange} />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-[#22C55E10] px-3 py-1.5 text-[11px] text-[var(--bh-accent-green)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--bh-accent-green)]" />
          Synchronisé
        </div>
        <Link
          href="/docs"
          className="group rounded-lg p-2 text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-primary)] hover:scale-110"
          title="Documentation"
        >
          <BookMarked className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        </Link>
        <button
          onClick={onSync}
          className="group rounded-lg p-2 text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-primary)] hover:scale-110"
          title="Synchroniser les favoris"
        >
          <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${syncing ? "animate-spin" : "group-hover:rotate-90"}`} />
        </button>
        <button
          onClick={onSettingsClick}
          className="group rounded-lg p-2 text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-primary)] hover:scale-110"
          title="Paramètres"
        >
          <Settings className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
        </button>
        <div className="relative">
          <button
            ref={bellButtonRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="group rounded-lg p-2 text-[var(--bh-text-secondary)] transition-all duration-200 hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-primary)] hover:scale-110"
            title="Notifications"
          >
            <Bell className="h-4 w-4 transition-transform duration-200 group-hover:animate-[swing_0.5s_ease-in-out]" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--bh-accent-red)] text-[9px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          buttonRef={bellButtonRef}
        />
      </div>
    </header>
  );
}
