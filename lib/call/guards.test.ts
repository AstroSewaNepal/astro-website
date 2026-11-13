import { describe, expect, it, vi } from 'vitest';

import { CALL_LOCK_NAME, takeCallLock, type LockManagerLike } from '@/lib/call/tab-lock';
import { keepScreenOn, type WakeLockEnv } from '@/lib/call/wake-lock';

/** navigator.locks with one exclusive lock per name, like the browser's across tabs. */
function fakeLocks(): LockManagerLike & { held: Set<string> } {
  const held = new Set<string>();
  return {
    held,
    async request(name, options, callback) {
      if (held.has(name)) {
        expect(options.ifAvailable).toBe(true);
        return callback(null);
      }
      held.add(name);
      try {
        return await callback({ name });
      } finally {
        held.delete(name);
      }
    },
  };
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('takeCallLock', () => {
  it('gives the lock to the first tab and refuses a second until it is released', async () => {
    const locks = fakeLocks();
    const first = await takeCallLock(locks);
    expect(first).not.toBeNull();
    expect(locks.held.has(CALL_LOCK_NAME)).toBe(true);

    expect(await takeCallLock(locks)).toBeNull();

    first!.release();
    await flush();
    expect(locks.held.has(CALL_LOCK_NAME)).toBe(false);
    const again = await takeCallLock(locks);
    expect(again).not.toBeNull();
    again!.release();
  });

  it('lets the call go ahead when the browser has no Web Locks or they fail', async () => {
    expect(await takeCallLock(undefined)).not.toBeNull();
    const broken: LockManagerLike = { request: () => Promise.reject(new Error('SecurityError')) };
    expect(await takeCallLock(broken)).not.toBeNull();
  });
});

function fakePage(visible = true) {
  const listeners = new Set<() => void>();
  const page = {
    visibilityState: (visible ? 'visible' : 'hidden') as DocumentVisibilityState,
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
  };
  const show = (next: boolean) => {
    page.visibilityState = next ? 'visible' : 'hidden';
    for (const fn of listeners) fn();
  };
  return { page, show, listeners };
}

describe('keepScreenOn', () => {
  it('takes a screen wake lock, takes it again when the page comes back, and lets go when stopped', async () => {
    const released: number[] = [];
    let n = 0;
    const request = vi.fn(async () => {
      const id = ++n;
      return { release: async () => void released.push(id) };
    });
    const { page, show, listeners } = fakePage();
    const stop = keepScreenOn({ wakeLock: { request }, page } as unknown as WakeLockEnv);
    await flush();
    expect(request).toHaveBeenCalledWith('screen');

    // Hidden: the browser drops the lock by itself; nothing to ask for until the page is back.
    show(false);
    expect(request).toHaveBeenCalledTimes(1);
    show(true);
    await flush();
    expect(request).toHaveBeenCalledTimes(2);

    stop();
    await flush();
    expect(released).toEqual([2]);
    expect(listeners.size).toBe(0);
  });

  it('releases a lock that arrives after the call stopped', async () => {
    let grant: (s: { release: () => Promise<void> }) => void = () => {};
    const release = vi.fn(async () => {});
    const request = vi.fn(() => new Promise<{ release: () => Promise<void> }>(r => (grant = r)));
    const { page } = fakePage();
    const stop = keepScreenOn({ wakeLock: { request }, page } as unknown as WakeLockEnv);
    stop();
    grant({ release });
    await flush();
    expect(release).toHaveBeenCalled();
  });

  it('does nothing without the Wake Lock API, and survives a refusal', async () => {
    const { page } = fakePage();
    expect(() => keepScreenOn({ wakeLock: undefined, page } as unknown as WakeLockEnv)()).not.toThrow();
    const request = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
    const stop = keepScreenOn({ wakeLock: { request }, page } as unknown as WakeLockEnv);
    await flush();
    stop();
  });
});
