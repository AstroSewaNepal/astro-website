// One call per browser: a second tab that opens a call while one is open in another tab would join the same room as
// the same person, and LiveKit would throw the first one out (DUPLICATE_IDENTITY). The Web Locks API holds a lock
// for as long as a call (or its before-call screen) is open. The browser frees it by itself when the tab closes or
// crashes, so it can never stay stuck the way a stored flag could (the app learned that with its MMKV call flag).

export const CALL_LOCK_NAME = 'astrosewa-call';

export type TabLock = { release: () => void };

/** The slice of navigator.locks this uses. */
export type LockManagerLike = {
  request(
    name: string,
    options: { ifAvailable: boolean },
    callback: (lock: unknown) => Promise<void> | void,
  ): Promise<unknown>;
};

const NO_LOCK: TabLock = { release: () => {} };

/**
 * Takes the call lock if no other tab holds it. Resolves null when another tab has a call open. Browsers without Web
 * Locks (very old ones) always get it: the call then still works, only the two-tab guard is missing.
 */
export function takeCallLock(locks: LockManagerLike | undefined = browserLocks()): Promise<TabLock | null> {
  if (!locks) return Promise.resolve(NO_LOCK);
  return new Promise(resolve => {
    let release = () => {};
    const held = new Promise<void>(done => {
      release = done;
    });
    locks
      .request(CALL_LOCK_NAME, { ifAvailable: true }, lock => {
        if (!lock) {
          resolve(null);
          return;
        }
        resolve({ release });
        // Held until release() settles this.
        return held;
      })
      .catch(() => resolve(NO_LOCK));
  });
}

function browserLocks(): LockManagerLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { locks?: LockManagerLike }).locks;
}
