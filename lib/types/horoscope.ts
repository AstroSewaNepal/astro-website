import type { AstroBackendResult } from './api';

/** Zodiac sign slug values accepted by the backend (EHoroscopeENSign). */
export const HOROSCOPE_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type HoroscopeSign = (typeof HOROSCOPE_SIGNS)[number];

export function isHoroscopeSign(value: string): value is HoroscopeSign {
  return (HOROSCOPE_SIGNS as readonly string[]).includes(value);
}

/** Single horoscope document from Mongo (backend lean + JSON). */
export interface HoroscopeRecord {
  _id: string;
  sign: HoroscopeSign | string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use {@link AstroBackendResult} from `@/lib/types/api`. */
export type HoroscopeApiResult<T> = AstroBackendResult<T>;
