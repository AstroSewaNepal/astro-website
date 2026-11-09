import { describe, expect, it } from 'vitest';

import {
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
});
