import { ELanguage } from '@/components/enums/language.enum';

/** English zodiac detail — `/zodiac-sign/details`. */
export function zodiacEnglishDetailHref(signSlug: string): string {
  const s = signSlug.trim().toLowerCase();
  return `/zodiac-sign/details?sign=${s}`;
}

/** Nepali zodiac detail — `/zodiac-sign/zodiac-detailnepali`. */
export function zodiacNepaliDetailHref(signSlug: string): string {
  const s = signSlug.trim().toLowerCase();
  return `/zodiac-sign/zodiac-detailnepali?sign=${s}`;
}

/** @deprecated Use `zodiacEnglishDetailHref` or `zodiacNepaliDetailHref`. */
export function zodiacDetailSignHref(signSlug: string): string {
  return zodiacEnglishDetailHref(signSlug);
}

/** Pick detail route from content language (e.g. horoscope page links). */
export function zodiacDetailHref(signSlug: string, contentLang?: ELanguage): string {
  if (contentLang === ELanguage.NEPALI) {
    return zodiacNepaliDetailHref(signSlug);
  }
  return zodiacEnglishDetailHref(signSlug);
}
