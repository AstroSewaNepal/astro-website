import { describe, expect, it } from 'vitest';

import { isClientShellPage, parentPage } from './nav';

describe('parentPage', () => {
  it('goes one level up from a sub-page', () => {
    expect(parentPage('/client/settings/security')).toBe('/client/settings');
  });
  it('sends a profile back to the Astro Connect list', () => {
    expect(parentPage('/astrologer-profile/abc')).toBe('/astrologers');
  });
  it('sends packages to the profile and schedule to the packages', () => {
    expect(parentPage('/astrologer-profile/abc/packages')).toBe('/astrologer-profile/abc');
    expect(parentPage('/astrologer-profile/abc/schedule')).toBe('/astrologer-profile/abc/packages');
  });
  it('sends plan bookings and reschedules back to My Consultations', () => {
    const at = (q: string) =>
      parentPage('/astrologer-profile/abc/schedule', new URLSearchParams(q));
    expect(at('booking=b1')).toBe('/client/consultations');
    expect(at('plan=p1')).toBe('/client/consultations');
    expect(at('package=k1')).toBe('/astrologer-profile/abc/packages');
  });
  it('has no parent for first-level pages', () => {
    expect(parentPage('/client/settings')).toBeNull();
    expect(parentPage('/astrologers')).toBeNull();
  });
});

it('knows the public pages clients see in their shell', () => {
  expect(isClientShellPage('/astrologers')).toBe(true);
  expect(isClientShellPage('/astrologer-profile/abc')).toBe(true);
  expect(isClientShellPage('/payment/return')).toBe(true);
  expect(isClientShellPage('/astrologer')).toBe(false);
  expect(isClientShellPage('/astrologers-x')).toBe(false);
});
