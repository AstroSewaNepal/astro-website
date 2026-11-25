import { describe, expect, it } from 'vitest';

import {
  categoryPath,
  coverImage,
  deliveryLabel,
  matchesCategory,
  matchesRemedy,
  moneyLabel,
  nextRemediesPage,
  remediesListPath,
  remedyDetailPath,
  remedyPath,
  remedyPrice,
  sortedMedia,
  type Remedy,
} from './catalogue';

const remedy: Remedy = {
  id: 'r1',
  name: 'Rudraksha Mala',
  category: { categoryId: 'c1', title: 'Malas' },
  subcategory: ['Vedic', 'Career'],
  prices: { npr: 1000, inr: 600, usd: 10 },
  discount: 20,
  discountedPrice: 800,
  stock: 3,
  isActive: true,
  deliveryType: 'physical',
  media: [
    { mediaId: 'm2', url: 'https://x/2.jpg', order: 2, isDefault: false },
    { mediaId: 'm1', url: 'https://x/1.jpg', order: 1, isDefault: true },
  ],
  convertedPrice: null,
  displayCurrency: null,
};

describe('paths', () => {
  it('builds list, detail and page paths', () => {
    expect(remediesListPath(2, 'c1', 'US')).toBe(
      '/astrologers/remedies?page=2&limit=10&category=c1&countryCode=US',
    );
    expect(remediesListPath(1, null, null)).toBe('/astrologers/remedies?page=1&limit=10');
    expect(remedyDetailPath('a b', 'NP')).toBe('/astrologers/remedies/a%20b?countryCode=NP');
    expect(remedyDetailPath('r1', null)).toBe('/astrologers/remedies/r1');
    expect(remedyPath('r/1')).toBe('/remedy/r%2F1');
    expect(categoryPath('c1')).toBe('/remedies/c1');
  });

  it('pages while full pages keep coming and the total is not reached', () => {
    expect(nextRemediesPage({ page: 1, limit: 10, total: 25 }, 10)).toBe(2);
    expect(nextRemediesPage({ page: 3, limit: 10, total: 25 }, 5)).toBeUndefined();
    expect(nextRemediesPage({ page: 2, limit: 10, total: 20 }, 10)).toBeUndefined();
    expect(nextRemediesPage(undefined, 10)).toBeUndefined();
  });
});

describe('remedyPrice', () => {
  it('shows NPR with the listed price struck when not converted', () => {
    expect(remedyPrice(remedy)).toEqual({ currency: 'NPR', value: 800, full: 1000 });
  });

  it('shows the converted price and works the full price back from the discount', () => {
    expect(remedyPrice({ ...remedy, convertedPrice: 8, displayCurrency: 'USD' })).toEqual({
      currency: 'USD',
      value: 8,
      full: 10,
    });
  });

  it('has no struck price without a discount', () => {
    expect(remedyPrice({ ...remedy, discount: 0, discountedPrice: 1000 }).full).toBeNull();
  });
});

describe('labels and media', () => {
  it('formats money like the app', () => {
    expect(moneyLabel('NPR', 1500)).toBe('NPR 1,500');
    expect(moneyLabel('USD', 12.5)).toBe('$ 12.5');
    expect(moneyLabel('INR', 40)).toBe('₹ 40');
  });

  it('picks the default image and sorts the gallery', () => {
    expect(coverImage(remedy.media)).toBe('https://x/1.jpg');
    expect(coverImage([])).toBeNull();
    expect(sortedMedia(remedy.media).map(m => m.mediaId)).toEqual(['m1', 'm2']);
  });

  it('names delivery types', () => {
    expect(deliveryLabel('online_digital')).toBe('Online Delivery');
    expect(deliveryLabel('onsite')).toBe('Onsite Delivery');
    expect(deliveryLabel('weird')).toBe('Delivery');
  });
});

describe('filters', () => {
  it('matches name, category and expertise tag', () => {
    expect(matchesRemedy(remedy, 'rudra', null)).toBe(true);
    expect(matchesRemedy(remedy, 'malas', null)).toBe(true);
    expect(matchesRemedy(remedy, 'gem', null)).toBe(false);
    expect(matchesRemedy(remedy, '', 'career')).toBe(true);
    expect(matchesRemedy(remedy, '', 'Love')).toBe(false);
  });

  it('matches categories by title or description', () => {
    const cat = { _id: 'c1', title: 'Pooja', description: 'Online rituals' };
    expect(matchesCategory(cat, 'ritual')).toBe(true);
    expect(matchesCategory(cat, 'gem')).toBe(false);
    expect(matchesCategory(cat, ' ')).toBe(true);
  });
});
