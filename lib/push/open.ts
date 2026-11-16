// Tapping a web push opens /notification-open (public/push-sw.js builds the link). The service worker can't tell a
// client from an astrologer, so this route reads the login and sends them where the notifications page would.
import { ACCOUNT_HOME, accountKind, safeReturnPath } from '@/lib/auth/account';
import { notificationHref } from '@/lib/notifications/list';

export const NOTIFICATION_OPEN_PATH = '/notification-open';

/**
 * The push data keys the link carries (same list as public/push-sw.js), plus `fresh=1` when the tap opened a new
 * window (no AstroSewa window was open).
 */
export const OPEN_KEYS = ['type', 'connectionScheduleId', 'astrologerId', 'notificationUserRole', 'fresh'] as const;

/** Account home's "open this page on top of me" parameter (components/push/open-on-top.tsx). */
export const THEN_PARAM = 'then';

const SAFE = /^[\w-]{1,64}$/;

/** Only the known keys with short plain values: the link comes from a push, but the route treats it as untrusted. */
export function readOpenParams(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of OPEN_KEYS) {
    const value = params.get(key);
    if (value && SAFE.test(value)) out[key] = value;
  }
  return out;
}

/**
 * Where the tap goes: the same page as the notifications list row. Logged out (or an admin login) -> the sign-in page,
 * which comes back here afterwards.
 */
export function notificationOpenTarget(params: URLSearchParams, roles: string[] | null | undefined): string {
  const data = readOpenParams(params);
  const kind = accountKind(roles);
  if (kind === 'client' || kind === 'astrologer') {
    const { type = '', fresh, ...rest } = data;
    const target = notificationHref({ type, data: rest }, kind);
    const home = ACCOUNT_HOME[kind];
    // A new window has no history: Back on the page would close it (and drop a call). Land on home, which opens the
    // page on top of itself, so Back goes home instead, like the app.
    if (fresh === '1' && target !== home) return `${home}?${THEN_PARAM}=${encodeURIComponent(target)}`;
    return target;
  }
  const back = new URLSearchParams(data);
  const login = new URLSearchParams({ callbackUrl: `${NOTIFICATION_OPEN_PATH}?${back.toString()}` });
  if (data.notificationUserRole === 'ASTROLOGER') login.set('role', 'astrologer');
  return `/login?${login.toString()}`;
}

/** The page account home should open on top of itself, or null (only same-site paths, never /notification-open). */
export function openOnTopTarget(value: string | null): string | null {
  if (!value) return null;
  const path = safeReturnPath(value, '');
  if (!path || path.startsWith(NOTIFICATION_OPEN_PATH)) return null;
  return path;
}
