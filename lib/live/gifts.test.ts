import { beforeEach, describe, expect, it } from 'vitest';

import { floatKeyframes, floatPath, giftsToFly, hasFlown, liveGiftResult, markFlown, resetFlown } from './gifts';
import type { LiveGift } from './messages';

const gift = (id: string, origin: LiveGift['origin'] = 'live'): LiveGift => ({
  id,
  senderName: 'Aisha',
  giftTitle: 'Rose',
  sentAt: '2026-11-19T06:00:00.000Z',
  origin,
});

describe('giftsToFly', () => {
  beforeEach(() => resetFlown());

  it('flies live gifts once per tab and never history copies', () => {
    const list = [gift('a'), gift('b', 'history'), gift('c')];
    expect(giftsToFly(list, new Set()).map(g => g.id)).toEqual(['a', 'c']);
    // Already queued or flying here.
    expect(giftsToFly(list, new Set(['a'])).map(g => g.id)).toEqual(['c']);
    markFlown('a');
    markFlown('c');
    expect(hasFlown('a')).toBe(true);
    // A remount or a room switch back sees the same list: nothing replays.
    expect(giftsToFly(list, new Set())).toEqual([]);
  });
});

describe('float path', () => {
  it('starts hidden at the spawn point, rises the whole way and fades out', () => {
    const path = floatPath(40, 500, () => 0.5);
    const frames = floatKeyframes(path, 10);
    expect(frames).toHaveLength(11);
    expect(frames[0]).toMatchObject({ offset: 0, opacity: 0 });
    expect(frames[0].transform).toContain('scale(0)');
    expect(frames[10]).toMatchObject({ offset: 1, opacity: 0 });
    expect(frames[10].transform).toContain(`-${path.rise}px`);
    expect(frames[5].opacity).toBe(1);
  });

  it('stays inside the spread band before swaying', () => {
    for (const v of [0, 0.25, 0.99]) {
      const p = floatPath(40, 500, () => v);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(40);
      expect(p.rise).toBeGreaterThanOrEqual(440);
    }
  });
});

describe('liveGiftResult', () => {
  it('says how an in-page gift payment went', () => {
    expect(liveGiftResult('done', 'Rose', 'Rowisee')).toEqual({ tone: 'good', title: 'Gift sent!', text: 'Rose sent to Rowisee.' });
    expect(liveGiftResult('processing', 'Rose', 'Rowisee').tone).toBe('info');
    expect(liveGiftResult('deliveryFailed', 'Rose', 'Rowisee').tone).toBe('bad');
    expect(liveGiftResult('notPaid', 'Rose', 'Rowisee').title).toBe('Payment not completed');
  });
});
