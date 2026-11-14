'use client';

import { useSyncExternalStore } from 'react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { NOTIFICATIONS_CHANGED_EVENT } from '@/lib/notifications/list';

const REFRESH_MS = 60_000;

// One shared count for the page (the header bell is its only reader today). Polling runs only while something
// is subscribed, so it stops when the bell unmounts (signed out).
let count = 0;
let fetchCount: (() => Promise<number | null>) | null = null;
const listeners = new Set<() => void>();
let stopPolling: (() => void) | null = null;

async function refresh() {
  if (!fetchCount || document.visibilityState !== 'visible') return;
  try {
    const next = await fetchCount();
    if (typeof next === 'number' && next !== count) {
      count = next;
      listeners.forEach(listener => listener());
    }
  } catch {
    // Offline or the backend is down: keep showing the last count.
  }
}

function startPolling() {
  void refresh();
  const timer = window.setInterval(() => void refresh(), REFRESH_MS);
  const onVisible = () => {
    if (document.visibilityState === 'visible') void refresh();
  };
  const onChanged = () => void refresh();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    count = 0; // the next account starts from its own count
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) stopPolling = startPolling();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopPolling?.();
      stopPolling = null;
    }
  };
}

/**
 * Unread notifications count for the header bell: read on mount, when the tab comes back to the front, every minute
 * while it is in front, and right after the list page reads/deletes something (NOTIFICATIONS_CHANGED_EVENT).
 */
export function useUnreadNotifications(): number {
  const backend = useBackendClient();
  // The client is one shared object, so this always points at the same thing.
  fetchCount ??= async () =>
    (await backend.get<{ count?: number }>('/notifications/unread-count'))?.count ?? null;
  return useSyncExternalStore(
    subscribe,
    () => count,
    () => 0,
  );
}
