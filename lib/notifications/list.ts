import { ACCOUNT_HOME } from '@/lib/auth/account';
import type { PrivateKind } from '@/lib/account/nav';

/** One saved notification (backend `GET /notifications`): the pushes the app gets, kept 90 days. */
export type UserNotification = {
  _id: string;
  /** The push's data.type: connection_schedule, video_call_participant_joined, live_queue, astro_went_live. */
  type: string;
  title: string;
  body: string;
  data?: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
};

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const notificationsPath = (page: number) =>
  `/notifications?page=${page}&limit=${NOTIFICATIONS_PAGE_SIZE}`;

/** Next page number, or undefined when the last page is loaded. */
export function nextNotificationsPage(
  page: number,
  received: number,
  total: number | undefined,
): number | undefined {
  if (received < NOTIFICATIONS_PAGE_SIZE) return undefined;
  if (typeof total === 'number' && page * NOTIFICATIONS_PAGE_SIZE >= total) return undefined;
  return page + 1;
}

/** Header bell + the list page tell each other about changes (read, delete) through this window event. */
export const NOTIFICATIONS_CHANGED_EVENT = 'astrosewa:notifications-changed';

export function announceNotificationsChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export const notificationsPagePath = (kind: PrivateKind) => `/${kind}/notifications`;

const ID = /^[a-f0-9]{24}$/i;
const id = (value: string | undefined) => (value && ID.test(value) ? value : null);

/**
 * Where a tap goes, copied from the app's getNavigationUrl (doc 09). The astrologer side has no consultations/chat
 * pages yet (doc 17), so those go to the astrologer home like the app's booking taps. The web has no live room yet
 * (doc 10): live taps open that astrologer's profile.
 */
export function notificationHref(n: Pick<UserNotification, 'type' | 'data'>, kind: PrivateKind): string {
  const data = n.data ?? {};
  const home = ACCOUNT_HOME[kind];
  switch (n.type) {
    case 'connection_schedule':
      return kind === 'client' ? '/client/consultations' : home;
    case 'video_call_participant_joined':
    case 'chat_message': {
      if (kind !== 'client') return home;
      const booking = id(data.connectionScheduleId);
      return booking ? `/client/consultations/${booking}` : '/client/consultations';
    }
    case 'live_queue':
    case 'astro_went_live': {
      const astrologer = id(data.astrologerId);
      return astrologer ? `/astrologer-profile/${astrologer}` : home;
    }
    default:
      return home;
  }
}

export type NotificationIcon = 'booking' | 'reminder' | 'call' | 'live' | 'queue' | 'other';

export function notificationIcon(n: Pick<UserNotification, 'type' | 'title'>): NotificationIcon {
  switch (n.type) {
    case 'connection_schedule':
      return n.title.toLowerCase().includes('reminder') ? 'reminder' : 'booking';
    case 'video_call_participant_joined':
      return 'call';
    case 'astro_went_live':
      return 'live';
    case 'live_queue':
      return 'queue';
    default:
      return 'other';
  }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const DAY_MS = 24 * 60 * 60 * 1000;

/** Section a notification falls in, in the viewer's local time: Today, Yesterday, This Week, Earlier. */
export function notificationDayGroup(createdAt: string, now: Date = new Date()): string {
  const at = new Date(createdAt);
  if (Number.isNaN(at.getTime())) return 'Earlier';
  // Rounded: a DST change makes a day 23 or 25 h long.
  const days = Math.round((startOfDay(now).getTime() - startOfDay(at).getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This Week';
  return 'Earlier';
}

/** Consecutive items under their day heading (the list is newest first, so each heading appears once). */
export function groupNotificationsByDay<T extends Pick<UserNotification, 'createdAt'>>(
  items: T[],
  now: Date = new Date(),
): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const label = notificationDayGroup(item.createdAt, now);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

/** Time on the row: just the time for Today/Yesterday, weekday this week, date before that. */
export function notificationTime(createdAt: string, now: Date = new Date()): string {
  const at = new Date(createdAt);
  if (Number.isNaN(at.getTime())) return '';
  const time = at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const group = notificationDayGroup(createdAt, now);
  if (group === 'Today' || group === 'Yesterday') return time;
  if (group === 'This Week') return `${at.toLocaleDateString('en-US', { weekday: 'short' })}, ${time}`;
  const sameYear = at.getFullYear() === now.getFullYear();
  return at.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Badge text: nothing at 0, 9+ above 9 (the badge is small). */
export function unreadBadge(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > 9 ? '9+' : String(Math.floor(count));
}
