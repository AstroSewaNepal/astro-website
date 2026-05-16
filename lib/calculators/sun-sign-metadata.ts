import type { StaticImageData } from 'next/image';

import {
  EnglishAquariusColor,
  EnglishAriesColor,
  EnglishCancerColor,
  EnglishCapricornColor,
  EnglishGeminiColor,
  EnglishLeoColor,
  EnglishLibraColor,
  EnglishPiscesColor,
  EnglishSagittariusColor,
  EnglishScorpioColor,
  EnglishTaurusColor,
  EnglishVirgoColor,
} from '@/components/images/zodiac/english';
import type { HoroscopeSign } from '@/lib/types/horoscope';

export type SunSignMeta = {
  englishName: string;
  slug: HoroscopeSign;
  dateRangeLong: string;
  element: string;
  rulingPlanet: string;
  image: StaticImageData;
};

export const SUN_SIGN_METADATA: SunSignMeta[] = [
  {
    englishName: 'Aries',
    slug: 'aries',
    dateRangeLong: 'March 21 - April 19',
    element: 'Fire',
    rulingPlanet: 'Mars',
    image: EnglishAriesColor,
  },
  {
    englishName: 'Taurus',
    slug: 'taurus',
    dateRangeLong: 'April 20 - May 20',
    element: 'Earth',
    rulingPlanet: 'Venus',
    image: EnglishTaurusColor,
  },
  {
    englishName: 'Gemini',
    slug: 'gemini',
    dateRangeLong: 'May 21 - June 20',
    element: 'Air',
    rulingPlanet: 'Mercury',
    image: EnglishGeminiColor,
  },
  {
    englishName: 'Cancer',
    slug: 'cancer',
    dateRangeLong: 'June 21 - July 22',
    element: 'Water',
    rulingPlanet: 'Moon',
    image: EnglishCancerColor,
  },
  {
    englishName: 'Leo',
    slug: 'leo',
    dateRangeLong: 'July 23 - August 22',
    element: 'Fire',
    rulingPlanet: 'Sun',
    image: EnglishLeoColor,
  },
  {
    englishName: 'Virgo',
    slug: 'virgo',
    dateRangeLong: 'August 23 - September 22',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    image: EnglishVirgoColor,
  },
  {
    englishName: 'Libra',
    slug: 'libra',
    dateRangeLong: 'September 23 - October 22',
    element: 'Air',
    rulingPlanet: 'Venus',
    image: EnglishLibraColor,
  },
  {
    englishName: 'Scorpio',
    slug: 'scorpio',
    dateRangeLong: 'October 23 - November 21',
    element: 'Water',
    rulingPlanet: 'Mars',
    image: EnglishScorpioColor,
  },
  {
    englishName: 'Sagittarius',
    slug: 'sagittarius',
    dateRangeLong: 'November 22 - December 21',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    image: EnglishSagittariusColor,
  },
  {
    englishName: 'Capricorn',
    slug: 'capricorn',
    dateRangeLong: 'December 22 - January 19',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    image: EnglishCapricornColor,
  },
  {
    englishName: 'Aquarius',
    slug: 'aquarius',
    dateRangeLong: 'January 20 - February 18',
    element: 'Air',
    rulingPlanet: 'Saturn',
    image: EnglishAquariusColor,
  },
  {
    englishName: 'Pisces',
    slug: 'pisces',
    dateRangeLong: 'February 19 - March 20',
    element: 'Water',
    rulingPlanet: 'Jupiter',
    image: EnglishPiscesColor,
  },
];

const SUN_SIGN_BY_NAME = new Map(SUN_SIGN_METADATA.map(meta => [meta.englishName, meta]));

export function getSunSignMeta(englishName: string): SunSignMeta | undefined {
  return SUN_SIGN_BY_NAME.get(englishName);
}

export function getReportDisplayName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Your';
  const first = trimmed.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}
