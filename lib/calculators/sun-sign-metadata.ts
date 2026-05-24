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

import { RASHI_METADATA } from '@/lib/calculators/rashi-metadata';

export type SunSignMeta = {
  englishName: string;
  slug: HoroscopeSign;
  dateRangeLong: string;
  element: string;
  rulingPlanet: string;
  image: StaticImageData;
  description: string;
};

export const SUN_SIGN_METADATA: SunSignMeta[] = [
  {
    englishName: 'Aries',
    slug: 'aries',
    dateRangeLong: 'April 14 - May 14',
    element: 'Fire',
    rulingPlanet: 'Mars',
    image: EnglishAriesColor,
    description:
      'Bold, pioneering, and action-oriented. Aries individuals lead with courage and a strong drive to begin new ventures.',
  },
  {
    englishName: 'Taurus',
    slug: 'taurus',
    dateRangeLong: 'May 15 - June 14',
    element: 'Earth',
    rulingPlanet: 'Venus',
    image: EnglishTaurusColor,
    description:
      'Stable, practical, and sensual. Taurus values comfort, consistency, and a strong connection to the material world.',
  },
  {
    englishName: 'Gemini',
    slug: 'gemini',
    dateRangeLong: 'June 15 - July 14',
    element: 'Air',
    rulingPlanet: 'Mercury',
    image: EnglishGeminiColor,
    description:
      'Curious, adaptable, and communicative. Gemini thrives on learning, variety, and sharing ideas with others.',
  },
  {
    englishName: 'Cancer',
    slug: 'cancer',
    dateRangeLong: 'July 15 - August 15',
    element: 'Water',
    rulingPlanet: 'Moon',
    image: EnglishCancerColor,
    description:
      'Nurturing, intuitive, and protective. Cancer is deeply emotional and places great importance on home, family, and security.',
  },
  {
    englishName: 'Leo',
    slug: 'leo',
    dateRangeLong: 'August 16 - September 15',
    element: 'Fire',
    rulingPlanet: 'Sun',
    image: EnglishLeoColor,
    description:
      'Confident, generous, and charismatic. Leo shines with creativity, leadership, and a warm desire to be recognized.',
  },
  {
    englishName: 'Virgo',
    slug: 'virgo',
    dateRangeLong: 'September 16 - October 15',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    image: EnglishVirgoColor,
    description:
      'Analytical, precise, and service-oriented. Virgo excels at refining details and improving systems with practical care.',
  },
  {
    englishName: 'Libra',
    slug: 'libra',
    dateRangeLong: 'October 16 - November 14',
    element: 'Air',
    rulingPlanet: 'Venus',
    image: EnglishLibraColor,
    description:
      'Diplomatic, balanced, and relationship-focused. Libra values harmony, beauty, and fairness in social connections.',
  },
  {
    englishName: 'Scorpio',
    slug: 'scorpio',
    dateRangeLong: 'November 15 - December 14',
    element: 'Water',
    rulingPlanet: 'Mars',
    image: EnglishScorpioColor,
    description:
      'Intense, transformative, and deeply perceptive. Scorpio is driven by emotional depth, determination, and powerful change.',
  },
  {
    englishName: 'Sagittarius',
    slug: 'sagittarius',
    dateRangeLong: 'December 15 - January 13',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    image: EnglishSagittariusColor,
    description:
      'Adventurous, optimistic, and philosophical. Sagittarius seeks freedom, truth, and learning through broader experiences.',
  },
  {
    englishName: 'Capricorn',
    slug: 'capricorn',
    dateRangeLong: 'January 14 - February 12',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    image: EnglishCapricornColor,
    description:
      'Disciplined, ambitious, and responsible. Capricorn builds long-term success through structure, hard work, and persistence.',
  },
  {
    englishName: 'Aquarius',
    slug: 'aquarius',
    dateRangeLong: 'February 13 - March 14',
    element: 'Air',
    rulingPlanet: 'Saturn',
    image: EnglishAquariusColor,
    description:
      'Innovative, independent, and humanitarian. Aquarius thinks ahead and champions new ideas for the collective good.',
  },
  {
    englishName: 'Pisces',
    slug: 'pisces',
    dateRangeLong: 'March 15 - April 13',
    element: 'Water',
    rulingPlanet: 'Jupiter',
    image: EnglishPiscesColor,
    description:
      'Compassionate, imaginative, and sensitive. Pisces connects strongly with intuition, dreams, and emotional depth.',
  },
];

const SUN_SIGN_BY_ENGLISH = new Map(
  SUN_SIGN_METADATA.map(meta => [meta.englishName.toLowerCase(), meta]),
);

const SUN_SIGN_BY_VEDIC = new Map(
  RASHI_METADATA.map(rashi => {
    const meta = SUN_SIGN_BY_ENGLISH.get(rashi.englishName.toLowerCase());
    return meta ? ([rashi.vedicName.toLowerCase(), meta] as const) : null;
  }).filter((entry): entry is readonly [string, SunSignMeta] => entry !== null),
);

export function getSunSignMeta(signName: string): SunSignMeta | undefined {
  const key = signName.trim().toLowerCase();
  if (!key) return undefined;
  return SUN_SIGN_BY_ENGLISH.get(key) ?? SUN_SIGN_BY_VEDIC.get(key);
}

export function getReportDisplayName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Your';
  const first = trimmed.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}
