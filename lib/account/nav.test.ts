import { describe, expect, it } from 'vitest';

import { isClientShellPage, parentPage } from './nav';

describe('parentPage', () => {
  it('goes one level up from a sub-page', () => {
    expect(parentPage('/client/settings/security')).toBe('/client/settings');
  });
  it('sends a profile back to the Astro Connect list', () => {
    expect(parentPage('/astrologer-profile/abc')).toBe('/astrologers');
  });
  it('has no parent for first-level pages', () => {
    expect(parentPage('/client/settings')).toBeNull();
    expect(parentPage('/astrologers')).toBeNull();
  });
});

it('knows the public pages clients see in their shell', () => {
  expect(isClientShellPage('/astrologers')).toBe(true);
  expect(isClientShellPage('/astrologer-profile/abc')).toBe(true);
  expect(isClientShellPage('/astrologer')).toBe(false);
  expect(isClientShellPage('/astrologers-x')).toBe(false);
});
