import * as EnglishZodiacImage from '@/components/images/zodiac/english';
import type { HoroscopeSign } from '@/lib/types/horoscope';

export const SIGN_COLOR_IMAGE: Record<HoroscopeSign, typeof EnglishZodiacImage.EnglishAriesColor> =
  {
    aries: EnglishZodiacImage.EnglishAriesColor,
    taurus: EnglishZodiacImage.EnglishTaurusColor,
    gemini: EnglishZodiacImage.EnglishGeminiColor,
    cancer: EnglishZodiacImage.EnglishCancerColor,
    leo: EnglishZodiacImage.EnglishLeoColor,
    virgo: EnglishZodiacImage.EnglishVirgoColor,
    libra: EnglishZodiacImage.EnglishLibraColor,
    scorpio: EnglishZodiacImage.EnglishScorpioColor,
    sagittarius: EnglishZodiacImage.EnglishSagittariusColor,
    capricorn: EnglishZodiacImage.EnglishCapricornColor,
    aquarius: EnglishZodiacImage.EnglishAquariusColor,
    pisces: EnglishZodiacImage.EnglishPiscesColor,
  };

export const SIGN_LIGHT_IMAGE: Record<HoroscopeSign, typeof EnglishZodiacImage.EnglishAriesLight> =
  {
    aries: EnglishZodiacImage.EnglishAriesLight,
    taurus: EnglishZodiacImage.EnglishTaurusLight,
    gemini: EnglishZodiacImage.EnglishGeminiLight,
    cancer: EnglishZodiacImage.EnglishCancerLight,
    leo: EnglishZodiacImage.EnglishLeoLight,
    virgo: EnglishZodiacImage.EnglishVirgoLight,
    libra: EnglishZodiacImage.EnglishLibraLight,
    scorpio: EnglishZodiacImage.EnglishScorpioLight,
    sagittarius: EnglishZodiacImage.EnglishSagittariusLight,
    capricorn: EnglishZodiacImage.EnglishCapricornLight,
    aquarius: EnglishZodiacImage.EnglishAquariusLight,
    pisces: EnglishZodiacImage.EnglishPiscesLight,
  };

export function capitalizeSign(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
