import { describe, expect, it } from 'vitest';

import type { LiveRoomSummary } from '@/lib/live/api';
import { cardServices, compactCount, formatCallSlotPrice, livePath, stableRooms, watchingLabel } from '@/lib/live/feed';

const room = (id: string, viewerCount = 0, services?: string[]): LiveRoomSummary => ({
  roomId: id,
  roomName: `live-${id}`,
  astrologerId: `a-${id}`,
  astrologerName: `Astro ${id}`,
  startedAt: '2026-11-16T10:00:00Z',
  viewerCount,
  services,
});

describe('stableRooms', () => {
  it('keeps the order, appends new rooms, drops ended ones', () => {
    const prev = [room('a'), room('b'), room('c')];
    const next = [room('c', 2), room('d'), room('a')];
    expect(stableRooms(prev, next).map(r => `${r.roomId}:${r.viewerCount}`)).toEqual(['a:0', 'c:2', 'd:0']);
  });

  it('returns the same array when nothing changed', () => {
    const prev = [room('a', 1), room('b')];
    expect(stableRooms(prev, [room('b'), room('a', 1)])).toBe(prev);
    expect(stableRooms(prev, [room('b'), room('a', 2)])).not.toBe(prev);
  });
});

describe('card text', () => {
  it('watching label or services', () => {
    expect(watchingLabel(room('a', 3))).toBe('3 watching');
    expect(watchingLabel(room('a', 0))).toBe('0 watching');
    expect(watchingLabel(room('a', 0, ['tarot', '']))).toBeNull();
    expect(cardServices(room('a', 0, ['tarot', 'vedic astrology']))).toEqual(['Tarot', 'Vedic astrology']);
  });

  it('prices and counts like the app', () => {
    expect(formatCallSlotPrice({ currency: 'NPR', amount: 400 })).toBe('Rs 400');
    expect(formatCallSlotPrice({ currency: 'USD', amount: 5 })).toBe('$5');
    expect(formatCallSlotPrice({ currency: 'USD', amount: 5.5 })).toBe('$5.50');
    expect(formatCallSlotPrice({ currency: 'INR', amount: 250 })).toBe('INR 250');
    expect(compactCount(999)).toBe('999');
    expect(compactCount(1000)).toBe('1k');
    expect(compactCount(8500)).toBe('8.5k');
    expect(compactCount(128_000)).toBe('128k');
    expect(compactCount(2_400_000)).toBe('2.4M');
    expect(livePath('abc 1')).toBe('/live/abc%201');
  });
});
