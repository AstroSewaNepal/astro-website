import { describe, expect, it } from 'vitest';

import { isAstrologerOnline } from './status';

describe('isAstrologerOnline', () => {
  it('is online when available or busy, like the app', () => {
    expect(isAstrologerOnline('AVAILABLE')).toBe(true);
    expect(isAstrologerOnline('BUSY')).toBe(true);
  });

  it('is offline when offline or unknown', () => {
    expect(isAstrologerOnline('OFFLINE')).toBe(false);
    expect(isAstrologerOnline(undefined)).toBe(false);
    expect(isAstrologerOnline(null)).toBe(false);
    expect(isAstrologerOnline('')).toBe(false);
  });
});
