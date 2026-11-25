import { describe, expect, it } from 'vitest';

import { hasOwnBack, isClientShellPage, parentPage } from './nav';

describe('parentPage', () => {
  it('goes one level up from a sub-page', () => {
    expect(parentPage('/client/settings/security')).toBe('/client/settings');
  });
  it('sends a profile back to the Astro Connect list', () => {
    expect(parentPage('/astrologer-profile/abc')).toBe('/astrologers');
    expect(parentPage('/live/abc')).toBe('/live');
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
    expect(parentPage('/client/reports')).toBeNull();
  });
  it('sends a saved report back to its Astro Reports tab, and its edit form back to it', () => {
    expect(parentPage('/client/reports/kundali/k1')).toBe('/client/reports');
    expect(parentPage('/client/reports/match/m1')).toBe('/client/reports?tab=match');
    expect(parentPage('/client/reports/match/m1/edit')).toBe('/client/reports/match/m1');
  });
});

it('knows the public pages clients see in their shell', () => {
  expect(isClientShellPage('/astrologers')).toBe(true);
  expect(isClientShellPage('/live/abc')).toBe(true);
  expect(isClientShellPage('/astrologer-profile/abc')).toBe(true);
  expect(isClientShellPage('/payment/return')).toBe(true);
  expect(isClientShellPage('/free-services')).toBe(true);
  expect(isClientShellPage('/astrologer')).toBe(false);
  expect(isClientShellPage('/astrologers-x')).toBe(false);
});

describe('hasOwnBack', () => {
  it('is only the chat page', () => {
    expect(hasOwnBack('/client/consultations/abc123')).toBe(true);
    expect(hasOwnBack('/client/consultations')).toBe(false);
    expect(hasOwnBack('/client/consultations/abc123/more')).toBe(false);
    expect(hasOwnBack('/client/settings/security')).toBe(false);
  });
});
