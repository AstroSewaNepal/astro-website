import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  packageTab,
  planLabel,
  priceLabel,
  priceParts,
  sortPackages,
  type ConsultationPackage,
} from './packages';

const pkg = (packageType: string): ConsultationPackage => ({
  id: packageType,
  packageType,
  consultationMinutes: 15,
});

describe('sortPackages', () => {
  it('puts the known types in the app order, then the rest by name', () => {
    const sorted = sortPackages(
      ['Zed', 'Premium', 'Alpha', 'Basic', 'Unlimited', 'Standard'].map(pkg),
    );
    expect(sorted.map(p => p.packageType)).toEqual([
      'Basic',
      'Standard',
      'Premium',
      'Unlimited',
      'Alpha',
      'Zed',
    ]);
  });
});

describe('formatDuration', () => {
  it('formats like the app', () => {
    expect(formatDuration(15)).toBe('15 min');
    expect(formatDuration(60)).toBe('1 hour');
    expect(formatDuration(90)).toBe('1 hour 30 min');
    expect(formatDuration(120)).toBe('2 hours');
  });
});

describe('prices', () => {
  it('labels currencies like the app', () => {
    expect(priceLabel({ currency: 'NPR', value: 393.3 })).toBe('NPR 393.3');
    expect(priceLabel({ currency: 'INR', value: 40 })).toBe('₹ 40');
    expect(priceLabel({ currency: 'USD', value: 5 })).toBe('$ 5');
  });

  it('strikes the full price only when there is a discount', () => {
    const discounted = priceParts({
      cost: { currency: 'NPR', value: 437 },
      discountedPrice: { currency: 'NPR', value: 393.3 },
    });
    expect(discounted).toMatchObject({ struck: true, free: false });
    expect(discounted.pay?.value).toBe(393.3);

    const plain = priceParts({
      cost: { currency: 'NPR', value: 100 },
      discountedPrice: { currency: 'NPR', value: 100 },
    });
    expect(plain.struck).toBe(false);
  });

  it('knows a free package, and falls back to the full price', () => {
    expect(
      priceParts({
        cost: { currency: 'NPR', value: 0 },
        discountedPrice: { currency: 'NPR', value: 0 },
      }).free,
    ).toBe(true);
    expect(priceParts({ cost: { currency: 'NPR', value: 50 } }).pay?.value).toBe(50);
  });
});

it('reads the tab and plan labels', () => {
  expect(packageTab('subscription')).toBe('subscription');
  expect(packageTab(undefined)).toBe('perSession');
  expect(packageTab('x')).toBe('perSession');
  expect(planLabel(3)).toBe('3 Months');
});
