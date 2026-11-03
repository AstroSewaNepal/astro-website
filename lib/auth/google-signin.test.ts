import { CredentialsSignin } from '@auth/core/errors'; // the class next-auth re-exports
import { describe, expect, it } from 'vitest';

import {
  decodePendingSignIn,
  encodePendingSignIn,
  newState,
  pendingSignInCookie,
  sameState,
  signInErrorCode,
  signInErrorMessage,
} from './google-signin';

describe('pending Google sign-in cookie', () => {
  it('round-trips the state, role and return path', () => {
    const pending = { state: newState(), role: 'ASTROLOGER' as const, callbackUrl: '/astrologers/ram?tab=reviews' };
    expect(decodePendingSignIn(encodePendingSignIn(pending))).toEqual(pending);
  });

  it('makes a fresh 256-bit state every time', () => {
    const a = newState();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newState()).not.toBe(a);
  });

  it('refuses anything it did not write', () => {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    expect(decodePendingSignIn(undefined)).toBeNull();
    expect(decodePendingSignIn('not base64 json')).toBeNull();
    expect(decodePendingSignIn(encode({ state: newState(), role: 'SUPER_ADMIN', callbackUrl: '' }))).toBeNull();
    expect(decodePendingSignIn(encode({ state: 'short', role: 'USER', callbackUrl: '' }))).toBeNull();
  });

  it('never returns to another site', () => {
    const state = newState();
    const decoded = (callbackUrl: unknown) =>
      decodePendingSignIn(Buffer.from(JSON.stringify({ state, role: 'USER', callbackUrl })).toString('base64url'))
        ?.callbackUrl;
    expect(decoded('https://evil.example')).toBe('');
    expect(decoded('//evil.example')).toBe('');
    expect(decoded(42)).toBe('');
  });

  it('is a __Host- cookie on https', () => {
    expect(pendingSignInCookie(true)).toBe('__Host-astro-google-signin');
    expect(pendingSignInCookie(false)).toBe('astro-google-signin');
  });
});

describe('sameState', () => {
  it('matches only the exact state', () => {
    const state = newState();
    expect(sameState(state, state)).toBe(true);
    const lastFlipped = state.slice(0, -1) + (state.endsWith('A') ? 'B' : 'A');
    expect(sameState(state, lastFlipped)).toBe(false);
    expect(sameState(state, state.slice(1))).toBe(false);
    expect(sameState(state, null)).toBe(false);
    expect(sameState(state, '')).toBe(false);
  });
});

describe('signInErrorCode', () => {
  const reason = (code: string) => Object.assign(new CredentialsSignin(), { code });

  it('reads the reason the provider gave', () => {
    expect(signInErrorCode(reason('role_mismatch'))).toBe('role_mismatch');
    expect(signInErrorCode(reason('suspended'))).toBe('suspended');
  });

  it('finds it inside the wrapper a second next-auth copy adds', () => {
    const wrapped = Object.assign(new Error('CallbackRouteError'), {
      type: 'CallbackRouteError',
      cause: { err: reason('admin_account') },
    });
    expect(signInErrorCode(wrapped)).toBe('admin_account');
  });

  it('is a plain failure for anything else', () => {
    expect(signInErrorCode(new CredentialsSignin())).toBe('google_failed'); // code 'credentials'
    expect(signInErrorCode(new Error('boom'))).toBe('google_failed');
    expect(signInErrorCode(null)).toBe('google_failed');
  });
});

describe('signInErrorMessage', () => {
  it('points a role mismatch at the other tab, like the app', () => {
    expect(signInErrorMessage('role_mismatch', 'client')).toContain('"Astrologer" tab');
    expect(signInErrorMessage('role_mismatch', 'astrologer')).toContain('"Client" tab');
  });
});
