import { describe, expect, it } from 'vitest';

import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filtersFromSearch,
  listQuery,
  nextPage,
  searchFromFilters,
} from './list';

describe('list filters in the URL', () => {
  it('round-trips every filter', () => {
    const filters = {
      tag: 'abc',
      search: 'ram',
      sort: 'experience_high_low' as const,
      languages: ['English', 'Nepali'],
      gender: 'FEMALE',
    };
    const search = searchFromFilters(filters);
    expect(search).toBe(
      '?tag=abc&q=ram&sort=experience_high_low&lang=English&lang=Nepali&gender=FEMALE',
    );
    expect(filtersFromSearch(new URLSearchParams(search))).toEqual(filters);
  });
  it('leaves defaults out and ignores unknown values', () => {
    expect(searchFromFilters(DEFAULT_FILTERS)).toBe('');
    expect(filtersFromSearch(new URLSearchParams('sort=price&tag='))).toEqual(DEFAULT_FILTERS);
  });
  it('counts sheet filters only', () => {
    expect(activeFilterCount({ ...DEFAULT_FILTERS, tag: 'x', search: 'y' })).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, languages: ['Hindi'], gender: 'MALE' })).toBe(2);
  });
});

describe('backend query', () => {
  it('sends what the app sends', () => {
    const q = listQuery(
      { ...DEFAULT_FILTERS, tag: 't1', languages: ['Hindi'], search: ' ram ' },
      2,
      'IN',
    );
    expect(q).toBe(
      '/astrologer-details?page=2&limit=10&countryCode=IN&tags=t1&language=Hindi&sortField=averageRating&sortOrder=desc&search=ram',
    );
  });
  it('drops the country and empty filters', () => {
    expect(listQuery(DEFAULT_FILTERS, 1, null)).toBe(
      '/astrologer-details?page=1&limit=10&sortField=averageRating&sortOrder=desc',
    );
  });
});

describe('paging', () => {
  it('stops on a short page or the last page', () => {
    expect(nextPage({ page: 1, limit: 10, total: 25 }, 10)).toBe(2);
    expect(nextPage({ page: 3, limit: 10, total: 30 }, 10)).toBeUndefined();
    expect(nextPage({ page: 1, limit: 10, total: 25 }, 7)).toBeUndefined();
    expect(nextPage(undefined, 10)).toBeUndefined();
  });
});
