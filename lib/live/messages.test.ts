import { describe, expect, it } from 'vitest';

import {
  decodeLiveMessage,
  encodeLiveMessage,
  giftId,
  mergeGifts,
  parseLiveMessage,
  parseRoomHistory,
  sanitizeChatText,
  type LiveGift,
} from '@/lib/live/messages';

describe('parseLiveMessage', () => {
  it('accepts every type the backend sends', () => {
    const samples: unknown[] = [
      { type: 'queue:update', waitingCount: 2, positions: { a: 1, b: 2, c: 'x' } },
      { type: 'queue:your-turn-prompt', queueId: 'q', callType: 'public_audio', expiresAt: '2026-11-16T10:00:00Z' },
      { type: 'queue:accepted', token: 't', liveKitUrl: 'wss://x', callType: 'private_audio', kickAt: '2026-11-16T10:10:00Z' },
      { type: 'call-mode:active', callType: 'public_video', callerId: 'u', callerName: 'U', kickAt: '2026-11-16T10:10:00Z' },
      { type: 'call-mode:cleared' },
      { type: 'queue:no-show', userId: 'u' },
      { type: 'queue:open-changed', isQueueOpen: false },
      { type: 'room:ended' },
      { type: 'participant:kicked' },
      { type: 'react:sync', likeCount: 3 },
      { type: 'gift:sent', giftTitle: 'Rose', senderName: 'A', senderId: 'a', sentAt: '2026-11-16T10:00:00Z', giftImageUrl: 'https://m/x.png' },
      { type: 'chat:message', messageId: 'm', senderId: 's', senderName: 'S', text: ' hi ', sentAt: '2026-11-16T10:00:00Z' },
    ];
    const parsed = samples.map(parseLiveMessage);
    expect(parsed.every(Boolean)).toBe(true);
    expect(parsed[0]).toEqual({ type: 'queue:update', waitingCount: 2, positions: { a: 1, b: 2 } });
    expect(parsed[11]).toMatchObject({ text: 'hi' });
    expect(decodeLiveMessage(encodeLiveMessage(parsed[3]!))).toEqual(parsed[3]);
  });

  it('drops unknown or broken messages', () => {
    expect(parseLiveMessage({ type: 'something:else' })).toBeNull();
    expect(parseLiveMessage({ type: 'call-mode:active', callType: 'video_call', callerId: 'u', kickAt: 'x' })).toBeNull();
    expect(parseLiveMessage({ type: 'chat:message', messageId: 'm', senderId: 's', senderName: 'S', text: '   ', sentAt: 'x' })).toBeNull();
    expect(parseLiveMessage('nope')).toBeNull();
    expect(decodeLiveMessage(new TextEncoder().encode('{not json'))).toBeNull();
  });
});

describe('chat and gifts', () => {
  it('trims and caps chat text at 500 characters', () => {
    expect(sanitizeChatText('  a  ')).toBe('a');
    expect(sanitizeChatText('x'.repeat(600))).toHaveLength(500);
  });

  it('gift ids match the app (sender id, else name, plus time)', () => {
    expect(giftId({ senderId: 'u1', senderName: 'A', sentAt: 't' })).toBe('gift-u1-t');
    expect(giftId({ senderName: 'A', sentAt: 't' })).toBe('gift-A-t');
  });

  it('mergeGifts keeps 5, sorted by time, live over history', () => {
    const g = (i: number, origin: LiveGift['origin']): LiveGift => ({
      id: `g${i}`,
      senderName: 'A',
      giftTitle: 'Rose',
      sentAt: new Date(2026, 10, 16, 10, 0, i).toISOString(),
      origin,
    });
    const merged = mergeGifts([g(1, 'history'), g(2, 'history')], [g(2, 'live'), g(3, 'live'), g(4, 'live'), g(5, 'live'), g(6, 'live')]);
    expect(merged.map(x => x.id)).toEqual(['g2', 'g3', 'g4', 'g5', 'g6']);
    expect(merged[0].origin).toBe('live');
    expect(mergeGifts([g(2, 'live')], [g(2, 'history')])[0].origin).toBe('live');
  });

  it('parseRoomHistory tolerates anything', () => {
    expect(parseRoomHistory(undefined)).toEqual({ messages: [], gifts: [] });
    expect(parseRoomHistory('{bad')).toEqual({ messages: [], gifts: [] });
    expect(parseRoomHistory(JSON.stringify({ liveChat: { messages: 'x', gifts: [{ id: 1 }] } }))).toEqual({ messages: [], gifts: [] });
    const h = parseRoomHistory(
      JSON.stringify({
        liveChat: {
          messages: Array.from({ length: 20 }, (_, i) => ({ messageId: `m${i}`, senderId: 's', senderName: 'S', text: `${i}`, sentAt: 't' })),
          gifts: [{ id: 'gift-a-t', name: 'Aisha', giftTitle: 'Rose', sentAt: 't', giftImageUrl: 'https://m/r.png' }],
        },
      }),
    );
    expect(h.messages).toHaveLength(15);
    expect(h.messages[0].messageId).toBe('m5');
    expect(h.gifts[0]).toEqual({ id: 'gift-a-t', senderName: 'Aisha', giftTitle: 'Rose', sentAt: 't', giftImageUrl: 'https://m/r.png', origin: 'history' });
  });
});
