import {
  EnglishAquariusColor,
  EnglishAquariusLight,
  EnglishAriesColor,
  EnglishAriesLight,
  EnglishCancerColor,
  EnglishCancerLight,
  EnglishCapricornColor,
  EnglishCapricornLight,
  EnglishGeminiColor,
  EnglishGeminiLight,
  EnglishLeoColor,
  EnglishLeoLight,
  EnglishLibraColor,
  EnglishLibraLight,
  EnglishPiscesColor,
  EnglishPiscesLight,
  EnglishSagittariusColor,
  EnglishSagittariusLight,
  EnglishScorpioColor,
  EnglishScorpioLight,
  EnglishTaurusColor,
  EnglishTaurusLight,
  EnglishVirgoColor,
  EnglishVirgoLight,
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

export const ENGLISH_ZODIAC_LIGHT: Record<HoroscopeSign, typeof EnglishAriesLight> = {
  aries: EnglishAriesLight,
  taurus: EnglishTaurusLight,
  gemini: EnglishGeminiLight,
  cancer: EnglishCancerLight,
  leo: EnglishLeoLight,
  virgo: EnglishVirgoLight,
  libra: EnglishLibraLight,
  scorpio: EnglishScorpioLight,
  sagittarius: EnglishSagittariusLight,
  capricorn: EnglishCapricornLight,
  aquarius: EnglishAquariusLight,
  pisces: EnglishPiscesLight,
};

export function englishZodiacColorOrdered() {
  return HOROSCOPE_SIGNS.map(slug => ({ slug, image: ENGLISH_ZODIAC_COLOR[slug] }));
}
