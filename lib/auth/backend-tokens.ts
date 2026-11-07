// Server-side helpers for the backend's JWTs (access 365 days today, shorter after security A11; refresh tokens rotate).
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  roles?: string[];
};

/** Expiry of a JWT in ms since epoch, read without verifying (the backend verifies). Null when unreadable. */
export function getJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown;
    };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Trades a refresh token for new tokens. The backend invalidates the old refresh token, so callers must store the new
 * pair and never refresh twice with the same one (see lib/backend/token-refresher.ts). Null when the backend refuses.
 */
export async function refreshBackendTokens(refreshToken: string): Promise<BackendTokens | null> {
  const apiRoot = tryGetPublicBackendBaseUrl();
  if (!apiRoot) return null;
  try {
    const res = await fetch(`${apiRoot}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!json?.success || !data?.accessToken || !data?.refreshToken) return null;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      roles: Array.isArray(data.user?.roles) ? data.user.roles : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Ends a backend session (the refresh token stops working). `deviceType: 'WEB'` keeps the push token the user's phone
 * app registered; the website never registers one. Best effort: a dead or refused token is already logged out.
 */
export async function revokeBackendSession(refreshToken: string): Promise<void> {
  const apiRoot = tryGetPublicBackendBaseUrl();
  if (!apiRoot) return;
  try {
    await fetch(`${apiRoot}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceType: 'WEB' }),
      cache: 'no-store',
    });
  } catch {
    // network failure: the token still expires on its own
  }
}

/** The account's email as the backend has it now (after Change email). Null when it can't be read. */
export async function fetchBackendEmail(accessToken: string): Promise<string | null> {
  const email = (await fetchBackendMe(accessToken))?.user?.email;
  return typeof email === 'string' && email.includes('@') ? email : null;
}

/**
 * The person's profile picture URL (https only), or null. Login responses carry the picture unpopulated (an id, no
 * url), so sign-in reads it from /users/me like the app does after login.
 */
export async function fetchBackendPicture(accessToken: string): Promise<string | null> {
  const url = (await fetchBackendMe(accessToken))?.profilePicture?.url;
  return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

async function fetchBackendMe(
  accessToken: string,
): Promise<{ user?: { email?: unknown }; profilePicture?: { url?: unknown } | null } | null> {
  const apiRoot = tryGetPublicBackendBaseUrl();
  if (!apiRoot) return null;
  try {
    const res = await fetch(`${apiRoot}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
