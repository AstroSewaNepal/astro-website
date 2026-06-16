import { StaticImageData } from 'next/image';

import * as ZodiacSignImageEnglish from '@/components/images/zodiac/english';

import * as ZodiacSignImageNepali from '@/components/images/zodiac/nepali';
import { ELanguage } from '@/components/enums/language.enum';

export const HOROSCOPE_DATA: Record<
  ELanguage,
  Array<{
    name: string;
    detail: string;
    link: string;
    image: string | StaticImageData;
    imageColor?: string | StaticImageData;
    numberOfStars: number;
  }>
> = {
  [ELanguage.ENGLISH]: [
    {
      name: 'Aries',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishAriesLight,
      imageColor: ZodiacSignImageEnglish.EnglishAriesColor,
      numberOfStars: 3,
    },
    {
      name: 'Taurus',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishTaurusLight,
      imageColor: ZodiacSignImageEnglish.EnglishTaurusColor,
      numberOfStars: 3,
    },
    {
      name: 'Gemini',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishGeminiLight,
      imageColor: ZodiacSignImageEnglish.EnglishGeminiColor,
      numberOfStars: 3,
    },
    {
      name: 'Cancer',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishCancerLight,
      imageColor: ZodiacSignImageEnglish.EnglishCancerColor,
      numberOfStars: 3,
    },
    {
      name: 'Leo',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishLeoLight,
      imageColor: ZodiacSignImageEnglish.EnglishLeoColor,
      numberOfStars: 3,
    },
    {
      name: 'Virgo',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishVirgoLight,
      imageColor: ZodiacSignImageEnglish.EnglishVirgoColor,
      numberOfStars: 3,
    },
    {
      name: 'Libra',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishLibraLight,
      imageColor: ZodiacSignImageEnglish.EnglishLibraColor,
      numberOfStars: 3,
    },
    {
      name: 'Scorpio',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishScorpioLight,
      imageColor: ZodiacSignImageEnglish.EnglishScorpioColor,
      numberOfStars: 3,
    },
    {
      name: 'Sagittarius',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishSagittariusLight,
      imageColor: ZodiacSignImageEnglish.EnglishSagittariusColor,
      numberOfStars: 3,
    },
    {
      name: 'Capricorn',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishCapricornLight,
      imageColor: ZodiacSignImageEnglish.EnglishCapricornColor,
      numberOfStars: 3,
    },
    {
      name: 'Aquarius',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishAquariusLight,
      imageColor: ZodiacSignImageEnglish.EnglishAquariusColor,
      numberOfStars: 3,
    },
    {
      name: 'Pisces',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: ZodiacSignImageEnglish.EnglishPiscesLight,
      imageColor: ZodiacSignImageEnglish.EnglishPiscesColor,
      numberOfStars: 3,
    },
  ],
  [ELanguage.NEPALI]: [
    {
      name: 'मेष',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliAriesLight,
      imageColor: ZodiacSignImageNepali.NepaliAriesColor,
      numberOfStars: 3,
    },
    {
      name: 'वृष',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliTaurusLight,
      imageColor: ZodiacSignImageNepali.NepaliTaurusColor,
      numberOfStars: 3,
    },
    {
      name: 'मिथुन',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliGeminiLight,
      imageColor: ZodiacSignImageNepali.NepaliGeminiColor,
      numberOfStars: 3,
    },
    {
      name: 'कर्कट',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliCancerLight,
      imageColor: ZodiacSignImageNepali.NepaliCancerColor,
      numberOfStars: 3,
    },
    {
      name: 'सिंह',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliLeoLight,
      imageColor: ZodiacSignImageNepali.NepaliLeoColor,
      numberOfStars: 3,
    },
    {
      name: 'कन्या',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliVirgoLight,
      imageColor: ZodiacSignImageNepali.NepaliVirgoColor,
      numberOfStars: 3,
    },
    {
      name: 'तुला',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliLibraLight,
      imageColor: ZodiacSignImageNepali.NepaliLibraColor,
      numberOfStars: 3,
    },
    {
      name: 'वृश्चिक',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliScorpioLight,
      imageColor: ZodiacSignImageNepali.NepaliScorpioColor,
      numberOfStars: 3,
    },
    {
      name: 'धनु',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: ZodiacSignImageNepali.NepaliSagittariusLight,
      imageColor: ZodiacSignImageNepali.NepaliSagittariusColor,
    },
    {
      name: 'मकर',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: ZodiacSignImageNepali.NepaliCapricornLight,
      imageColor: ZodiacSignImageNepali.NepaliCapricornColor,
      numberOfStars: 3,
    },
    {
      name: 'कुम्भ',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: ZodiacSignImageNepali.NepaliAquariusLight,
      imageColor: ZodiacSignImageNepali.NepaliAquariusColor,
    },
    {
      name: 'मीन',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: ZodiacSignImageNepali.NepaliPiscesLight,
      imageColor: ZodiacSignImageNepali.NepaliPiscesColor,
    },
  ],
};
