'use client';

import { useSyncExternalStore } from 'react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { NOTIFICATIONS_CHANGED_EVENT, type UserNotification } from '@/lib/notifications/list';
import { MAX_TOASTS, pickToasts, readToasted, rememberToasted } from '@/lib/notifications/toasts';
import { PUSH_MESSAGE } from '@/lib/push/browser';

const REFRESH_MS = 60_000;

// One shared count for the page (the header bell is its only reader today). Polling runs only while something
// is subscribed, so it stops when the bell unmounts (signed out).
let count = 0;
// The first count after start is only the starting point: rows that were already unread don't pop up as toasts.
let baselined = false;
let fetchCount: (() => Promise<number | null>) | null = null;
let fetchLatest: (() => Promise<UserNotification[]>) | null = null;
const listeners = new Set<() => void>();
const toastListeners = new Set<(items: UserNotification[]) => void>();
let stopPolling: (() => void) | null = null;

async function refresh() {
  if (!fetchCount || document.visibilityState !== 'visible') return;
  try {
    const next = await fetchCount();
    if (typeof next !== 'number') return;
    const rise = baselined ? next - count : 0;
    baselined = true;
    if (next !== count) {
      count = next;
      listeners.forEach(listener => listener());
    }
    if (rise > 0) void showNew(rise);
  } catch {
    // Offline or the backend is down: keep showing the last count.
  }
}

/** The count went up: one fetch of the newest rows, and the new ones go to the toasts (doc 09 step 5). */
async function showNew(rise: number) {
  if (!fetchLatest || toastListeners.size === 0) return;
  try {
    const fresh = pickToasts(await fetchLatest(), rise, readToasted());
    if (!fresh.length) return;
    rememberToasted(fresh.map(n => n._id));
    toastListeners.forEach(listener => listener(fresh));
  } catch {
    // No toast this time; the bell and the list still have it.
  }
}

/** New notifications for the toasts, as they're found by the count check. */
export function subscribeNotificationToasts(listener: (items: UserNotification[]) => void) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

function startPolling() {
  void refresh();
  const timer = window.setInterval(() => void refresh(), REFRESH_MS);
  const onVisible = () => {
    if (document.visibilityState === 'visible') void refresh();
  };
  const onChanged = () => void refresh();
  // A web push arrived (public/push-sw.js): its row is already saved, so the bell and toast update now, not on the
  // next minute tick.
  const worker = 'serviceWorker' in navigator ? navigator.serviceWorker : null;
  const onWorkerMessage = (event: MessageEvent) => {
    if ((event.data as { type?: unknown } | null)?.type === PUSH_MESSAGE) void refresh();
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
  worker?.addEventListener('message', onWorkerMessage);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    worker?.removeEventListener('message', onWorkerMessage);
    count = 0; // the next account starts from its own count
    baselined = false;
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
 * When it rises, the new rows also go to subscribeNotificationToasts.
 */
export function useUnreadNotifications(): number {
  const backend = useBackendClient();
  // The client is one shared object, so this always points at the same thing.
  fetchCount ??= async () =>
    (await backend.get<{ count?: number }>('/notifications/unread-count'))?.count ?? null;
  fetchLatest ??= async () => {
    const items = await backend.get<UserNotification[]>(
      `/notifications?page=1&limit=${MAX_TOASTS + 2}`,
    );
    return Array.isArray(items) ? items : [];
  };
  return useSyncExternalStore(
    subscribe,
    () => count,
    () => 0,
  );
}
