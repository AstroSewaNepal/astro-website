import { describe, expect, it } from 'vitest';

import type { UserNotification } from '@/lib/notifications/list';
import { MAX_TOASTS, pickToasts, TOAST_MAX_AGE_MS } from '@/lib/notifications/toasts';

const NOW = Date.parse('2026-11-15T10:00:00Z');
const row = (id: string, minsAgo: number, read = false): UserNotification => ({
  _id: id,
  type: 'connection_schedule',
  title: 'Consultation Reminder',
  body: 'Starting soon',
  readAt: read ? new Date(NOW).toISOString() : null,
  createdAt: new Date(NOW - minsAgo * 60_000).toISOString(),
});

describe('pickToasts', () => {
  it('takes as many of the newest unread rows as the count rose', () => {
    const items = [row('a', 0), row('b', 1), row('c', 2)];
    expect(pickToasts(items, 2, new Set(), NOW).map(n => n._id)).toEqual(['a', 'b']);
  });

  it('skips read rows when counting', () => {
    const items = [row('a', 0, true), row('b', 1), row('c', 2)];
    expect(pickToasts(items, 1, new Set(), NOW).map(n => n._id)).toEqual(['b']);
  });

  it('nothing when the count did not rise', () => {
    expect(pickToasts([row('a', 0)], 0, new Set(), NOW)).toEqual([]);
    expect(pickToasts([row('a', 0)], -2, new Set(), NOW)).toEqual([]);
  });

  it('never shows the same id twice (other tabs too)', () => {
    expect(pickToasts([row('a', 0), row('b', 1)], 2, new Set(['a']), NOW).map(n => n._id)).toEqual([
      'b',
    ]);
  });

  it('drops rows older than the age limit', () => {
    const old = TOAST_MAX_AGE_MS / 60_000 + 1;
    expect(pickToasts([row('a', old)], 1, new Set(), NOW)).toEqual([]);
  });

  it('caps a burst', () => {
    const items = Array.from({ length: 8 }, (_, i) => row(`r${i}`, i));
    expect(pickToasts(items, 8, new Set(), NOW)).toHaveLength(MAX_TOASTS);
  });

  it('ignores a bad date', () => {
    expect(pickToasts([{ ...row('a', 0), createdAt: 'nope' }], 1, new Set(), NOW)).toEqual([]);
  });
});
