import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  HIDE_ID,
  HIDE_MAX_MS,
  LANDING_KEY,
  noteOutsideTrip,
  outsideTripScript,
  PAINT_WAIT_MS,
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
  // Just enough of the page for the style that hides it.
  const nodes = new Map<string, { id: string; textContent: string; parentNode: unknown }>();
  const head = {
    appendChild: (node: { id: string; textContent: string; parentNode: unknown }) => {
      node.parentNode = head;
      nodes.set(node.id, node);
    },
    removeChild: (node: { id: string }) => void nodes.delete(node.id),
  };
  const timers: { fn: () => void; ms: number }[] = [];
  const frames: (() => void)[] = [];
  const window = {
    document: {
      head,
      getElementById: (id: string) => nodes.get(id) ?? null,
      createElement: () => ({ id: '', textContent: '', parentNode: null }),
    },
    setTimeout: (fn: () => void, ms: number) => void timers.push({ fn, ms }),
    requestAnimationFrame: (fn: () => void) => void frames.push(fn),
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
  const run = new Function('window', 'JSON', SCRIPT) as (w: unknown, j: JSON) => void;
  run(window, JSON);
  const hidden = () => nodes.has(HIDE_ID);
  /** Runs what is due within `ms` (frames first, as a browser draws before a 250 ms timer). */
  const advance = (ms: number) => {
    frames.splice(0).forEach(fn => fn());
    for (const t of timers.splice(0)) (t.ms <= ms ? t.fn : () => timers.push(t))();
  };
  return {
    window,
    storage,
    listeners,
    hidden,
    hideCss: () => nodes.get(HIDE_ID)?.textContent,
    timers,
    frames,
    advance,
  };
}

const NOW = 1_800_000_000_000;
const SCRIPT = outsideTripScript('/_next/static/media/background.webp');
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
    // Hidden behind the paper background until the jump leaves the page.
    expect(t.hidden()).toBe(true);
    expect(t.hideCss()).toContain('url("/_next/static/media/background.webp")');
    expect(t.hideCss()).toContain('body{visibility:hidden!important}');
    expect(JSON.parse(t.storage.get(LANDING_KEY)!)).toEqual({
      url: 'https://site.test/payment/return?pidx=1',
      at: NOW,
    });
    expect(t.storage.has(TRIP_KEY)).toBe(false);
  });

  it('then swaps the page it lands on for the result', () => {
    const landing = JSON.stringify({
      url: 'https://site.test/payment/return?pidx=1',
      at: NOW - 500,
    });
    const t = tab({
      href: 'https://site.test/astrologer-profile/a1',
      length: 9,
      storage: { [LANDING_KEY]: landing },
      now: NOW,
    });
    // Hidden at once; swapped once the paper has been drawn.
    expect(t.hidden()).toBe(true);
    expect(t.window.location.replace).not.toHaveBeenCalled();
    t.advance(0);
    expect(t.window.location.replace).toHaveBeenCalledTimes(1);
    expect(t.window.location.replace).toHaveBeenCalledWith(
      'https://site.test/payment/return?pidx=1',
    );
    // The fallback timer doesn't swap twice.
    t.advance(PAINT_WAIT_MS);
    expect(t.window.location.replace).toHaveBeenCalledTimes(1);
    expect(t.storage.has(LANDING_KEY)).toBe(false);
    expect(t.window.history.go).not.toHaveBeenCalled();
  });

  it('swaps without a drawn frame when none comes in time', () => {
    const landing = JSON.stringify({
      url: 'https://site.test/payment/return?pidx=1',
      at: NOW - 500,
    });
    const t = tab({
      href: 'https://site.test/astrologer-profile/a1',
      length: 9,
      storage: { [LANDING_KEY]: landing },
      now: NOW,
    });
    t.frames.length = 0;
    t.advance(PAINT_WAIT_MS);
    expect(t.window.location.replace).toHaveBeenCalledTimes(1);
  });

  it('shows the page again if a jump never leaves it', () => {
    const t = tab({
      href: 'https://site.test/payment/return?pidx=1',
      length: 9,
      storage: { [TRIP_KEY]: trip() },
      now: NOW,
    });
    expect(t.hidden()).toBe(true);
    t.advance(HIDE_MAX_MS - 1);
    expect(t.hidden()).toBe(true);
    t.advance(HIDE_MAX_MS);
    expect(t.hidden()).toBe(false);
  });

  it('also swaps when that page comes back from the back/forward cache', () => {
    const t = tab({ href: 'https://site.test/astrologer-profile/a1', length: 9, now: NOW });
    t.storage.set(LANDING_KEY, JSON.stringify({ url: 'https://site.test/client', at: NOW - 500 }));
    t.listeners.pageshow({ persisted: false });
    expect(t.window.location.replace).not.toHaveBeenCalled();
    t.listeners.pageshow({ persisted: true });
    expect(t.window.location.replace).toHaveBeenCalledWith('https://site.test/client');
    expect(t.hidden()).toBe(true);
  });

  it('the page left for the other site hides itself when kept in the back/forward cache', () => {
    const t = tab({ href: 'https://site.test/astrologer-profile/a1', length: 4, now: NOW });
    // What noteOutsideTrip does right before leaving.
    t.window.history.state = { [TAG_KEY]: 't1' };
    t.storage.set(TRIP_KEY, trip({ length: 5 }));
    t.listeners.pagehide({ persisted: false });
    expect(t.hidden()).toBe(false);
    t.listeners.pagehide({ persisted: true });
    expect(t.hidden()).toBe(true);
    // The jump back restores it: it swaps in the result while still hidden.
    t.storage.delete(TRIP_KEY);
    t.storage.set(
      LANDING_KEY,
      JSON.stringify({ url: 'https://site.test/payment/return?pidx=1', at: NOW - 500 }),
    );
    t.listeners.pageshow({ persisted: true });
    expect(t.window.location.replace).toHaveBeenCalledWith(
      'https://site.test/payment/return?pidx=1',
    );
    expect(t.hidden()).toBe(true);
  });

  it('not when it leaves for anything else', () => {
    const t = tab({ href: 'https://site.test/astrologer-profile/a1', length: 4, now: NOW });
    t.storage.set(TRIP_KEY, trip({ length: 5 }));
    t.listeners.pagehide({ persisted: true });
    expect(t.hidden()).toBe(false);
  });

  it('a page restored while still hidden from an earlier jump shows itself', () => {
    const t = tab({
      href: 'https://site.test/payment/return?pidx=1',
      length: 9,
      storage: { [TRIP_KEY]: trip() },
      now: NOW,
    });
    expect(t.hidden()).toBe(true);
    t.listeners.pageshow({ persisted: true });
    expect(t.hidden()).toBe(false);
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
    expect(t.hidden()).toBe(true);
  });

  it('the same when the tagged copy comes back from the cache', () => {
    const t = tab({
      href: 'https://site.test/login',
      length: 8,
      state: { [TAG_KEY]: 't1' },
      now: NOW,
    });
    t.storage.set(TRIP_KEY, trip({ kind: 'login' }));
    t.listeners.pageshow({ persisted: true });
    expect(t.storage.has(TRIP_KEY)).toBe(false);
    expect(t.window.history.back).toHaveBeenCalledTimes(1);
    expect(t.window.location.replace).not.toHaveBeenCalled();
    // The step back stays inside this restored page, which must stay visible.
    expect(t.hidden()).toBe(false);
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
    expect(t.hidden()).toBe(false);
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
    const run = new Function('window', SCRIPT) as (w: unknown) => void;
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
