import { describe, expect, it } from 'vitest';

import type { LiveRoomSummary } from '@/lib/live/api';
import { callBannerText, countdownTone, feedItems, formatCountdown, neighbours, swipeDirection } from '@/lib/live/ui';

const room = (id: string): LiveRoomSummary => ({
  roomId: `r-${id}`,
  roomName: `live-${id}`,
  astrologerId: id,
  startedAt: '2026-11-16T10:00:00Z',
  viewerCount: 0,
});

describe('live viewer helpers', () => {
  it('banner wording is the app', () => {
    expect(callBannerText(null, 'Soni', 'viewer')).toBeNull();
    expect(callBannerText('public_video', 'Soni Lamichhane', 'viewer')).toBe('In public video call with Soni Lamichhane');
    expect(callBannerText('public_audio', '  ', 'viewer')).toBe('In public audio call with Caller');
    expect(callBannerText('private_audio', 'Soni', 'viewer')).toBe('Private audio call in progress');
    expect(callBannerText('private_audio', null, 'caller')).toBe('In private audio call');
  });

  it('countdown text and tone', () => {
    expect(formatCountdown(605)).toBe('10:05');
    expect(formatCountdown(-3)).toBe('0:00');
    expect(countdownTone(600)).toBe('normal');
    expect(countdownTone(299)).toBe('warning');
    expect(countdownTone(60)).toBe('urgent');
  });

  it('neighbours do not wrap', () => {
    const rooms = [room('a'), room('b'), room('c')];
    expect(neighbours(rooms, 'a')).toMatchObject({ prev: null, next: { astrologerId: 'b' }, index: 0 });
    expect(neighbours(rooms, 'b')).toMatchObject({ prev: { astrologerId: 'a' }, next: { astrologerId: 'c' } });
    expect(neighbours(rooms, 'c')).toMatchObject({ prev: { astrologerId: 'b' }, next: null, index: 2 });
    expect(neighbours(rooms, 'zz')).toEqual({ prev: null, next: null, index: -1 });
  });

  it('swipe needs a clear, quick vertical move', () => {
    const at = (x: number, y: number, t: number) => ({ x, y, t });
    expect(swipeDirection(at(100, 500, 0), at(105, 380, 300))).toBe('up');
    expect(swipeDirection(at(100, 300, 0), at(90, 420, 300))).toBe('down');
    expect(swipeDirection(at(100, 500, 0), at(100, 460, 300))).toBeNull();
    expect(swipeDirection(at(100, 500, 0), at(300, 380, 300))).toBeNull();
    expect(swipeDirection(at(100, 500, 0), at(100, 300, 1200))).toBeNull();
  });

  it('feed merges comments and gifts by time, host flagged', () => {
    const items = feedItems(
      [
        { messageId: 'm2', senderId: 'astro', senderName: 'Rowisee Sharma', text: 'namaste', sentAt: '2026-11-16T10:00:02Z' },
        { messageId: 'm1', senderId: 'v', senderName: 'Aisha K', text: 'hi', sentAt: '2026-11-16T10:00:00Z' },
      ],
      [{ id: 'g1', senderName: 'Jhena', giftTitle: 'Rose', sentAt: '2026-11-16T10:00:01Z' }],
      'astro',
    );
    expect(items.map(i => i.id)).toEqual(['m1', 'g1', 'm2']);
    expect(items[2]).toMatchObject({ kind: 'comment', name: 'Rowisee', isHost: true });
    expect(items[0]).toMatchObject({ name: 'Aisha', isHost: false });
  });
});
