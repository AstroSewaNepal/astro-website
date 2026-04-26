import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

export type HoroscopeRangeCopy = { title: string; intro: string };

export type HoroscopeMessages = {
  range: Record<VedastroHoroscopeRangeType, HoroscopeRangeCopy>;
  list: {
    langEnglish: string;
    langNepali: string;
    errorFallbackSuffix: string;
    empty: string;
    readMore: string;
    loading: string;
  };
  section: {
    whatIsTitle: string;
    whatIsP1: string;
    whatIsP2: string;
    whyTitle: string;
    whyP1: string;
    whyP2: string;
  };
  details: {
    unknownSign: string;
    chooseSign: string;
    invalidSignHelp: string;
    pickFromListHelp: string;
    backToList: string;
    rangeHeading: Record<VedastroHoroscopeRangeType, string>;
    rangeSub: Record<VedastroHoroscopeRangeType, string>;
    tabs: Record<VedastroHoroscopeRangeType, string>;
    sections: {
      general: string;
      love: string;
      career: string;
      health: string;
    };
    moreFor: string;
    compatibility: string;
    readOtherSigns: string;
    traitsTitle: string;
    combinedHeading: string;
    astro: {
      moonIn: string;
      ruledBy: string;
      mercuryRetrograde: string;
      energy: string;
      intensity: string;
    };
  };
  header: {
    nav: {
      horoscope: string;
      zodiacSigns: string;
      kundali: string;
      compatibility: string;
      pujaBidhi: string;
      calculator: string;
      blog: string;
    };
    mobile: {
      home: string;
      aboutUs: string;
      zodiacSign: string;
    };
    signIn: string;
    langEn: string;
    langNe: string;
  };
  footer: {
    appsTitle: string;
    quickLinks: string;
    usefulLinks: string;
    contactUs: string;
    copyright: string;
    rights: string;
    links: {
      freeKundali: string;
      kundaliMatching: string;
      horoscope: string;
      talkToAstrologer: string;
      pujaBidhi: string;
      blog: string;
      aboutUs: string;
      contact: string;
      astrologerRegistration: string;
      zodiacSign: string;
      calculator: string;
    };
    legal: {
      terms: string;
      pricing: string;
      disclaimer: string;
    };
  };
};
