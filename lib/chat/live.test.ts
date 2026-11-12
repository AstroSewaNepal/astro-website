import { describe, expect, it } from 'vitest';

import { emptyLive, liveReducer, timeline, type LiveState, type Outgoing } from '@/lib/chat/live';
import type { ChatItem } from '@/lib/chat/messages';

const item = (id: string, minute: number, mine = false, text = id): ChatItem => ({
  id,
  text,
  image: null,
  at: new Date(Date.UTC(2026, 10, 11, 10, minute)),
  mine,
});

const outgoing = (localId: string, minute: number, text = localId): Outgoing => ({
  localId,
  text,
  at: new Date(Date.UTC(2026, 10, 11, 10, minute)),
  status: 'sending',
});

describe('liveReducer', () => {
  it('adds an arrived message once', () => {
    let s = liveReducer(emptyLive, { type: 'arrived', items: [item('a', 1)] });
    s = liveReducer(s, { type: 'arrived', items: [item('a', 1), item('b', 2)] });
    expect(s.arrived.map(m => m.id)).toEqual(['a', 'b']);
  });

  it('keeps the same state when nothing is new', () => {
    const s = liveReducer(emptyLive, { type: 'arrived', items: [item('a', 1)] });
    expect(liveReducer(s, { type: 'arrived', items: [item('a', 1)] })).toBe(s);
  });

  it('swaps a confirmed send for the saved message', () => {
    let s = liveReducer(emptyLive, { type: 'queued', message: outgoing('local-1', 1, 'hi') });
    s = liveReducer(s, { type: 'sent', localId: 'local-1', item: item('srv-1', 1, false, 'hi') });
    expect(s.outbox).toEqual([]);
    expect(s.arrived).toEqual([{ ...item('srv-1', 1, false, 'hi'), mine: true }]);
  });

  it('marks a failed send and puts a retry back at the end', () => {
    let s = liveReducer(emptyLive, { type: 'queued', message: outgoing('l1', 1) });
    s = liveReducer(s, { type: 'queued', message: outgoing('l2', 2) });
    s = liveReducer(s, { type: 'failed', localId: 'l1', error: 'ended' });
    expect(s.outbox[0]).toMatchObject({ status: 'failed', error: 'ended', uncertain: false });
    const at = new Date(Date.UTC(2026, 10, 11, 10, 5));
    s = liveReducer(s, { type: 'retry', localId: 'l1', at });
    expect(s.outbox.map(o => o.localId)).toEqual(['l2', 'l1']);
    expect(s.outbox[1]).toMatchObject({ status: 'sending', error: undefined, at });
  });

  it('discards a failed send', () => {
    let s = liveReducer(emptyLive, { type: 'queued', message: outgoing('l1', 1) });
    s = liveReducer(s, { type: 'discard', localId: 'l1' });
    expect(s.outbox).toEqual([]);
  });

  it('drops a timed-out copy once the server shows it was saved', () => {
    let s = liveReducer(emptyLive, { type: 'queued', message: outgoing('l1', 3, 'hello') });
    s = liveReducer(s, { type: 'failed', localId: 'l1', error: 'x', uncertain: true });
    s = liveReducer(s, { type: 'arrived', items: [item('srv', 3, true, 'hello')] });
    expect(s.outbox).toEqual([]);
  });

  it('keeps a timed-out copy when the match is someone else, other text, or too old', () => {
    let s = liveReducer(emptyLive, { type: 'queued', message: outgoing('l1', 30, 'hello') });
    s = liveReducer(s, { type: 'failed', localId: 'l1', error: 'x', uncertain: true });
    s = liveReducer(s, {
      type: 'arrived',
      items: [
        item('p', 30, false, 'hello'),
        item('t', 30, true, 'other'),
        item('old', 20, true, 'hello'),
      ],
    });
    expect(s.outbox).toHaveLength(1);
  });

  it('never matches a refused send (certain failure), and one server message stands for one copy', () => {
    let s: LiveState = emptyLive;
    for (const id of ['a', 'b', 'c'])
      s = liveReducer(s, { type: 'queued', message: outgoing(id, 1, 'same') });
    s = liveReducer(s, { type: 'failed', localId: 'a', error: 'x', uncertain: true });
    s = liveReducer(s, { type: 'failed', localId: 'b', error: 'x', uncertain: true });
    s = liveReducer(s, { type: 'failed', localId: 'c', error: 'refused' });
    s = liveReducer(s, { type: 'arrived', items: [item('srv', 1, true, 'same')] });
    expect(s.outbox.map(o => o.localId)).toEqual(['b', 'c']);
  });
});

describe('timeline', () => {
  it('merges history and live messages once each, oldest first, pending last', () => {
    let live = liveReducer(emptyLive, { type: 'arrived', items: [item('c', 3), item('b', 2)] });
    live = liveReducer(live, { type: 'queued', message: outgoing('l1', 0) });
    const list = timeline([item('a', 1), item('b', 2)], live);
    expect(list.map(m => m.id)).toEqual(['a', 'b', 'c', 'l1']);
    expect(list[3]).toMatchObject({ mine: true, status: 'sending' });
  });
});
