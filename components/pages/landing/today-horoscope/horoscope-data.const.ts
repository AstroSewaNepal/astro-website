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
      detail:
        'Bold, direct, and driven by instinct. Aries leads from the front and thrives when pursuing something new.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishAriesLight,
      imageColor: ZodiacSignImageEnglish.EnglishAriesColor,
      numberOfStars: 3,
    },
    {
      name: 'Taurus',
      detail:
        'Patient, grounded, and deeply loyal. Taurus builds slowly but creates things that last.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishTaurusLight,
      imageColor: ZodiacSignImageEnglish.EnglishTaurusColor,
      numberOfStars: 3,
    },
    {
      name: 'Gemini',
      detail:
        'Curious, quick, and endlessly adaptable. Gemini thrives on ideas, conversation, and connection.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishGeminiLight,
      imageColor: ZodiacSignImageEnglish.EnglishGeminiColor,
      numberOfStars: 3,
    },
    {
      name: 'Cancer',
      detail:
        'Intuitive, protective, and emotionally deep. Cancer feels everything intensely and cares fiercely for those close.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishCancerLight,
      imageColor: ZodiacSignImageEnglish.EnglishCancerColor,
      numberOfStars: 3,
    },
    {
      name: 'Leo',
      detail:
        'Generous, expressive, and naturally magnetic. Leo brings warmth into every room and shines brightest when lifting others.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishLeoLight,
      imageColor: ZodiacSignImageEnglish.EnglishLeoColor,
      numberOfStars: 3,
    },
    {
      name: 'Virgo',
      detail:
        'Precise, thoughtful, and quietly powerful. Virgo finds meaning in the details others overlook.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishVirgoLight,
      imageColor: ZodiacSignImageEnglish.EnglishVirgoColor,
      numberOfStars: 3,
    },
    {
      name: 'Libra',
      detail:
        'Balanced, diplomatic, and drawn to beauty. Libra seeks harmony and weighs every side before committing.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishLibraLight,
      imageColor: ZodiacSignImageEnglish.EnglishLibraColor,
      numberOfStars: 3,
    },
    {
      name: 'Scorpio',
      detail:
        'Intense, perceptive, and deeply loyal. Scorpio sees beneath the surface and is not afraid of difficult truths.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishScorpioLight,
      imageColor: ZodiacSignImageEnglish.EnglishScorpioColor,
      numberOfStars: 3,
    },
    {
      name: 'Sagittarius',
      detail:
        'Adventurous, honest, and always looking forward. Sagittarius lives for growth, freedom, and the next horizon.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishSagittariusLight,
      imageColor: ZodiacSignImageEnglish.EnglishSagittariusColor,
      numberOfStars: 3,
    },
    {
      name: 'Capricorn',
      detail:
        'Disciplined, ambitious, and built for the long run. Capricorn earns everything through sustained, deliberate effort.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishCapricornLight,
      imageColor: ZodiacSignImageEnglish.EnglishCapricornColor,
      numberOfStars: 3,
    },
    {
      name: 'Aquarius',
      detail:
        'Independent, original, and driven by ideas. Aquarius thinks about the collective even when standing alone.',
      link: '',
      image: ZodiacSignImageEnglish.EnglishAquariusLight,
      imageColor: ZodiacSignImageEnglish.EnglishAquariusColor,
      numberOfStars: 3,
    },
    {
      name: 'Pisces',
      detail:
        'Sensitive, imaginative, and spiritually attuned. Pisces navigates the world through emotion and deep intuition.',
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
