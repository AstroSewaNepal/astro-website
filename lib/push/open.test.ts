import { describe, expect, it } from 'vitest';

import { notificationOpenTarget, openOnTopTarget, readOpenParams } from './open';

const ID = '0123456789abcdef01234567';
const params = (q: Record<string, string>) => new URLSearchParams(q);

describe('readOpenParams', () => {
  it('keeps only the known keys with plain values', () => {
    expect(
      readOpenParams(
        params({ type: 'chat_message', connectionScheduleId: ID, evil: 'x', astrologerId: '../../x' }),
      ),
    ).toEqual({ type: 'chat_message', connectionScheduleId: ID });
  });
});

describe('notificationOpenTarget', () => {
  it('sends a client to the consultation like the list row', () => {
    expect(
      notificationOpenTarget(params({ type: 'chat_message', connectionScheduleId: ID }), ['USER']),
    ).toBe(`/client/consultations/${ID}`);
  });

  it('sends a live push to the astrologer profile', () => {
    expect(notificationOpenTarget(params({ type: 'astro_went_live', astrologerId: ID }), ['USER'])).toBe(
      `/astrologer-profile/${ID}`,
    );
  });

  it('sends an astrologer booking to the astrologer home', () => {
    expect(notificationOpenTarget(params({ type: 'connection_schedule' }), ['ASTROLOGER'])).toBe('/astrologer');
  });

  it('unknown type goes home', () => {
    expect(notificationOpenTarget(params({}), ['USER'])).toBe('/client');
  });

  it('logged out: sign in, then back to the same link', () => {
    const target = notificationOpenTarget(
      params({ type: 'connection_schedule', notificationUserRole: 'ASTROLOGER' }),
      null,
    );
    const url = new URL(target, 'https://x.test');
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('role')).toBe('astrologer');
    expect(url.searchParams.get('callbackUrl')).toBe(
      '/notification-open?type=connection_schedule&notificationUserRole=ASTROLOGER',
    );
  });

  it('new window: lands on home, which opens the page on top', () => {
    expect(
      notificationOpenTarget(params({ type: 'chat_message', connectionScheduleId: ID, fresh: '1' }), ['USER']),
    ).toBe(`/client?then=${encodeURIComponent(`/client/consultations/${ID}`)}`);
  });

  it('new window whose page is home: just home', () => {
    expect(notificationOpenTarget(params({ type: 'connection_schedule', fresh: '1' }), ['ASTROLOGER'])).toBe(
      '/astrologer',
    );
  });

  it('admin login is treated as logged out', () => {
    expect(notificationOpenTarget(params({ type: 'chat_message' }), ['SUPER_ADMIN'])).toMatch(/^\/login\?/);
  });
});

describe('openOnTopTarget', () => {
  it('same-site paths only', () => {
    expect(openOnTopTarget(`/client/consultations/${ID}`)).toBe(`/client/consultations/${ID}`);
    expect(openOnTopTarget('https://evil.test/x')).toBeNull();
    expect(openOnTopTarget('//evil.test')).toBeNull();
    expect(openOnTopTarget('/notification-open?type=x')).toBeNull();
    expect(openOnTopTarget(null)).toBeNull();
  });
});
