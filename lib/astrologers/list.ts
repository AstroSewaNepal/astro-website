// Astro Connect list, as the app's AstroConnectScreen + FilterBottomSheet: expertise chips, search, sort, language and
// gender filters, 10 per page. Filters live in the URL so Back from a profile keeps them.

export const PAGE_LIMIT = 10;
export const ALL_TAGS = 'all';

/** The app's sort options (Figma has more; scope rule: only what the app does). */
export const SORT_OPTIONS = [
  { id: 'rating_high_low', label: 'Rating: High to Low', field: 'averageRating', order: 'desc' },
  { id: 'rating_low_high', label: 'Rating: Low to High', field: 'averageRating', order: 'asc' },
  {
    id: 'experience_high_low',
    label: 'Experience: High to Low',
    field: 'yearsOfExperience',
    order: 'desc',
  },
  {
    id: 'experience_low_high',
    label: 'Experience: Low to High',
    field: 'yearsOfExperience',
    order: 'asc',
  },
  { id: 'alphabetical', label: 'Alphabetical: A - Z', field: 'fullName', order: 'asc' },
  { id: 'alphabetical_desc', label: 'Alphabetical: Z - A', field: 'fullName', order: 'desc' },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]['id'];
export const DEFAULT_SORT: SortId = 'rating_high_low';

export type ListFilters = {
  /** Expertise tag id, or ALL_TAGS. */
  tag: string;
  search: string;
  sort: SortId;
  /** Language names, as the app sends them. */
  languages: string[];
  /** MALE / FEMALE / OTHER, or '' for any. */
  gender: string;
};

export const DEFAULT_FILTERS: ListFilters = {
  tag: ALL_TAGS,
  search: '',
  sort: DEFAULT_SORT,
  languages: [],
  gender: '',
};

const isSortId = (value: string | null): value is SortId =>
  SORT_OPTIONS.some(option => option.id === value);

/** Filters from the page URL (?tag=&q=&sort=&lang=&lang=&gender=); anything unknown falls back to the default. */
export function filtersFromSearch(params: URLSearchParams): ListFilters {
  const sort = params.get('sort');
  return {
    tag: params.get('tag')?.trim() || ALL_TAGS,
    search: params.get('q') ?? '',
    sort: isSortId(sort) ? sort : DEFAULT_SORT,
    languages: params.getAll('lang').filter(Boolean),
    gender: params.get('gender')?.toUpperCase() ?? '',
  };
}

/** The page URL's query for these filters (defaults left out, so a plain list is just /astrologers). */
export function searchFromFilters(filters: ListFilters): string {
  const params = new URLSearchParams();
  if (filters.tag !== ALL_TAGS) params.set('tag', filters.tag);
  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  for (const language of filters.languages) params.append('lang', language);
  if (filters.gender) params.set('gender', filters.gender);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** How many filters the Filter button counts (the sheet's sort, language and gender; not chips or search). */
export function activeFilterCount(filters: ListFilters): number {
  return (
    (filters.sort !== DEFAULT_SORT ? 1 : 0) + filters.languages.length + (filters.gender ? 1 : 0)
  );
}

/** GET /astrologer-details query for one page, as the app's getAstrologersPaginated. */
export function listQuery(filters: ListFilters, page: number, countryCode: string | null): string {
  const sort = SORT_OPTIONS.find(option => option.id === filters.sort) ?? SORT_OPTIONS[0];
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
  if (countryCode) params.set('countryCode', countryCode);
  if (filters.tag !== ALL_TAGS) params.append('tags', filters.tag);
  for (const language of filters.languages) params.append('language', language);
  if (filters.gender) params.set('gender', filters.gender);
  params.set('sortField', sort.field);
  params.set('sortOrder', sort.order);
  if (filters.search.trim()) params.set('search', filters.search.trim());
  return `/astrologer-details?${params.toString()}`;
}

export type ListPagination = { page?: number; limit?: number; total?: number };

/** Next page number, or undefined at the end (same rule as the app). */
export function nextPage(
  pagination: ListPagination | undefined,
  received: number,
): number | undefined {
  if (!pagination?.page || !pagination.limit || received < PAGE_LIMIT) return undefined;
  return pagination.page * pagination.limit < (pagination.total ?? 0)
    ? pagination.page + 1
    : undefined;
}

/** Where a card leads. The profile needs a login (the app guards it), so guests go through /login first. */
export const profilePath = (astrologerUserId: string) =>
  `/astrologer-profile/${encodeURIComponent(astrologerUserId)}`;
