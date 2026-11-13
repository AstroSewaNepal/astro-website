import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  LANDING_KEY,
  noteOutsideTrip,
  OUTSIDE_TRIP_SCRIPT,
  TAG_KEY,
  TRIP_KEY,
  TRIP_MAX_AGE_MS,
} from '@/lib/navigation/outside-trip';

/** A browser tab as the script sees it on one page load. */
function tab(opts: {
  href: string;
  length: number;
  state?: unknown;
  storage?: Record<string, string>;
  now?: number;
}) {
  const storage = new Map(Object.entries(opts.storage ?? {}));
  const url = new URL(opts.href);
  const listeners: Record<string, (event: { persisted: boolean }) => void> = {};
  const window = {
    sessionStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    },
    location: { href: url.href, pathname: url.pathname, replace: vi.fn() },
    history: { length: opts.length, state: opts.state ?? null, go: vi.fn(), back: vi.fn() },
    addEventListener: (name: string, fn: (event: { persisted: boolean }) => void) => {
      listeners[name] = fn;
    },
  };
  const now = opts.now ?? Date.now();
  vi.spyOn(Date, 'now').mockReturnValue(now);
  const run = new Function('window', 'JSON', OUTSIDE_TRIP_SCRIPT) as (w: unknown, j: JSON) => void;
  run(window, JSON);
  return { window, storage, listeners };
}

const NOW = 1_800_000_000_000;
const trip = (o: Partial<{ kind: string; length: number; at: number; token: string }> = {}) =>
  JSON.stringify({ kind: 'payment', length: 5, at: NOW - 60_000, token: 't1', ...o });

afterEach(() => vi.restoreAllMocks());

