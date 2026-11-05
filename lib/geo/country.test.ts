import { describe, expect, it } from 'vitest';

import { countryFromHeaders, normalizeCountryCode, parseStoredCountry } from './country';

describe('country from the host', () => {
  it('reads only the current host’s header', () => {
    const h = new Headers({ 'cf-ipcountry': 'NP', 'x-vercel-ip-country': 'US' });
    expect(countryFromHeaders(h, false)).toBe('NP');
    expect(countryFromHeaders(h, true)).toBe('US');
    expect(countryFromHeaders(new Headers(), false)).toBeNull();
  });
  it('treats unknown, Tor and region codes as no country', () => {
    expect(normalizeCountryCode('in')).toBe('IN');
    for (const code of ['XX', 'T1', 'EU', 'AP', 'NPL', '', ' '])
      expect(normalizeCountryCode(code)).toBeNull();
  });
  it('ignores a broken saved value', () => {
    expect(parseStoredCountry('{"countryCode":"np","checkedAt":5}')).toEqual({
      countryCode: 'NP',
      checkedAt: 5,
    });
    expect(parseStoredCountry('{"countryCode":"XX","checkedAt":5}')).toBeNull();
    expect(parseStoredCountry('{"countryCode":"NP"}')).toBeNull();
    expect(parseStoredCountry('not json')).toBeNull();
  });
});
