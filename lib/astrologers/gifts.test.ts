import { describe, expect, it } from 'vitest';

import { availableGifts, type Gift, giftPriceLabel, isGiftFree } from './gifts';

const gift = (extra: Partial<Gift> = {}): Gift => ({
  _id: 'g1',
  title: 'Rose',
  prices: { npr: 50, inr: 40, usd: 10 },
  ...extra,
});

describe('gift prices', () => {
  it('uses the price for the buyer country', () => {
    expect(giftPriceLabel(gift({ displayPrice: 40, displayCurrency: 'INR' }))).toBe('₹ 40.00');
    expect(giftPriceLabel(gift({ displayPrice: 10, displayCurrency: 'USD' }))).toBe('$ 10.00');
    expect(giftPriceLabel(gift({ displayPrice: 50, displayCurrency: 'NPR' }))).toBe('NPR 50.00');
  });
  it('falls back to NPR without a display price', () => {
    expect(giftPriceLabel(gift())).toBe('NPR 50.00');
  });
  it('knows free gifts', () => {
    expect(isGiftFree(gift({ displayPrice: 0 }))).toBe(true);
    expect(isGiftFree(gift({ prices: { npr: 0, inr: 0, usd: 0 } }))).toBe(true);
    expect(isGiftFree(gift({ prices: { npr: 0, inr: 5, usd: 0 } }))).toBe(false);
    expect(giftPriceLabel(gift({ displayPrice: 0 }))).toBe('Free');
  });
});

it('offers active gifts only, paid ones included', () => {
  const list = [gift(), gift({ _id: 'g2', isActive: false }), gift({ _id: 'g3', displayPrice: 0 })];
  expect(availableGifts(list).map(g => g._id)).toEqual(['g1', 'g3']);
  expect(availableGifts(undefined)).toEqual([]);
});
