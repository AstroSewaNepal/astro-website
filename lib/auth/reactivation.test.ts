import { CredentialsSignin } from '@auth/core/errors'; // the class next-auth re-exports
import { encode } from 'next-auth/jwt';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { signInErrorCode, signInErrorHandoff } from './google-signin';
import { openHandoff, reactivationCookie, sealHandoff } from './reactivation';
import { authSecret } from './secret';

const handoff = {
  accessToken: 'access',
  refreshToken: 'refresh',
  role: 'USER' as const,
  callbackUrl: '/astrologers',
};

describe('reactivation handoff', () => {
  afterEach(() => vi.useRealTimers());

  it('opens what this server sealed', async () => {
    expect(await openHandoff(await sealHandoff(handoff))).toEqual(handoff);
  });

  it('is encrypted: the tokens are not readable in the cookie', async () => {
    const sealed = await sealHandoff(handoff);
    expect(sealed).not.toContain('refresh');
    expect(Buffer.from(sealed.split('.')[1] ?? '', 'base64url').toString()).not.toContain('refresh');
  });

  it('refuses a tampered, foreign or missing handoff', async () => {
    const sealed = await sealHandoff(handoff);
    expect(await openHandoff(`${sealed.slice(0, -2)}xx`)).toBeNull();
    expect(await openHandoff(undefined)).toBeNull();
    expect(await openHandoff('garbage')).toBeNull();
    // A session cookie (same key, the session salt) is not a handoff.
    const session = await encode({ token: handoff, secret: authSecret!, salt: 'authjs.session-token' });
    expect(await openHandoff(session)).toBeNull();
  });

  it('expires after 10 minutes', async () => {
    const sealed = await sealHandoff(handoff);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 11 * 60 * 1000);
    expect(await openHandoff(sealed)).toBeNull();
  });

  it('never sends the person to another site afterwards', async () => {
    const sealed = await sealHandoff({ ...handoff, callbackUrl: '//evil.example' });
    expect((await openHandoff(sealed))?.callbackUrl).toBe('');
  });

  it('is a __Host- cookie on https', () => {
    expect(reactivationCookie(true)).toBe('__Host-astro-reactivate');
  });
});

describe('signInErrorHandoff', () => {
  const failure = (code: string, extra: object = {}) => Object.assign(new CredentialsSignin(), { code }, extra);

  it('comes only with a pending-deletion failure', () => {
    const pending = failure('pending_deletion', { handoff: 'sealed' });
    expect(signInErrorCode(pending)).toBe('pending_deletion');
    expect(signInErrorHandoff(pending)).toBe('sealed');
    expect(signInErrorHandoff({ cause: { err: pending } })).toBe('sealed');
    expect(signInErrorHandoff(failure('role_mismatch', { handoff: 'sealed' }))).toBeNull();
    expect(signInErrorHandoff(failure('pending_deletion'))).toBeNull();
  });
});
