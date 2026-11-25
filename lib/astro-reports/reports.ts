// Astro Reports (doc 12): kundalis and matches a logged-in client saved, as the app's KundaliAstroReportsScreen.
// The backend keeps the form's query next to the generated result, so a report can be listed from the query alone
// (the list asks for `view=summary`, which leaves the heavy result out) and reopened or edited without new input.

import type { FreeKundaliBundle } from '@/lib/vedastro/fetch-free-kundali-bundle';
import {
  bundleToStoredResult,
  type KundaliMatchingBundle,
  type KundaliMatchingBundleQuery,
  type StoredKundaliMatchingResult,
} from '@/lib/vedastro/fetch-kundali-matching-bundle';
import type { StoredKundaliResult } from '@/lib/vedastro/stored-kundali-result';

export const REPORTS_PAGE_LIMIT = 10;

export type ReportTab = 'kundali' | 'match';

export const REPORT_API: Record<ReportTab, string> = {
  kundali: '/vedastro/free-kundali/bundle',
  match: '/vedastro/kundali-matching/bundle',
};

/** Body of POST bundle/save and PATCH bundle/:id for a kundali (the backend's SaveFreeKundaliDto). */
export type KundaliSaveBody = {
  lat: string;
  lon: string;
  date: string;
  time: string;
  offset: string;
  location?: string;
  fullName?: string;
  gender?: string;
};

type UserInfo = { fullName?: string | null; gender?: string | null } | null;

/** One saved kundali (GET bundle/history items; `result` only from GET bundle/:id). */
export type SavedKundali = {
  _id: string;
  query?: Partial<KundaliSaveBody> & { lat?: string | number; lon?: string | number };
  result?: FreeKundaliBundle | null;
  userInfo?: UserInfo;
  createdAt?: string;
};

/** One saved match. In the summary list `result` keeps only `matchReport` without its PredictionList. */
export type SavedMatch = {
  _id: string;
  query?: Partial<Record<keyof KundaliMatchingBundleQuery, string | number>>;
  result?: Partial<KundaliMatchingBundle> | null;
  userInfo?: UserInfo;
  createdAt?: string;
};

export type SaveResponse<T> = { bundle: T; savedId: string };

/** The history routes answer `{ items, page, limit }` (no total), so a short page is the last one. */
export type HistoryPage<T> = { items?: T[] | null; page?: number; limit?: number };

export function historyPath(tab: ReportTab, page: number, search: string): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(REPORTS_PAGE_LIMIT),
    view: 'summary',
  });
  const q = search.trim();
  if (q) params.set('search', q);
  return `${REPORT_API[tab]}/history?${params.toString()}`;
}

export function nextHistoryPage(lastItems: number, pagesLoaded: number): number | undefined {
  return lastItems < REPORTS_PAGE_LIMIT ? undefined : pagesLoaded + 1;
}

const text = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';

/** 'MALE' / 'male' -> 'male'; anything else (or nothing) -> ''. */
export function normalizeGender(v: unknown): 'male' | 'female' | 'other' | '' {
  const g = text(v).toLowerCase();
  return g === 'male' || g === 'female' || g === 'other' ? g : '';
}

