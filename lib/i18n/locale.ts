import { ELanguage } from '@/components/enums/language.enum';

import horoscopeEnBundle from './locales/horoscope/en';
import horoscopeNpBundle from './locales/horoscope/np';
import type { HoroscopeMessages } from './locales/horoscope/schema';

export const horoscopeEn: HoroscopeMessages = horoscopeEnBundle.HOROSCOPE;
export const horoscopeNe: HoroscopeMessages = horoscopeNpBundle.HOROSCOPE;

export const HOROSCOPE_DICTIONARIES: Record<ELanguage, HoroscopeMessages> = {
  [ELanguage.ENGLISH]: horoscopeEn,
  [ELanguage.NEPALI]: horoscopeNe,
};

const CARD_LANG_STORAGE_KEY = 'horoscope-card-lang';

/** Zodiac card grid language (English / Nepali) — independent of header UI language. */
export function readCardDisplayLanguage(): ELanguage {
  debugger;
  if (typeof window === 'undefined') {
    return ELanguage.ENGLISH;
  }
  try {
    const raw = window.sessionStorage.getItem(CARD_LANG_STORAGE_KEY);
    if (raw === ELanguage.NEPALI || raw === ELanguage.ENGLISH) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return ELanguage.ENGLISH;
}

export function persistCardDisplayLanguage(lang: ELanguage): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(CARD_LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** Header / page chrome — `?lang=` on horoscope routes (`english` | `nepali`). */
export function parseUiLangParam(value: string | null | undefined): ELanguage | null {
  if (value === ELanguage.NEPALI || value === ELanguage.ENGLISH) {
    return value;
  }
  return null;
}

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}
