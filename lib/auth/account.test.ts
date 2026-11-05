import { describe, expect, it } from 'vitest';

import { accountHome, accountKind, safeReturnPath, signInAgainPath } from './account';

describe('accountKind', () => {
  it('maps backend roles to the site area', () => {
    expect(accountKind(['USER'])).toBe('client');
    expect(accountKind(['ASTROLOGER'])).toBe('astrologer');
    expect(accountKind(['ADMIN'])).toBe('admin');
    expect(accountKind(['SUPER_ADMIN'])).toBe('admin');
  });
  it('lets admin win over other roles', () => {
    expect(accountKind(['USER', 'ADMIN'])).toBe('admin');
  });
  it('returns null for no or unknown roles', () => {
    expect(accountKind(undefined)).toBeNull();
    expect(accountKind([])).toBeNull();
    expect(accountKind(['GUEST'])).toBeNull();
  });
});

describe('accountHome', () => {
  it('sends each account to its own home', () => {
    expect(accountHome(['USER'])).toBe('/client');
    expect(accountHome(['ASTROLOGER'])).toBe('/astrologer');
    expect(accountHome(['ADMIN'])).toBe('/admin/dashboard');
    expect(accountHome([])).toBe('/');
  });
});

describe('safeReturnPath', () => {
  it('keeps same-site paths', () => {
    expect(safeReturnPath('/client/payments?page=2', '/')).toBe('/client/payments?page=2');
  });
  it('drops anything that could leave the site', () => {
    expect(safeReturnPath('https://evil.example', '/')).toBe('/');
    expect(safeReturnPath('//evil.example', '/')).toBe('/');
    expect(safeReturnPath('/\\evil.example', '/')).toBe('/');
    expect(safeReturnPath(undefined, '/x')).toBe('/x');
  });
});

describe('signInAgainPath', () => {
  it('sends clients and astrologers to the Sign in page, on their tab, and back', () => {
    expect(signInAgainPath('/client/profile')).toBe('/login?callbackUrl=%2Fclient%2Fprofile');
    expect(signInAgainPath('/astrologer/earnings?x=1')).toBe(
      '/login?callbackUrl=%2Fastrologer%2Fearnings%3Fx%3D1&role=astrologer',
    );
  });
  it('keeps admins on their page (it shows the admin login)', () => {
    expect(signInAgainPath('/admin/gifts')).toBe('/admin/gifts');
  });
  it('never leaves the site', () => {
    expect(signInAgainPath('//evil.example')).toBe('/login?callbackUrl=%2F');
  });
});