/** '14:30' -> '02:30 PM', as the app lists them. Leaves anything else as it is. */
export function formatTime12h(time: string): string {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return time.trim();
  const h = Number(m[1]);
  if (h > 23) return time.trim();
  return `${String(h % 12 || 12).padStart(2, '0')}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** Dates are saved as dd-mm-yyyy (both the app and the website send that); old ones may use slashes. */
export function formatSavedDate(date: string): string {
  return date.trim().replace(/\//g, '-');
}

export type KundaliRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  gender: 'male' | 'female' | 'other' | '';
  place: string;
};

/**
 * Reports saved before the backend kept the person's name (and every app report until the app sends it in a way
 * the backend keeps) only have the account holder's name and gender in `userInfo`.
 */
export function toKundaliRow(item: SavedKundali): KundaliRow {
  const q = item.query ?? {};
  return {
    id: item._id,
    name: text(q.fullName) || text(item.userInfo?.fullName),
    date: formatSavedDate(text(q.date)),
    time: text(q.time),
    gender: normalizeGender(q.gender) || normalizeGender(item.userInfo?.gender),
    place: text(q.location),
  };
}

export type MatchRow = {
  id: string;
  manName: string;
  womanName: string;
  date: string;
  time: string;
  place: string;
  score: number | null;
  scoreSummary: string;
};

type MatchPerson = { Name?: string };

export function toMatchRow(item: SavedMatch): MatchRow {
  const q = item.query ?? {};
  const report = (item.result?.matchReport ?? {}) as Record<string, unknown> & {
    KutaScore?: number;
    Summary?: { ScoreSummary?: string };
  };
  const male = (report.Male ?? {}) as MatchPerson;
  const female = (report.Female ?? {}) as MatchPerson;
  return {
    id: item._id,
    manName: text(q.manName) || text(male.Name),
    womanName: text(q.womanName) || text(female.Name),
    date: formatSavedDate(text(q.manDate) || text(q.womanDate)),
    time: text(q.manTime) || text(q.womanTime),
    place: text(q.manLocation) || text(q.womanLocation),
    score: typeof report.KutaScore === 'number' ? report.KutaScore : null,
    scoreSummary: text(report.Summary?.ScoreSummary),
  };
}

/**
 * KutaScore is a percentage (the result page shows "40% — 14.4/36"), so the list says the same. The app prints the
 * raw number over 36 ("40/36"), which reads wrong.
 */
export function matchScoreLabel(row: Pick<MatchRow, 'score' | 'scoreSummary'>): string {
  if (row.score == null) return '';
  const pct = Math.max(0, Math.min(100, row.score));
  const gunas = Math.round(((pct * 36) / 100) * 10) / 10;
  const label = `${Math.round(pct)}% · ${gunas}/36`;
  return row.scoreSummary ? `${label} · ${row.scoreSummary}` : label;
}

/** A saved kundali in the shape the result page draws (the same one the form leaves in sessionStorage). */
export function kundaliToStored(item: SavedKundali): StoredKundaliResult | null {
  const result = item.result;
  if (!result || typeof result !== 'object') return null;
  const row = toKundaliRow(item);
  const q = item.query ?? {};
  return {
    fullName: row.name,
    birthPlace: row.place,
    dateOfBirth: row.date,
    birthTime: row.time,
    gender: row.gender || undefined,
    latitude: text(q.lat) || undefined,
    longitude: text(q.lon) || undefined,
    payload: { calculator: 'AllTimeData', payload: result.panchanga },
    planetRows: result.planetRows,
    doshas: result.doshas,
    savedId: item._id,
  };
}

export function matchToStored(item: SavedMatch): StoredKundaliMatchingResult | null {
  const r = item.result;
  if (!r?.matchReport || !r.man || !r.woman) return null;
  const q = item.query ?? {};
  const row = toMatchRow(item);
  const person = (side: 'man' | 'woman') => ({
    fullName: side === 'man' ? row.manName : row.womanName,
    dateOfBirth: formatSavedDate(text(q[`${side}Date`])),
    birthTime: text(q[`${side}Time`]),
    birthPlace: text(q[`${side}Location`]),
    gender: normalizeGender(q[`${side}Gender`]) || (side === 'man' ? 'male' : 'female'),
    latitude: text(q[`${side}Lat`]),
    longitude: text(q[`${side}Lon`]),
  });
  return {
    ...bundleToStoredResult(person('man'), person('woman'), {
      matchReport: r.matchReport,
      man: r.man,
      woman: r.woman,
      manChartSvg: r.manChartSvg ?? '',
      womanChartSvg: r.womanChartSvg ?? '',
    }),
    savedId: item._id,
  };
}

/** One person of a form, as the edit form starts from. */
export type PersonPrefill = {
  fullName: string;
  /** dd-mm-yyyy, what the date picker holds. */
  dateOfBirth: string;
  /** 12-hour parts for the clock picker. */
  time: { hh: string; mm: string; ampm: 'am' | 'pm' } | null;
  birthPlace: string;
  gender: 'male' | 'female' | 'other' | '';
  /** The saved place's coordinates, kept while the place text is not changed. */
  geo: { lat: string; lon: string; offset: string; location: string } | null;
};

function timeParts(time: string): PersonPrefill['time'] {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  if (h > 23) return null;
  return { hh: String(h % 12 || 12).padStart(2, '0'), mm: m[2], ampm: h >= 12 ? 'pm' : 'am' };
}

function geoOf(
  lat: unknown,
  lon: unknown,
  offset: unknown,
  location: string,
): PersonPrefill['geo'] {
  const la = text(lat);
  const lo = text(lon);
  const off = text(offset);
  return la && lo && /^[+-]\d{2}:\d{2}$/.test(off)
    ? { lat: la, lon: lo, offset: off, location }
    : null;
}

export function kundaliPrefill(item: SavedKundali): PersonPrefill {
  const row = toKundaliRow(item);
  const q = item.query ?? {};
  return {
    fullName: row.name,
    dateOfBirth: row.date,
    time: timeParts(row.time),
    birthPlace: row.place,
    gender: row.gender,
    geo: geoOf(q.lat, q.lon, q.offset, row.place),
  };
}

export function matchPrefill(item: SavedMatch): { man: PersonPrefill; woman: PersonPrefill } {
  const q = item.query ?? {};
  const row = toMatchRow(item);
  const person = (side: 'man' | 'woman'): PersonPrefill => {
    const place = text(q[`${side}Location`]);
    return {
      fullName: side === 'man' ? row.manName : row.womanName,
      dateOfBirth: formatSavedDate(text(q[`${side}Date`])),
      time: timeParts(text(q[`${side}Time`])),
      birthPlace: place,
      gender: normalizeGender(q[`${side}Gender`]),
      geo: geoOf(q[`${side}Lat`], q[`${side}Lon`], q[`${side}Offset`], place),
    };
  };
  return { man: person('man'), woman: person('woman') };
}

/** Where a saved report opens, and its edit form. */
export const reportPath = (tab: ReportTab, id: string) =>
  `/client/reports/${tab}/${encodeURIComponent(id)}`;
export const reportEditPath = (tab: ReportTab, id: string) => `${reportPath(tab, id)}/edit`;
