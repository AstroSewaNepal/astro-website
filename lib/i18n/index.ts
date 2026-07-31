export type { HoroscopeMessages, HoroscopeRangeCopy } from './locales/horoscope/schema';
export {
  HOROSCOPE_DICTIONARIES,
  horoscopeEn,
  horoscopeNe,
  interpolate,
  parseUiLangParam,
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
} from './locale';
export {
  HoroscopeLocaleProvider,
  useHoroscopeLocale,
  useHoroscopeLocaleOptional,
} from './locale-context';