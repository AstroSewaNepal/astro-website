// Tapping a web push opens /notification-open (public/push-sw.js builds the link). The service worker can't tell a
// client from an astrologer, so this route reads the login and sends them where the notifications page would.
import { accountKind } from '@/lib/auth/account';
import { notificationHref } from '@/lib/notifications/list';

export const NOTIFICATION_OPEN_PATH = '/notification-open';

/** The push data keys the link carries (same list as public/push-sw.js). */
export const OPEN_KEYS = ['type', 'connectionScheduleId', 'astrologerId', 'notificationUserRole'] as const;

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
    const { type = '', ...rest } = data;
    return notificationHref({ type, data: rest }, kind);
  }
  const back = new URLSearchParams(data);
  const login = new URLSearchParams({ callbackUrl: `${NOTIFICATION_OPEN_PATH}?${back.toString()}` });
  if (data.notificationUserRole === 'ASTROLOGER') login.set('role', 'astrologer');
  return `/login?${login.toString()}`;
}
