'use client';

import type { Session } from 'next-auth';
import { getSession, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import type { RefreshRequest } from '@/auth';
import { createBackendClient } from '@/lib/backend/client';
import { createTokenRefresher, type TokenSession } from '@/lib/backend/token-refresher';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

const toTokenSession = (s: Session | null | undefined): TokenSession => ({
  accessToken: s?.backendAccessToken ?? null,
  expiresAt: s?.backendAccessTokenExpires ?? null,
  refreshFailed: s?.error === 'RefreshFailed',
});

// One client per page, shared by every component, so they also share one refresher. useBackendClient() keeps it
// fed with the latest session; before the first sync it asks the server once.
let latest: TokenSession | null = null;
let update: ReturnType<typeof useSession>['update'] | null = null;
let authLost = false;

const refresher = createTokenRefresher({
  readSession: async () => toTokenSession(await getSession()),
  forceRefresh: async failedToken => {
    const ask: RefreshRequest = { refresh: true, failedToken };
    const next = update ? await update(ask) : await getSession();
    return toTokenSession(next);
  },
});

const backendClient = createBackendClient({
  // Missing env should fail the request, not crash the page on import.
  baseUrl: tryGetPublicBackendBaseUrl() ?? '',
  getToken: async () => refresher.getToken(latest ?? toTokenSession(await getSession())),
  refreshToken: refresher.refresh,
  // TODO(03): send clients and astrologers to their own login page with a return path.
  onAuthLost: () => {
    if (authLost) return;
    authLost = true;
    void signOut({ redirectTo: '/' });
  },
});

/** Backend client for the logged-in user's own data. Works logged out too (no token is sent). */
export function useBackendClient() {
  const { data: session, status, update: updateSession } = useSession();
  useEffect(() => {
    update = updateSession;
    if (status !== 'loading') latest = toTokenSession(session);
  }, [session, status, updateSession]);
  return backendClient;
}
