// Gives the browser a valid backend access token. Refresh tokens rotate (the backend invalidates the old one), so two
// tabs refreshing at once would log the user out: refreshes run one at a time across tabs (Web Locks), and a tab that
// waited re-reads the session first, because the other tab's refresh has already updated the shared cookie.

export type TokenSession = {
  accessToken: string | null;
  /** ms since epoch, null when unknown */
  expiresAt: number | null;
  refreshFailed: boolean;
};

export type TokenRefresherDeps = {
  /** Latest session from the server (reads the cookie, never refreshes). */
  readSession: () => Promise<TokenSession>;
  /** Asks the server to refresh unless `failedToken` is no longer current; returns the resulting session. */
  forceRefresh: (failedToken: string) => Promise<TokenSession>;
  /** Runs `fn` while no other tab is refreshing. */
  lock?: <T>(fn: () => Promise<T>) => Promise<T>;
  now?: () => number;
};

/** Refresh this long before expiry so a request never leaves with a token that dies on the way. */
export const REFRESH_MARGIN_MS = 60_000;

const LOCK_NAME = 'astrosewa-token-refresh';

/** Web Locks span tabs; without them (old browsers, tests) fall back to one queue per tab. */
export function browserLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(LOCK_NAME, fn) as Promise<T>;
  }
  const run = tabQueue.then(fn, fn);
  tabQueue = run.catch(() => undefined);
  return run;
}
let tabQueue: Promise<unknown> = Promise.resolve();

export function createTokenRefresher({
  readSession,
  forceRefresh,
  lock = browserLock,
  now = Date.now,
}: TokenRefresherDeps) {
  const isFresh = (s: TokenSession) =>
    !!s.accessToken && (s.expiresAt === null || s.expiresAt - now() > REFRESH_MARGIN_MS);

  /**
   * New token after `failedToken` was rejected (or is about to expire). Null when the user must log in again.
   */
  async function refresh(failedToken: string): Promise<string | null> {
    return lock(async () => {
      const current = await readSession();
      if (current.refreshFailed || !current.accessToken) return null;
      // Another tab already refreshed while this one waited.
      if (current.accessToken !== failedToken && isFresh(current)) return current.accessToken;
      const next = await forceRefresh(current.accessToken);
      return next.refreshFailed ? null : next.accessToken;
    });
  }

  /** Token for the next request: the session's own, refreshed first when close to expiry. */
  async function getToken(session: TokenSession): Promise<string | null> {
    if (session.refreshFailed) return null;
    if (!session.accessToken || isFresh(session)) return session.accessToken;
    return refresh(session.accessToken);
  }

  return { getToken, refresh };
}
