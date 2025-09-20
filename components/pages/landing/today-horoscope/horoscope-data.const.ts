import { StaticImageData } from 'next/image';

import {
  EnglishLeoLight,
  EnglishAriesLight,
  EnglishLibraLight,
  EnglishVirgoLight,
  EnglishCancerLight,
  EnglishGeminiLight,
  EnglishPiscesLight,
  EnglishTaurusLight,
  EnglishScorpioLight,
  EnglishAquariusLight,
  EnglishCapricornLight,
  EnglishSagittariusLight,
} from '@/components/images/zodiac/english';
import {
  NepaliLeoLight,
  NepaliAriesLight,
  NepaliLibraLight,
  NepaliVirgoLight,
  NepaliCancerLight,
  NepaliGeminiLight,
  NepaliPiscesLight,
  NepaliTaurusLight,
  NepaliScorpioLight,
  NepaliAquariusLight,
  NepaliCapricornLight,
  NepaliSagittariusLight,
} from '@/components/images/zodiac/nepali';
import { ELanguage } from '@/components/enums/language.enum';

export const HOROSCOPE_DATA: Record<
  ELanguage,
  Array<{
    name: string;
    detail: string;
    link: string;
    image: string | StaticImageData;
    numberOfStars: number;
  }>
> = {
  [ELanguage.ENGLISH]: [
    {
      name: 'Aries',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishAriesLight,
      numberOfStars: 3,
    },
    {
      name: 'Taurus',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishTaurusLight,
      numberOfStars: 3,
    },
    {
      name: 'Gemini',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishGeminiLight,
      numberOfStars: 3,
    },
    {
      name: 'Cancer',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishCancerLight,
      numberOfStars: 3,
    },
    {
      name: 'Leo',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishLeoLight,
      numberOfStars: 3,
    },
    {
      name: 'Virgo',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishVirgoLight,
      numberOfStars: 3,
    },
    {
      name: 'Libra',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishLibraLight,
      numberOfStars: 3,
    },
    {
      name: 'Scorpio',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishScorpioLight,
      numberOfStars: 3,
    },
    {
      name: 'Sagittarius',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishSagittariusLight,
      numberOfStars: 3,
    },
    {
      name: 'Capricorn',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishCapricornLight,
      numberOfStars: 3,
    },
    {
      name: 'Aquarius',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishAquariusLight,
      numberOfStars: 3,
    },
    {
      name: 'Pisces',
      detail: 'Your spark can move mountains, start bold today',
      link: '',
      image: EnglishPiscesLight,
      numberOfStars: 3,
    },
  ],
  [ELanguage.NEPALI]: [
    {
      name: 'मेष',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliAriesLight,
      numberOfStars: 3,
    },
    {
      name: 'वृष',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliTaurusLight,
      numberOfStars: 3,
    },
    {
      name: 'मिथुन',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliGeminiLight,
      numberOfStars: 3,
    },
    {
      name: 'कर्कट',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliCancerLight,
      numberOfStars: 3,
    },
    {
      name: 'सिंह',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliLeoLight,
      numberOfStars: 3,
    },
    {
      name: 'कन्या',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliVirgoLight,
      numberOfStars: 3,
    },
    {
      name: 'तुला',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliLibraLight,
      numberOfStars: 3,
    },
    {
      name: 'वृश्चिक',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliScorpioLight,
      numberOfStars: 3,
    },
    {
      name: 'धनु',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: NepaliSagittariusLight,
    },
    {
      name: 'मकर',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      image: NepaliCapricornLight,
      numberOfStars: 3,
    },
    {
      name: 'कुम्भ',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: NepaliAquariusLight,
    },
    {
      name: 'मीन',
      detail: 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्',
      link: '',
      numberOfStars: 3,
      image: NepaliPiscesLight,
    },
  ],
};
