import { describe, expect, it } from 'vitest';

import {
  groupNotificationsByDay,
  nextNotificationsPage,
  notificationDayGroup,
  notificationHref,
  notificationIcon,
  notificationTime,
  unreadBadge,
} from './list';

const BOOKING = '6aed7b60748e60cd62664d2f';
const ASTRO = '6ab37aca5655ebb0131eae91';

describe('notificationHref', () => {
  it('booking: client -> My Consultations, astrologer -> home (like the app)', () => {
    const n = { type: 'connection_schedule', data: { connectionScheduleId: BOOKING } };
    expect(notificationHref(n, 'client')).toBe('/client/consultations');
    expect(notificationHref(n, 'astrologer')).toBe('/astrologer');
  });

  it('call opens that consultation chat for clients', () => {
    const n = { type: 'video_call_participant_joined', data: { connectionScheduleId: BOOKING } };
    expect(notificationHref(n, 'client')).toBe(`/client/consultations/${BOOKING}`);
    expect(notificationHref(n, 'astrologer')).toBe('/astrologer');
  });

  it('call without a usable booking id falls back to the list', () => {
    expect(
      notificationHref({ type: 'video_call_participant_joined', data: { connectionScheduleId: '' } }, 'client'),
    ).toBe('/client/consultations');
    expect(
      notificationHref(
        { type: 'video_call_participant_joined', data: { connectionScheduleId: '../x' } },
        'client',
      ),
    ).toBe('/client/consultations');
  });

  it('live + queue open the astrologer profile until the web live room exists', () => {
    expect(notificationHref({ type: 'astro_went_live', data: { astrologerId: ASTRO } }, 'client')).toBe(
      `/astrologer-profile/${ASTRO}`,
    );
    expect(notificationHref({ type: 'live_queue', data: {} }, 'client')).toBe('/client');
  });

  it('unknown types go home', () => {
    expect(notificationHref({ type: 'something_new', data: null }, 'astrologer')).toBe('/astrologer');
  });
});

describe('notificationIcon', () => {
  it('tells reminders from other booking news', () => {
    expect(notificationIcon({ type: 'connection_schedule', title: 'Consultation Reminder' })).toBe('reminder');
    expect(notificationIcon({ type: 'connection_schedule', title: 'Consultation Cancelled' })).toBe('booking');
    expect(notificationIcon({ type: 'video_call_participant_joined', title: 'Incoming Call' })).toBe('call');
    expect(notificationIcon({ type: 'x', title: '' })).toBe('other');
  });
});

describe('day groups + times (local time)', () => {
  const now = new Date(2026, 10, 14, 10, 0); // Sat 14 Nov 2026, 10:00
  const at = (d: number, h = 9, m = 5, month = 10, y = 2026) => new Date(y, month, d, h, m).toISOString();

  it('groups by calendar day, not by 24 h', () => {
    expect(notificationDayGroup(at(14, 0, 1), now)).toBe('Today');
    expect(notificationDayGroup(at(13, 23, 59), now)).toBe('Yesterday');
    expect(notificationDayGroup(at(8), now)).toBe('This Week');
    expect(notificationDayGroup(at(7), now)).toBe('Earlier');
    expect(notificationDayGroup('bad', now)).toBe('Earlier');
  });

  it('keeps each heading once for a newest-first list', () => {
    const items = [at(14, 9), at(14, 8), at(13), at(10), at(9), at(1)].map(createdAt => ({ createdAt }));
    expect(groupNotificationsByDay(items, now).map(g => [g.label, g.items.length])).toEqual([
      ['Today', 2],
      ['Yesterday', 1],
      ['This Week', 2],
      ['Earlier', 1],
    ]);
  });

  it('formats the row time per group', () => {
    expect(notificationTime(at(14, 15, 5), now)).toBe('3:05 PM');
    expect(notificationTime(at(10, 9, 5), now)).toBe('Tue, 9:05 AM');
    expect(notificationTime(at(1), now)).toBe('1 Nov');
    expect(notificationTime(at(20, 9, 5, 11, 2025), now)).toBe('20 Dec 2025');
  });
});

describe('paging + badge', () => {
  it('stops at a short page or at the total', () => {
    expect(nextNotificationsPage(1, 20, 45)).toBe(2);
    expect(nextNotificationsPage(2, 20, 40)).toBeUndefined();
    expect(nextNotificationsPage(3, 5, undefined)).toBeUndefined();
    expect(nextNotificationsPage(1, 20, undefined)).toBe(2);
  });

  it('caps the badge', () => {
    expect(unreadBadge(0)).toBeNull();
    expect(unreadBadge(3)).toBe('3');
    expect(unreadBadge(10)).toBe('9+');
  });
});
