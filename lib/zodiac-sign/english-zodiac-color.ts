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
import { HOROSCOPE_SIGNS, type HoroscopeSign } from '@/lib/types/horoscope';

/** Color artwork for zodiac strip / listing (canonical slug order). */
export const ENGLISH_ZODIAC_COLOR: Record<HoroscopeSign, typeof EnglishAriesColor> = {
  aries: EnglishAriesColor,
  taurus: EnglishTaurusColor,
  gemini: EnglishGeminiColor,
  cancer: EnglishCancerColor,
  leo: EnglishLeoColor,
  virgo: EnglishVirgoColor,
  libra: EnglishLibraColor,
  scorpio: EnglishScorpioColor,
  sagittarius: EnglishSagittariusColor,
  capricorn: EnglishCapricornColor,
  aquarius: EnglishAquariusColor,
  pisces: EnglishPiscesColor,
};

export function englishZodiacColorOrdered() {
  return HOROSCOPE_SIGNS.map(slug => ({ slug, image: ENGLISH_ZODIAC_COLOR[slug] }));
}
