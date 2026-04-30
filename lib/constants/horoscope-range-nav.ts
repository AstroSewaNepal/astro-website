import { ELanguage } from '@/components/enums/language.enum';

import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

const RANGE_ORDER = [
  'today',
  'yesterday',
  'tomorrow',
  'week',
  'month',
  'year',
] as const satisfies readonly VedastroHoroscopeRangeType[];

export function isVedastroHoroscopeRangeType(value: string): value is VedastroHoroscopeRangeType {
  return (RANGE_ORDER as readonly string[]).includes(value);
}

/** `?type=` on `/horoscope`; missing or invalid → `today`. */
export function parseHoroscopeRangeFromUrl(
  typeParam: string | null | undefined,
): VedastroHoroscopeRangeType {
  if (typeParam && isVedastroHoroscopeRangeType(typeParam)) {
    return typeParam;
  }
  return 'today';
}

/** Preserves optional UI `lang` (header) on horoscope URLs. */
export function horoscopeListPageHref(
  range: VedastroHoroscopeRangeType,
  uiLang?: ELanguage,
): string {
  const params = new URLSearchParams();
  if (range !== 'today') {
    params.set('type', range);
  }
  if (uiLang && uiLang !== ELanguage.ENGLISH) {
    params.set('lang', uiLang);
  }
  const q = params.toString();
  return q ? `/horoscope?${q}` : '/horoscope';
}

/** `/horoscope/details?sign=&type=` — `sign` is lowercase slug (`aries`, …). */
export function horoscopeDetailPageHref(
  signSlug: string,
  range: VedastroHoroscopeRangeType,
  uiLang?: ELanguage,
): string {
  const s = signSlug.trim().toLowerCase();
  const params = new URLSearchParams();
  params.set('sign', s);
  if (range !== 'today') {
    params.set('type', range);
  }
  if (uiLang && uiLang !== ELanguage.ENGLISH) {
    params.set('lang', uiLang);
  }
  return `/horoscope/details?${params.toString()}`;
}

export const HOROSCOPE_RANGE_NAV_OPTIONS: {
  type: VedastroHoroscopeRangeType;
  labelEn: string;
  labelNp: string;
}[] = [
  { type: 'today', labelEn: "Today's Horoscope", labelNp: 'आजको राशिफल' },
  { type: 'yesterday', labelEn: "Yesterday's Horoscope", labelNp: 'हिजोको राशिफल' },
  { type: 'tomorrow', labelEn: "Tomorrow's Horoscope", labelNp: 'भोलिको राशिफल' },
  { type: 'week', labelEn: 'Weekly Horoscope', labelNp: 'साप्ताहिक राशिफल' },
  { type: 'month', labelEn: 'Monthly Horoscope', labelNp: 'मासिक राशिफल' },
  { type: 'year', labelEn: 'Yearly Horoscope', labelNp: 'वार्षिक राशिफल' },
];
