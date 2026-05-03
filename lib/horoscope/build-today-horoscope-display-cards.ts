import type { StaticImageData } from 'next/image';

import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import type { HoroscopeSummaryRow } from '@/lib/types/vedastro';

export type TodayHoroscopeDisplayCard = {
  key: string;
  name: string;
  image: string | StaticImageData;
  summary: string;
  stars: number;
};

type HoroscopeCardMeta = {
  en: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number];
  np: (typeof HOROSCOPE_DATA)[ELanguage.NEPALI][number];
};

function buildHoroscopeMetaBySlug(): Record<string, HoroscopeCardMeta> {
  const en = HOROSCOPE_DATA[ELanguage.ENGLISH];
  const np = HOROSCOPE_DATA[ELanguage.NEPALI];
  const out: Record<string, HoroscopeCardMeta> = {};
  en.forEach((c, i) => {
    out[c.name.toLowerCase()] = { en: c, np: np[i]! };
  });
  return out;
}

const META_BY_SLUG = buildHoroscopeMetaBySlug();

export function starCountFromRating(rating: number): number {
  if (!Number.isFinite(rating) || rating <= 0) {
    return 3;
  }
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function summaryWithOptionalDatePrefix(listDate: string | null, body: string): string {
  if (!listDate) return body;
  const isoDay = listDate.slice(0, 10);
  const prefix = /^\d{4}-\d{2}-\d{2}$/.test(isoDay) ? `Across ${isoDay}… ` : `Across ${listDate}… `;
  return prefix + body;
}

/**
 * Maps Vedastro `horoscope/list?type=today` rows to UI cards (aligned with `/horoscope` grid).
 */
export function buildTodayHoroscopeDisplayCards(args: {
  rows: HoroscopeSummaryRow[] | null;
  listLoading: boolean;
  listError: string | null;
  signLanguage: ELanguage;
  listDate: string | null;
}): TodayHoroscopeDisplayCard[] | 'loading' {
  const { rows, listLoading, listError, signLanguage, listDate } = args;
  const staticFallback = HOROSCOPE_DATA[signLanguage];

  if (listLoading && rows === null) {
    return 'loading';
  }
  if (listError && (!rows || rows.length === 0)) {
    return staticFallback.map(c => ({
      key: c.name.toLowerCase(),
      name: c.name,
      image: c.image,
      summary: summaryWithOptionalDatePrefix(listDate, c.detail),
      stars: c.numberOfStars,
    }));
  }
  if (!rows?.length) {
    return [];
  }
  return rows.map(row => {
    const slug = row.slug.toLowerCase();
    const meta = META_BY_SLUG[slug];
    const fallbackImage = staticFallback[0]!.image;
    const name =
      meta == null ? row.sign : signLanguage === ELanguage.ENGLISH ? meta.en.name : meta.np.name;
    const image =
      meta == null
        ? fallbackImage
        : signLanguage === ELanguage.ENGLISH
          ? meta.en.image
          : meta.np.image;
    return {
      key: slug,
      name,
      image,
      summary: summaryWithOptionalDatePrefix(listDate, row.summary),
      stars: starCountFromRating(row.rating),
    };
  });
}
