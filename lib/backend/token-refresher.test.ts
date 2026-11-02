import { describe, expect, it, vi } from 'vitest';

import { createTokenRefresher, REFRESH_MARGIN_MS, type TokenSession } from './token-refresher';

const NOW = 1_000_000;
const later = NOW + 60 * 60_000;

/** Fake server: one shared cookie, and a refresh that only rotates when the failed token is still current. */
function fakeServer(start: TokenSession) {
  let state = { ...start };
  let refreshes = 0;
  return {
    readSession: vi.fn(async () => ({ ...state })),
    forceRefresh: vi.fn(async (failedToken: string) => {
      await new Promise(r => setTimeout(r, 5));
      if (failedToken === state.accessToken) {
        refreshes += 1;
        state = { accessToken: `new-${refreshes}`, expiresAt: later, refreshFailed: false };
      }
      return { ...state };
    }),
    get refreshes() {
      return refreshes;
    },
    fail() {
      state = { ...state, refreshFailed: true };
    },
  };
}

describe('createTokenRefresher', () => {
  it('uses the session token while it is fresh', async () => {
    const server = fakeServer({ accessToken: 'a', expiresAt: later, refreshFailed: false });
    const r = createTokenRefresher({ ...server, now: () => NOW });
    expect(await r.getToken({ accessToken: 'a', expiresAt: later, refreshFailed: false })).toBe(
      'a',
    );
    expect(server.forceRefresh).not.toHaveBeenCalled();
  });

  it('refreshes before the token expires', async () => {
    const soon = NOW + REFRESH_MARGIN_MS - 1;
    const server = fakeServer({ accessToken: 'a', expiresAt: soon, refreshFailed: false });
    const r = createTokenRefresher({ ...server, now: () => NOW });
    expect(await r.getToken({ accessToken: 'a', expiresAt: soon, refreshFailed: false })).toBe(
      'new-1',
    );
  });

  it('refreshes once when two tabs hit a 401 at the same time', async () => {
    const server = fakeServer({ accessToken: 'a', expiresAt: later, refreshFailed: false });
    const tab1 = createTokenRefresher({ ...server, now: () => NOW });
    const tab2 = createTokenRefresher({ ...server, now: () => NOW });
    const [t1, t2] = await Promise.all([tab1.refresh('a'), tab2.refresh('a')]);
    expect(t1).toBe('new-1');
    expect(t2).toBe('new-1');
    expect(server.refreshes).toBe(1);
  });

  it('returns null when the refresh token was refused', async () => {
    const server = fakeServer({ accessToken: 'a', expiresAt: later, refreshFailed: false });
    server.fail();
    const r = createTokenRefresher({ ...server, now: () => NOW });
    expect(await r.refresh('a')).toBeNull();
    expect(
      await r.getToken({ accessToken: 'a', expiresAt: later, refreshFailed: true }),
    ).toBeNull();
  });

  it('returns null when logged out', async () => {
    const server = fakeServer({ accessToken: null, expiresAt: null, refreshFailed: false });
    const r = createTokenRefresher({ ...server, now: () => NOW });
    expect(
      await r.getToken({ accessToken: null, expiresAt: null, refreshFailed: false }),
    ).toBeNull();
    expect(await r.refresh('a')).toBeNull();
  });
});
