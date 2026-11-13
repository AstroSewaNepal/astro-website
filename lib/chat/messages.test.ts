import { describe, expect, it } from 'vitest';

import {
  callBubbleText,
  newerCopy,
  safeImageUrl,
  chatPartner,
  chatPath,
  dayStarts,
  hasOlderPage,
  historyItems,
  messagesPath,
  toChatItem,
  type ChatMessagesPage,
} from '@/lib/chat/messages';

const page = (n: number, pages: number, ids: [string, string][]): ChatMessagesPage => ({
  messages: ids.map(([id, at]) => ({
    _id: id,
    message: id,
    createdAt: at,
    sender: { _id: id.startsWith('me') ? 'u1' : 'a1', fullName: 'X' },
  })),
  pagination: { page: n, limit: 100, total: 0, pages },
});

describe('chat messages', () => {
  it('builds paths', () => {
    expect(chatPath('b 1')).toBe('/client/consultations/b%201');
    expect(messagesPath('c1', 2)).toBe('/chat-messages?chatId=c1&page=2&limit=100');
  });

  it('shows the WebP copy in the bubble and the original in the viewer', () => {
    const item = toChatItem(
      {
        _id: 'm3',
        createdAt: '2026-11-09T10:00:00Z',
        media: { _id: 'md1', url: 'https://x/o.jpg', compressed: { url: 'https://x/c.webp' } },
      },
      undefined,
    );
    expect(item).toMatchObject({
      image: 'https://x/c.webp',
      fullImage: 'https://x/o.jpg',
      mediaId: 'md1',
    });
  });

  it('reads the media id of a socket ack (not populated)', () => {
    const item = toChatItem(
      { _id: 'm4', createdAt: '2026-11-09T10:00:00Z', media: 'md2' },
      undefined,
    );
    expect(item).toMatchObject({ image: null, fullImage: null, mediaId: 'md2' });
  });

  it('only lets web image URLs through', () => {
    expect(safeImageUrl('https://bucket.s3.amazonaws.com/a.jpg')).toBe(
      'https://bucket.s3.amazonaws.com/a.jpg',
    );
    for (const bad of [
      'javascript:alert(1)',
      'data:image/svg+xml,<svg onload=alert(1)>',
      'http://evil.example/a.jpg',
      'http://localhost:3300/a.jpg',
      'blob:https://x/1',
      '//x/a.jpg',
      'not a url',
      '',
      null,
      undefined,
    ])
      expect(safeImageUrl(bad)).toBeNull();
    const item = toChatItem(
      {
        _id: 'm5',
        createdAt: '2026-11-09T10:00:00Z',
        media: { url: 'javascript:alert(1)', compressed: { url: 'data:text/html,x' } },
      },
      undefined,
    );
    expect(item).toMatchObject({ image: null, fullImage: null });
  });

  it('marks my messages and reads images', () => {
    const item = toChatItem(
      {
        _id: 'm1',
        createdAt: '2026-11-09T10:00:00Z',
        sender: 'u1',
        media: { compressed: { url: 'https://x/c.webp' } },
      },
      'u1',
    );
    expect(item).toMatchObject({ mine: true, text: '', image: 'https://x/c.webp' });
    expect(toChatItem({ _id: 'm2', createdAt: '2026-11-09T10:00:00Z' }, undefined).mine).toBe(
      false,
    );
  });

  it('turns newest-first pages into one oldest-first list without repeats', () => {
    const newest = page(1, 2, [
      ['me3', '2026-11-09T10:03:00Z'],
      ['a2', '2026-11-09T10:02:00Z'],
    ]);
    // a2 slid onto page 2 after a new message arrived.
    const older = page(2, 2, [
      ['a2', '2026-11-09T10:02:00Z'],
      ['me1', '2026-11-09T10:01:00Z'],
    ]);
    const items = historyItems([newest, older], 'u1');
    expect(items.map(i => i.id)).toEqual(['me1', 'a2', 'me3']);
    expect(items.map(i => i.mine)).toEqual([true, false, true]);
    expect(hasOlderPage(newest)).toBe(true);
    expect(hasOlderPage(older)).toBe(false);
    expect(hasOlderPage(undefined)).toBe(false);
  });

  it('starts a day chip on the first message of each day', () => {
    const items = historyItems(
      [
        page(1, 1, [
          ['a3', '2026-11-10T09:00:00'],
          ['a2', '2026-11-09T18:00:00'],
          ['a1', '2026-11-09T08:00:00'],
        ]),
      ],
      'u1',
    );
    expect([...dayStarts(items)]).toEqual([0, 2]);
  });

  it('hides a leaving astrologer', () => {
    const base = {
      _id: 'b1',
      astrologerId: 'a1',
      scheduledStartAt: '',
      scheduledEndAt: '',
      status: 'CONFIRMED',
    };
    expect(chatPartner({ ...base, astrologer: { fullName: ' Rohan ' } }).name).toBe('Rohan');
    expect(
      chatPartner({ ...base, astrologer: { fullName: 'Rohan', isPendingDeletion: true } }),
    ).toEqual({ name: 'Astro Sewa Astrologer', photo: null });
    expect(chatPartner(undefined).name).toBe('Astrologer');
  });

  it('reads call messages', () => {
    const base = { _id: 'c1', createdAt: '2026-11-13T09:00:00Z', sender: { _id: 'u1' } };
    const call = (c: Record<string, unknown>, kind = 'call') =>
      toChatItem({ ...base, kind, message: 'x', call: c }, 'u1');
    expect(
      call({ callType: 'audio', status: 'ended', connectionSchedule: 'b1', answeredAt: '2026', durationSec: 42 }).call,
    ).toEqual({ callType: 'audio', status: 'ended', bookingId: 'b1', answered: true, durationSec: 42 });
    expect(call({ callType: 'video', status: 'started' }).call).toEqual({
      callType: 'video',
      status: 'started',
      bookingId: '',
      answered: false,
    });
    // Not a call message, or a status this page doesn't know: a plain bubble with the text.
    expect(call({ status: 'started' }, 'text').call).toBeUndefined();
    expect(call({ status: 'ringing' }).call).toBeUndefined();
    expect(toChatItem({ ...base, message: 'hi' }, 'u1').call).toBeUndefined();
  });

  it('words call bubbles for the caller and the other person', () => {
    const c = (status: 'started' | 'ongoing' | 'ended', extra = {}) => ({
      callType: 'video' as const,
      status,
      bookingId: 'b1',
      answered: false,
      ...extra,
    });
    expect(callBubbleText(c('started'), true, 'Rowisee')).toEqual({
      title: 'Video call',
      detail: 'Waiting for Rowisee to join',
      missed: false,
    });
    expect(callBubbleText(c('started'), false, 'Rowisee').detail).toBe('Waiting for you to join');
    expect(callBubbleText(c('ongoing', { answered: true }), false, 'R').detail).toBe('Call in progress');
    expect(callBubbleText(c('ended'), true, 'R')).toEqual({ title: 'Video call', detail: 'No answer', missed: false });
    expect(callBubbleText({ ...c('ended'), callType: 'audio' }, false, 'R')).toEqual({
      title: 'Missed voice call',
      detail: null,
      missed: true,
    });
    expect(callBubbleText(c('ended', { answered: true, durationSec: 42 }), true, 'R').detail).toBe('42 sec');
    expect(callBubbleText(c('ended', { answered: true, durationSec: 250 }), true, 'R').detail).toBe('4 min');
    expect(callBubbleText(c('ended', { answered: true }), true, 'R').detail).toBe('Ended');
  });

  it('keeps the furthest status of a call message, the latest copy of anything else', () => {
    const at = new Date(0);
    const call = (status: 'started' | 'ongoing' | 'ended') => ({
      id: 'c1',
      text: status,
      image: null,
      at,
      mine: false,
      call: { callType: 'video' as const, status, bookingId: 'b', answered: status !== 'started' },
    });
    expect(newerCopy(call('ongoing'), call('started')).text).toBe('ongoing');
    expect(newerCopy(call('started'), call('ended')).text).toBe('ended');
    const text = (t: string) => ({ id: 'm', text: t, image: null, at, mine: false });
    expect(newerCopy(text('old'), text('edited')).text).toBe('edited');
  });
});
