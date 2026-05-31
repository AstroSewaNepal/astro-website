'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';

import { CompatibilityHoroscopeSection } from '@/app/compatibility/compatibilityMatch/compatibility-horoscope-section';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { fetchVedastroHoroscopeList } from '@/lib/api/vedastro/horoscope';
import { parseHoroscopeRangeFromUrl } from '@/lib/constants/horoscope-range-nav';
import {
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
  useHoroscopeLocale,
} from '@/lib/i18n';
import type { HoroscopeSummaryRow } from '@/lib/types/vedastro';

import 'swiper/css';
import 'swiper/css/pagination';

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

function starCountFromRating(rating: number): number {
  if (!Number.isFinite(rating) || rating <= 0) {
    return 3;
  }
  return Math.min(5, Math.max(1, Math.round(rating)));
}

type DisplayCard = {
  key: string;
  name: string;
  imageLight: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number]['image'];
  imageColor: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number]['image'];
  summary: string;
  stars: number;
};

export type HoroscopeHeroSignsSectionProps = {
  /** Hide the range hero title (e.g. under details “Read horoscope for other signs”). */
  hideTitle?: boolean;
  /** Slug of the sign being viewed; matching card gets a selection ring. */
  highlightSign?: string | null;
  /** Merged onto the outer `<section>` (defaults preserve the main horoscope page). */
  sectionClassName?: string;
  /** Extra segment in Swiper `key` when multiple instances share one route. */
  swiperKeySuffix?: string;
  /** Optional `data-qa-id` for the cards grid wrapper. */
  dataQaId?: string;
};

/**
 * Horoscope listing hero (optional) + zodiac cards (API list + carousel/grid).
 * Parent route should wrap in `Suspense` when using URL search params.
 */
export function HoroscopeHeroSignsSection({
  hideTitle = false,
  highlightSign = null,
  sectionClassName,
  swiperKeySuffix = '',
  dataQaId = 'horoscope-sign-cards-grid',
}: HoroscopeHeroSignsSectionProps) {
  void highlightSign;
  void swiperKeySuffix;
  void dataQaId;
  const searchParams = useSearchParams();
  const selectedRange = parseHoroscopeRangeFromUrl(searchParams.get('type'));
  const { dict, uiLanguage } = useHoroscopeLocale();

  const [signLanguage, setSignLanguage] = useState<ELanguage>(() => readCardDisplayLanguage());

  const [rows, setRows] = useState<HoroscopeSummaryRow[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    persistCardDisplayLanguage(signLanguage);
  }, [signLanguage]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setListLoading(true);
      setListError(null);
      setRows(null);
      fetchVedastroHoroscopeList({ type: selectedRange })
        .then(envelope => {
          if (cancelled) {
            return;
          }
          setRows(envelope.data?.data ?? []);
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            setListError(e instanceof Error ? e.message : 'Could not load horoscopes.');
            setRows([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setListLoading(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRange]);

  const cards = useMemo((): DisplayCard[] | 'loading' => {
    const staticFallback = HOROSCOPE_DATA[signLanguage];
    if (listLoading && rows === null) {
      return 'loading';
    }
    if (listError && (!rows || rows.length === 0)) {
      return staticFallback.map(c => ({
        key: c.name.toLowerCase(),
        name: c.name,
        imageLight: c.image,
        imageColor: c.imageColor ?? c.image,
        summary: c.detail,
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
      const imageLight =
        meta == null
          ? fallbackImage
          : signLanguage === ELanguage.ENGLISH
            ? meta.en.image
            : meta.np.image;
      const imageColor =
        meta == null
          ? fallbackImage
          : signLanguage === ELanguage.ENGLISH
            ? (meta.en.imageColor ?? meta.en.image)
            : (meta.np.imageColor ?? meta.np.image);
      return {
        key: slug,
        name,
        imageLight,
        imageColor: imageColor,
        summary: row.summary,
        stars: starCountFromRating(row.rating),
      };
    });
  }, [signLanguage, listError, listLoading, rows]);

  return (
    <section
      className={
        sectionClassName != null ? clsx(sectionClassName) : clsx('mt-2 bg-transparent py-4 sm:mt-4')
      }
    >
      {hideTitle ? null : (
        <div className="mx-auto max-w-5xl text-center mb-8">
          <h1
            className={clsx(
              'w-full text-center font-tiro-devanagari font-normal tracking-[0em]',
              'text-[24px] leading-[47.83px] text-[#691709]',
              'sm:text-[32px] sm:leading-snug',
              'md:text-[44px] md:leading-[1.08] md:text-[#611508]',
              'lg:text-[56px] lg:leading-[1.05]',
            )}
          >
            {dict.range[selectedRange].title}
          </h1>
        </div>
      )}

      <CompatibilityHoroscopeSection
        cards={
          cards === 'loading'
            ? 'loading'
            : cards.map(card => ({
                key: card.key,
                name: card.name,
                image: card.imageColor,
                imageLight: card.imageLight,
                summary: card.summary,
                stars: card.stars,
              }))
        }
        listError={listError}
        uiLanguage={uiLanguage}
        readMoreLabel={dict.list.readMore}
        emptyLabel={dict.list.empty}
        errorFallbackSuffix={dict.list.errorFallbackSuffix}
        horoscopeCardLang={signLanguage}
        onLanguageChange={setSignLanguage}
      />
    </section>
  );
}
