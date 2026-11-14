// Keeps the screen on during a call, so a phone doesn't dim and lock in the middle of it (the app keeps the screen
// on too). The browser drops a screen wake lock whenever the page is hidden, so it is taken again each time the page
// comes back. Browsers without it (older Safari, Firefox before 126) just let the screen sleep as usual.

type WakeLockSentinelLike = { release(): Promise<void> };
type WakeLockLike = { request(type: 'screen'): Promise<WakeLockSentinelLike> };

export type WakeLockEnv = {
  wakeLock: WakeLockLike | undefined;
  /** document, for visibilitychange and visibilityState. */
  page: Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>;
};

/** Starts keeping the screen on; the returned function stops it. */
export function keepScreenOn(env: WakeLockEnv | undefined = browserEnv()): () => void {
  if (!env?.wakeLock) return () => {};
  const { wakeLock, page } = env;
  let sentinel: WakeLockSentinelLike | null = null;
  let stopped = false;

  const take = () => {
    if (stopped || page.visibilityState !== 'visible') return;
    wakeLock.request('screen').then(
      next => {
        if (stopped) void next.release().catch(() => undefined);
        else sentinel = next;
      },
      // Refused (battery saver, no permission): the call goes on with the screen's normal timeout.
      () => undefined,
    );
  };
  const onVisibility = () => {
    if (page.visibilityState === 'visible') take();
  };

  take();
  page.addEventListener('visibilitychange', onVisibility);
  return () => {
    stopped = true;
    page.removeEventListener('visibilitychange', onVisibility);
    void sentinel?.release().catch(() => undefined);
    sentinel = null;
  };
}

function browserEnv(): WakeLockEnv | undefined {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return undefined;
  return {
    wakeLock: (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock,
    page: document,
  };
}
