// In-page toasts for new notifications (doc 09 step 5). They ride on the bell's unread count check: when the count
// goes UP, the newest few rows are fetched once and the new ones shown. No extra requests while nothing changes.
// After web push (step 4), a push that arrives while the page is open can show them at once.

import type { UserNotification } from '@/lib/notifications/list';

/** At most this many toasts from one count rise (a burst of reminders shouldn't cover the page). */
export const MAX_TOASTS = 3;
/** Older rows aren't news any more: coming back to a tab after an hour shouldn't show "X is calling you". */
export const TOAST_MAX_AGE_MS = 10 * 60 * 1000;
export const TOAST_SHOW_MS = 5000;

/** Ids already shown, shared by the tabs of this browser so each notification pops up once. */
export const TOASTED_KEY = 'astrosewa:toasted-notifications';
const TOASTED_KEPT = 50;

/**
 * The rows to show after the unread count rose by `rise`: the newest unread ones (new rows are always the newest),
 * recent enough, not shown before. `items` is the first page of GET /notifications (newest first).
 */
export function pickToasts(
  items: UserNotification[],
  rise: number,
  alreadyShown: ReadonlySet<string>,
  now: number = Date.now(),
): UserNotification[] {
  if (rise <= 0) return [];
  return items
    .filter(n => !n.readAt)
    .slice(0, Math.min(rise, MAX_TOASTS))
    .filter(n => {
      const at = new Date(n.createdAt).getTime();
      return !alreadyShown.has(n._id) && Number.isFinite(at) && now - at <= TOAST_MAX_AGE_MS;
    });
}

export function readToasted(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(TOASTED_KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function rememberToasted(ids: string[]): void {
  if (!ids.length) return;
  try {
    const kept = [...readToasted(), ...ids].slice(-TOASTED_KEPT);
    window.localStorage.setItem(TOASTED_KEY, JSON.stringify(kept));
  } catch {
    // Blocked storage: another tab may show the same toast, nothing worse.
  }
}
