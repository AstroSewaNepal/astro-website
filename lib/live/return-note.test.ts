import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LIVE_RETURN_KEY,
  LIVE_RETURN_MAX_AGE_MS,
  leaveLiveReturnNote,
  parseLiveReturnNote,
  takeLiveReturnNote,
} from '@/lib/live/return-note';

const NOW = 1_800_000_000_000;
const gift = { kind: 'gift', astrologerId: 'astro', giftTitle: 'Cycle', since: NOW - 60_000, at: NOW } as const;

describe('parseLiveReturnNote', () => {
  it('reads a fresh note for this stream', () => {
    expect(parseLiveReturnNote(JSON.stringify(gift), 'astro', NOW + 1000)).toEqual(gift);
    const call = { kind: 'live-call', astrologerId: 'astro', position: 2, at: NOW };
    expect(parseLiveReturnNote(JSON.stringify(call), 'astro', NOW)).toEqual(call);
    expect(parseLiveReturnNote(JSON.stringify({ ...gift, giftTitle: null }), 'astro', NOW)?.kind).toBe('gift');
  });

  it('ignores another stream, an old note and anything malformed', () => {
    expect(parseLiveReturnNote(JSON.stringify(gift), 'other', NOW)).toBeNull();
    expect(parseLiveReturnNote(JSON.stringify(gift), 'astro', NOW + LIVE_RETURN_MAX_AGE_MS + 1)).toBeNull();
    expect(parseLiveReturnNote(JSON.stringify(gift), 'astro', NOW - 1)).toBeNull();
    expect(parseLiveReturnNote(JSON.stringify({ ...gift, since: 'x' }), 'astro', NOW)).toBeNull();
    expect(parseLiveReturnNote(JSON.stringify({ ...gift, kind: 'plan' }), 'astro', NOW)).toBeNull();
    expect(parseLiveReturnNote('{oops', 'astro', NOW)).toBeNull();
    expect(parseLiveReturnNote(null, 'astro', NOW)).toBeNull();
  });
});

describe('take', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is read once, and only by its own stream', () => {
    leaveLiveReturnNote({ ...gift, at: Date.now() });
    expect(takeLiveReturnNote('other')).toBeNull();
    expect(window.sessionStorage.getItem(LIVE_RETURN_KEY)).not.toBeNull();
    expect(takeLiveReturnNote('astro')?.kind).toBe('gift');
    expect(takeLiveReturnNote('astro')).toBeNull();
  });
});
