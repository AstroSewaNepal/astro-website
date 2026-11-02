import { afterEach, describe, expect, it, vi } from 'vitest';

import { getJwtExpiry, refreshBackendTokens } from './backend-tokens';

const jwt = (payload: object) =>
  `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

describe('getJwtExpiry', () => {
  it('reads exp in ms', () => {
    expect(getJwtExpiry(jwt({ exp: 1_700_000_000 }))).toBe(1_700_000_000_000);
  });
  it('returns null without exp or for garbage', () => {
    expect(getJwtExpiry(jwt({ sub: 'u' }))).toBeNull();
    expect(getJwtExpiry('not-a-jwt')).toBeNull();
  });
});

describe('refreshBackendTokens', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the refresh token as Bearer and returns the new pair', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.example.com');
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            data: { accessToken: 'A2', refreshToken: 'R2', user: { roles: ['USER'] } },
          }),
        ),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await refreshBackendTokens('R1')).toEqual({
      accessToken: 'A2',
      refreshToken: 'R2',
      roles: ['USER'],
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.example.com/api/v1/auth/refresh');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer R1' });
  });

  it('returns null when the backend refuses', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.example.com');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    expect(await refreshBackendTokens('R1')).toBeNull();
  });
});
