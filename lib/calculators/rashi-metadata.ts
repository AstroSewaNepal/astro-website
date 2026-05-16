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

export type RashiMeta = {
  vedicName: string;
  englishName: string;
  slug: HoroscopeSign;
  dateRange: string;
  image: StaticImageData;
  description: string;
};

export const RASHI_METADATA: RashiMeta[] = [
  {
    vedicName: 'Mesha',
    englishName: 'Aries',
    slug: 'aries',
    dateRange: 'Mar 21 - Apr 19',
    image: EnglishAriesColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Vrishabha',
    englishName: 'Taurus',
    slug: 'taurus',
    dateRange: 'Apr 20 - May 20',
    image: EnglishTaurusColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Mithuna',
    englishName: 'Gemini',
    slug: 'gemini',
    dateRange: 'May 21 - Jun 20',
    image: EnglishGeminiColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Karka',
    englishName: 'Cancer',
    slug: 'cancer',
    dateRange: 'Jun 21 - Jul 22',
    image: EnglishCancerColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Simha',
    englishName: 'Leo',
    slug: 'leo',
    dateRange: 'Jul 23 - Aug 22',
    image: EnglishLeoColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Kanya',
    englishName: 'Virgo',
    slug: 'virgo',
    dateRange: 'Aug 23 - Sep 22',
    image: EnglishVirgoColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Tula',
    englishName: 'Libra',
    slug: 'libra',
    dateRange: 'Sep 23 - Oct 22',
    image: EnglishLibraColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Vrishchika',
    englishName: 'Scorpio',
    slug: 'scorpio',
    dateRange: 'Oct 23 - Nov 21',
    image: EnglishScorpioColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Dhanu',
    englishName: 'Sagittarius',
    slug: 'sagittarius',
    dateRange: 'Nov 22 - Dec 21',
    image: EnglishSagittariusColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Makara',
    englishName: 'Capricorn',
    slug: 'capricorn',
    dateRange: 'Dec 22 - Jan 19',
    image: EnglishCapricornColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Kumbha',
    englishName: 'Aquarius',
    slug: 'aquarius',
    dateRange: 'Jan 20 - Feb 18',
    image: EnglishAquariusColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    vedicName: 'Meena',
    englishName: 'Pisces',
    slug: 'pisces',
    dateRange: 'Feb 19 - Mar 20',
    image: EnglishPiscesColor,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

const RASHI_BY_VEDIC = new Map(RASHI_METADATA.map(meta => [meta.vedicName, meta]));

export function getRashiMeta(vedicName: string): RashiMeta | undefined {
  return RASHI_BY_VEDIC.get(vedicName);
}

export function getReportDisplayName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Your';
  const first = trimmed.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}
