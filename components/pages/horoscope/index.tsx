'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { ZodiacSignCardsGrid } from '@/components/ui/zodiac-sign-cards-grid';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { fetchVedastroHoroscopeList } from '@/lib/api/vedastro/horoscope';
import {
  horoscopeDetailPageHref,
  parseHoroscopeRangeFromUrl,
} from '@/lib/constants/horoscope-range-nav';
import {
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
  useHoroscopeLocale,
} from '@/lib/i18n';
import type { HoroscopeSummaryRow, VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

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

type SignCardLayout = 'grid' | 'carousel';

function HoroscopeSignCardLink(props: {
  card: DisplayCard;
  selectedRange: VedastroHoroscopeRangeType;
  uiLanguage: ELanguage;
  readMoreLabel: string;
  layout: SignCardLayout;
  highlighted?: boolean;
}) {
  const { card, selectedRange, uiLanguage, readMoreLabel, layout, highlighted = false } = props;
  const innerFlex =
    layout === 'grid'
      ? 'flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-5 md:text-left'
      : 'flex min-h-0 w-full flex-col items-center text-center';

  return (
    <Link
      href={horoscopeDetailPageHref(card.key, selectedRange, uiLanguage)}
      className={clsx(
        'group block h-full min-w-0 transition-[transform,box-shadow,colors] duration-200 active:scale-[0.99]',
        layout === 'carousel' &&
          clsx(
            'w-full max-w-full snap-start rounded-[40px] border border-[#4a4a4a] px-2 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.07)]',
            'hover:border-[#383838] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)]',
            highlighted && 'border-[#c9a063] ring-2 ring-[#e8c47a]/35',
          ),
        layout === 'grid' &&
          clsx(
            'rounded-[33px] border border-[#5c4033]/25 bg-transparent px-[14px] py-3 sm:px-4 sm:py-3 md:rounded-[28px] xl:rounded-[30px]',
            'hover:-translate-y-0.5 hover:border-[#5c4033]/45 hover:shadow-[0_6px_20px_rgba(97,21,8,0.06)]',
            'md:border-[#4a4a4a] md:px-6 md:py-5 md:shadow-[0_2px_14px_rgba(0,0,0,0.06)] md:hover:border-[#383838]',
            highlighted &&
              'border-[#c9a063] ring-2 ring-[#e8c47a]/35 md:border-[#c9a063] md:ring-2 md:ring-[#e8c47a]/35',
          ),
      )}
    >
      <div className={innerFlex}>
        <div
          className={clsx(
            'relative flex shrink-0 items-center justify-center border border-transparent bg-transparent',
            layout === 'carousel' &&
              'h-[88px] w-[88px] rounded-[22px] sm:h-[92px] sm:w-[92px] sm:rounded-[24px]',
            layout === 'grid' &&
              clsx(
                'h-[72px] w-[72px] rounded-[18px] sm:h-[76px] sm:w-[76px] sm:rounded-[20px]',
                'md:h-[78px] md:w-[78px] md:rounded-[22px] md:border-[#dfcebc]/40',
              ),
          )}
        >
          <Image
            src={card.imageLight}
            alt={card.name}
            className={clsx(
              'object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0',
              layout === 'carousel'
                ? 'h-[66px] w-[66px] sm:h-[72px] sm:w-[72px]'
                : 'h-[54px] w-[54px] sm:h-[58px] sm:w-[58px] md:h-[60px] md:w-[60px]',
            )}
          />
          <Image
            src={card.imageColor}
            alt={card.name}
            className={clsx(
              'absolute object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100',
              layout === 'carousel'
                ? 'h-[66px] w-[66px] sm:h-[72px] sm:w-[72px]'
                : 'h-[54px] w-[54px] sm:h-[58px] sm:w-[58px] md:h-[60px] md:w-[60px]',
            )}
          />
        </div>
        <div
          className={clsx(
            'flex min-h-0 min-w-0 flex-1 flex-col',
            layout === 'carousel' && 'w-full max-w-[300px] items-center sm:max-w-[320px]',
          )}
        >
          <div
            className={clsx(
              'flex flex-wrap items-center gap-1.5',
              layout === 'grid' ? 'justify-center md:justify-start' : 'justify-center',
            )}
          >
            <p
              className={clsx(
                'font-mukta font-bold leading-snug',
                layout === 'carousel'
                  ? 'text-[17px] text-[#5d1f1a] sm:text-[18px]'
                  : 'text-[15px] text-[#5d1f1a] sm:text-[16px] md:text-[#5d1f1a]',
              )}
            >
              {card.name}
            </p>
            <div className="flex items-center gap-0.5 text-[#f39c12]">
              {Array.from({ length: card.stars }).map((_, starIndex) => (
                <StartIcon
                  key={`${card.key}-star-${starIndex}`}
                  className="h-3 w-3 text-[#f39c12] sm:h-3.5 sm:w-3.5"
                />
              ))}
            </div>
          </div>

          <p
            className={clsx(
              'mt-2 font-mukta leading-snug',
              layout === 'carousel' &&
                'line-clamp-3 text-center text-[12px] text-[#666666] sm:mt-2.5 sm:text-[13px] sm:leading-[1.5]',
              layout === 'grid' &&
                'mt-1.5 line-clamp-3 text-[11px] leading-[1.45] text-[#706258] sm:line-clamp-2 sm:text-[11px] md:mt-2 md:line-clamp-3 md:text-[12px] md:leading-[1.45] md:text-[#666666]',
            )}
          >
            {card.summary}
          </p>

          <span
            className={clsx(
              'mt-4 inline-flex items-center gap-1 border-b border-[#5d1f1a] pb-0.5 font-mukta text-[12px] font-semibold text-[#5d1f1a] sm:mt-5 sm:text-[13px]',
              layout === 'grid'
                ? 'justify-center self-center md:mt-3 md:justify-start md:self-start'
                : 'justify-center self-center',
            )}
          >
            {readMoreLabel}
            <ArrowRight className="h-3 w-3 text-[#5d1f1a] sm:h-3.5 sm:w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

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
  const searchParams = useSearchParams();
  const selectedRange = parseHoroscopeRangeFromUrl(searchParams.get('type'));
  const { dict, uiLanguage } = useHoroscopeLocale();

  const [signLanguage] = useState<ELanguage>(() => readCardDisplayLanguage());

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

  const swiperKeyExtra = swiperKeySuffix ? `${swiperKeySuffix}-` : '';

  return (
    <section
      className={
        sectionClassName != null ? clsx(sectionClassName) : clsx('mt-2 bg-transparent py-4 sm:mt-4')
      }
    >
      {hideTitle ? null : (
        <div className="mx-auto max-w-5xl text-center">
          <h1
            className={clsx(
              'w-full text-center font-tiro-devanagari font-normal tracking-normal',
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

      <ZodiacSignCardsGrid
        cards={cards}
        listError={listError}
        emptyLabel={dict.list.empty}
        errorFallbackSuffix={dict.list.errorFallbackSuffix}
        swiperKey={`horoscope-${swiperKeyExtra}${selectedRange}-${signLanguage}-${cards === 'loading' ? 'loading' : cards.map(c => c.key).join(',')}`}
        dataQaId={dataQaId}
        renderCard={(card, layout) => (
          <HoroscopeSignCardLink
            card={card}
            selectedRange={selectedRange}
            uiLanguage={uiLanguage}
            readMoreLabel={dict.list.readMore}
            layout={layout}
            highlighted={
              highlightSign != null && card.key.toLowerCase() === highlightSign.toLowerCase()
            }
          />
        )}
      />
    </section>
  );
}