describe('outside trip script', () => {
  it('jumps back over the gateway pages from the payment result', () => {
    const t = tab({
      href: 'https://site.test/payment/return?pidx=1',
      length: 9,
      storage: { [TRIP_KEY]: trip() },
      now: NOW,
    });
    expect(t.window.history.go).toHaveBeenCalledWith(-4);
    expect(JSON.parse(t.storage.get(LANDING_KEY)!)).toEqual({
      url: 'https://site.test/payment/return?pidx=1',
      at: NOW,
    });
    expect(t.storage.has(TRIP_KEY)).toBe(false);
  });

  it('then swaps the page it lands on for the result', () => {
    const landing = JSON.stringify({ url: 'https://site.test/payment/return?pidx=1', at: NOW - 500 });
    const t = tab({
      href: 'https://site.test/astrologer-profile/a1',
      length: 9,
      storage: { [LANDING_KEY]: landing },
      now: NOW,
    });
    expect(t.window.location.replace).toHaveBeenCalledWith('https://site.test/payment/return?pidx=1');
    expect(t.storage.has(LANDING_KEY)).toBe(false);
    expect(t.window.history.go).not.toHaveBeenCalled();
  });

  it('also swaps when that page comes back from the back/forward cache', () => {
    const t = tab({ href: 'https://site.test/astrologer-profile/a1', length: 9, now: NOW });
    t.storage.set(LANDING_KEY, JSON.stringify({ url: 'https://site.test/client', at: NOW - 500 }));
    t.listeners.pageshow({ persisted: false });
    expect(t.window.location.replace).not.toHaveBeenCalled();
    t.listeners.pageshow({ persisted: true });
    expect(t.window.location.replace).toHaveBeenCalledWith('https://site.test/client');
  });

  it('jumps back after signing in, wherever sign-in ends, to the sign-in page itself (under its copy)', () => {
    const t = tab({
      href: 'https://site.test/client',
      length: 7,
      storage: { [TRIP_KEY]: trip({ kind: 'login', length: 4 }) },
      now: NOW,
    });
    expect(t.window.history.go).toHaveBeenCalledWith(-4);
  });

  it('back on the tagged copy (trip not finished): drops the trip and steps over the copy', () => {
    const t = tab({
      href: 'https://site.test/login',
      // Google's pages are still ahead of it, so the length alone would wrongly jump.
      length: 8,
      state: { __NA: true, [TAG_KEY]: 't1' },
      storage: { [TRIP_KEY]: trip({ kind: 'login', length: 4 }) },
      now: NOW,
    });
    expect(t.window.history.go).not.toHaveBeenCalled();
    expect(t.window.history.back).toHaveBeenCalledTimes(1);
    expect(t.storage.has(TRIP_KEY)).toBe(false);
  });

  it('the same when the tagged copy comes back from the cache', () => {
    const t = tab({ href: 'https://site.test/login', length: 8, state: { [TAG_KEY]: 't1' }, now: NOW });
    t.storage.set(TRIP_KEY, trip({ kind: 'login' }));
    t.listeners.pageshow({ persisted: true });
    expect(t.storage.has(TRIP_KEY)).toBe(false);
    expect(t.window.history.back).toHaveBeenCalledTimes(1);
    expect(t.window.location.replace).not.toHaveBeenCalled();
  });

  it.each([
    ['a payment landing anywhere but the result page', 'https://site.test/client', trip(), 9],
    ['an old trip', 'https://site.test/payment/return', trip({ at: NOW - TRIP_MAX_AGE_MS - 1 }), 9],
    ['a history too long to count', 'https://site.test/payment/return', trip({ length: 45 }), 50],
    ['nothing added', 'https://site.test/payment/return', trip(), 5],
    ['a broken record', 'https://site.test/payment/return', '{nope', 9],
  ])('does nothing for %s', (_label, href, stored, length) => {
    const t = tab({ href, length, storage: { [TRIP_KEY]: stored }, now: NOW });
    expect(t.window.history.go).not.toHaveBeenCalled();
    expect(t.window.location.replace).not.toHaveBeenCalled();
    // Used up either way.
    expect(t.storage.has(TRIP_KEY)).toBe(false);
  });

  it('ignores a stale landing and does not reload the landing page itself', () => {
    const stale = tab({
      href: 'https://site.test/x',
      length: 3,
      storage: { [LANDING_KEY]: JSON.stringify({ url: 'https://site.test/y', at: NOW - 60_000 }) },
      now: NOW,
    });
    expect(stale.window.location.replace).not.toHaveBeenCalled();
    const same = tab({
      href: 'https://site.test/y',
      length: 3,
      storage: { [LANDING_KEY]: JSON.stringify({ url: 'https://site.test/y', at: NOW }) },
      now: NOW,
    });
    expect(same.window.location.replace).not.toHaveBeenCalled();
  });

  it('never throws when storage is blocked', () => {
    const window = {
      get sessionStorage(): never {
        throw new Error('blocked');
      },
      addEventListener: () => {},
    };
    const run = new Function('window', OUTSIDE_TRIP_SCRIPT) as (w: unknown) => void;
    expect(() => run(window)).not.toThrow();
  });
});

describe('noteOutsideTrip', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('adds a tagged copy of this page and notes the length', () => {
    const storage = new Map<string, string>();
    const history = {
      length: 4,
      state: { __NA: true } as unknown,
      pushState: vi.fn((state: unknown) => {
        history.state = state;
        history.length += 1;
      }),
    };
    vi.stubGlobal('window', {
      history,
      location: { href: 'https://site.test/astrologer-profile/a1' },
      sessionStorage: { setItem: (k: string, v: string) => storage.set(k, v) },
    });
    noteOutsideTrip('payment');
    expect(history.pushState).toHaveBeenCalledWith(
      expect.objectContaining({ __NA: true }),
      '',
      'https://site.test/astrologer-profile/a1',
    );
    const saved = JSON.parse(storage.get(TRIP_KEY)!);
    expect(saved).toMatchObject({ kind: 'payment', length: 5 });
    expect(history.state).toEqual({ __NA: true, [TAG_KEY]: saved.token });
  });

  it('never throws (storage blocked)', () => {
    vi.stubGlobal('window', {
      history: { state: null, length: 1, pushState: () => {} },
      location: { href: 'https://site.test/' },
      get sessionStorage(): never {
        throw new Error('blocked');
      },
    });
    expect(() => noteOutsideTrip('login')).not.toThrow();
  });
});
