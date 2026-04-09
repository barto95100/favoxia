function getApiBase(): string {
  // 1. Si une variable d'env est définie au build, l'utiliser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // 2. Côté navigateur : utiliser le même hostname que la page, port 8000
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  // 3. Fallback SSR
  return "http://localhost:8000";
}

export const API_BASE = getApiBase();

export function faviconSrc(bookmark: { favicon_url: string | null; domain: string }): string {
  if (!bookmark.favicon_url) {
    return `https://www.google.com/s2/favicons?domain=${bookmark.domain}&sz=64`;
  }
  // URL relative (/api/favicons/...) -> préfixer avec API_BASE
  if (bookmark.favicon_url.startsWith("/")) {
    return `${API_BASE}${bookmark.favicon_url}`;
  }
  // URL absolue (http://...) -> utiliser telle quelle (rétrocompatibilité)
  return bookmark.favicon_url;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  bookmark_count?: number;
}

export interface Collection {
  id: number;
  name: string;
  icon: string;
  bookmark_count?: number;
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  domain: string;
  description: string | null;
  favicon_url: string | null;
  browser: string;
  folder: string | null;
  is_favorite: boolean;
  visit_count: number;
  note: string | null;
  added_at: string;
  last_visited: string | null;
  tags: Tag[];
  collections: Collection[];
}

export interface BrowserConfig {
  id: number;
  browser: string;
  enabled: boolean;
  sync_frequency: number;
  last_sync: string | null;
  bookmark_count: number;
}

export interface SyncLog {
  id: number;
  browser: string;
  action: string;
  count: number;
  status: string;
  synced_at: string;
}

export interface Stats {
  total_bookmarks: number;
  total_browsers: number;
  total_tags: number;
  favorites_count: number;
  browser_counts: Record<string, number>;
}

export interface SyncResult {
  imported: number;
  browsers: number;
  thumbnails_queued: number;
  collections_created: number;
}

export interface BookmarkMetadata {
  url: string;
  domain: string;
  ip_address: string | null;
  protocol: string;
}

export interface BookmarkUpdateData {
  tag_ids?: number[];
  collection_ids?: number[];
  note?: string | null;
  is_favorite?: boolean;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  console.log(`[API] Fetching: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      mode: 'cors',
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    console.log(`[API] Response for ${path}:`, res.status, res.statusText);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    console.log(`[API] Data received for ${path}:`, Array.isArray(data) ? `Array(${data.length})` : typeof data);
    return data;
  } catch (error) {
    console.error(`[API] Error fetching ${path}:`, error);
    throw error;
  }
}

export const api = {
  bookmarks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchApi<Bookmark[]>(`/api/bookmarks${qs}`);
    },
    get: (id: number) => fetchApi<Bookmark>(`/api/bookmarks/${id}`),
    getMetadata: (id: number) => fetchApi<BookmarkMetadata>(`/api/bookmarks/${id}/metadata`),
    update: (id: number, data: BookmarkUpdateData) =>
      fetchApi<Bookmark>(`/api/bookmarks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi(`/api/bookmarks/${id}`, { method: "DELETE" }),
    deleteByBrowser: (browser: string) =>
      fetchApi(`/api/sync/browsers/${browser}/bookmarks`, { method: "DELETE" }),
  },
  tags: {
    list: () => fetchApi<Tag[]>("/api/tags"),
    create: (data: { name: string; color: string }) =>
      fetchApi<Tag>("/api/tags", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; color?: string }) =>
      fetchApi<Tag>(`/api/tags/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi(`/api/tags/${id}`, { method: "DELETE" }),
  },
  collections: {
    list: () => fetchApi<Collection[]>("/api/collections"),
    create: (data: { name: string; icon: string }) =>
      fetchApi<Collection>("/api/collections", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; icon?: string }) =>
      fetchApi<Collection>(`/api/collections/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi(`/api/collections/${id}`, { method: "DELETE" }),
  },
  sync: {
    trigger: (browser?: string) =>
      fetchApi<SyncResult>(`/api/sync`, { method: "POST", body: JSON.stringify(browser ? { browser } : {}) }),
    logs: () => fetchApi<SyncLog[]>("/api/sync/logs"),
    browsers: () => fetchApi<BrowserConfig[]>("/api/sync/browsers"),
    updateBrowser: (browser: string, enabled: boolean) =>
      fetchApi(`/api/sync/browsers/${browser}?enabled=${enabled}`, { method: "PATCH" }),
  },
  stats: () => fetchApi<Stats>("/api/stats"),
};
