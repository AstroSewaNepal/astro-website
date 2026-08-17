import { ELanguage } from '@/components/enums/language.enum';

/** In-app routes under `/zodiac-sign`. `sign` is the Vedastro slug (`aries`, `taurus`, …). */
export function zodiacDetailHref(
  signSlug: string,
  contentLang: ELanguage = ELanguage.ENGLISH,
  headerLang?: ELanguage,
): string {
  const s = signSlug.trim().toLowerCase();
  const path = `/zodiac-sign/${s}`;
  
  const params = new URLSearchParams();
  if (contentLang && contentLang !== ELanguage.ENGLISH) {
    params.set('content_lang', contentLang);
  }
  if (headerLang && headerLang !== ELanguage.ENGLISH) {
    params.set('lang', headerLang);
  }
  
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function zodiacEnglishDetailHref(signSlug: string, headerLang?: ELanguage): string {
  return zodiacDetailHref(signSlug, ELanguage.ENGLISH, headerLang);
}

export function zodiacNepaliDetailHref(signSlug: string, headerLang?: ELanguage): string {
  return zodiacDetailHref(signSlug, ELanguage.NEPALI, headerLang);
}
