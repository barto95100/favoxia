"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CheckCheck, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useNotifications, type Notification } from "@/contexts/NotificationContext";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;

  return date.toLocaleDateString();
}

function NotificationItem({ notification, onMarkAsRead, onClear }: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-500/10",
    error: "bg-red-500/10",
    warning: "bg-amber-500/10",
    info: "bg-blue-500/10",
  };

  return (
    <div
      className={`group relative rounded-lg border border-[var(--bh-border)] p-3 transition-all ${
        notification.read
          ? "bg-[var(--bh-glass-bg)] opacity-60"
          : "bg-[var(--bh-bg-card)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1.5 ${bgColors[notification.type]}`}>
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${notification.read ? "text-[var(--bh-text-muted)]" : "text-[var(--bh-text-primary)]"}`}>
                {notification.title}
              </h4>
              {notification.message && (
                <p className="mt-0.5 text-xs text-[var(--bh-text-secondary)] line-clamp-2">
                  {notification.message}
                </p>
              )}
              <p className="mt-1 text-[10px] text-[var(--bh-text-muted)]">
                {formatTime(notification.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="rounded-md p-1 text-[var(--bh-text-muted)] hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-primary)]"
                  title="Marquer comme lu"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => onClear(notification.id)}
                className="rounded-md p-1 text-[var(--bh-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                title="Supprimer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter({ isOpen, onClose, buttonRef }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll, unreadCount } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Also check if click is on the button
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

  // Calculate position based on button
  let style: React.CSSProperties = {
    position: 'fixed',
    top: '3.5rem', // Default: below header
    right: '1.5rem',
  };

  if (buttonRef?.current) {
    const rect = buttonRef.current.getBoundingClientRect();
    style = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  }

  const panel = (
    <div
      ref={panelRef}
      style={style}
      className="z-[100000] w-[420px] rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bh-border)] p-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--bh-text-primary)]">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-[var(--bh-text-muted)]">
              {unreadCount} non {unreadCount === 1 ? "lue" : "lues"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg px-2 py-1 text-xs text-[var(--bh-primary)] transition-colors hover:bg-[var(--bh-primary-muted)]"
            >
              Tout marquer comme lu
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-lg p-1.5 text-[var(--bh-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
              title="Tout effacer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 text-4xl opacity-50">🔔</div>
            <p className="text-sm text-[var(--bh-text-muted)]">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClear={clearNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
