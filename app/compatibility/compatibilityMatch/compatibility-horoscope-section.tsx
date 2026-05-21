'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { ZodiacSignCardsGrid } from '@/components/ui/zodiac-sign-cards-grid';
import { ELanguage } from '@/components/enums/language.enum';
import type { TodayHoroscopeDisplayCard } from '@/lib/horoscope/build-today-horoscope-display-cards';

interface CompatibilityHoroscopeSectionProps {
  title?: string | null;
  cards: TodayHoroscopeDisplayCard[] | 'loading';
  listError: string | null;
  uiLanguage: ELanguage;
  readMoreLabel: string;
  emptyLabel: string;
  errorFallbackSuffix: string;
  horoscopeCardLang: ELanguage;
  onLanguageChange: (lang: ELanguage) => void;
}

type HoroscopeCardLayout = 'grid' | 'carousel';

function CompatibilityHoroscopeCardLink({
  card,
  uiLanguage,
  readMoreLabel,
  layout,
}: {
  card: TodayHoroscopeDisplayCard & { imageLight?: string | StaticImageData };
  uiLanguage: ELanguage;
  readMoreLabel: string;
  layout: HoroscopeCardLayout;
}) {
  const params = new URLSearchParams();
  params.set('sign', card.key);
  params.set('type', 'today');
  if (uiLanguage && uiLanguage !== ELanguage.ENGLISH) {
    params.set('lang', uiLanguage);
  }

  const href = `/horoscope/details?${params.toString()}`;
  const starCount = layout === 'carousel' ? 3 : card.stars;
  const cleanSummary = card.summary
    ? card.summary.replace(/^(Across\s+)?\d{4}-\d{2}-\d{2}[.\s\u2026]*/i, '').trim()
    : '';
  
  // Use imageLight as default, fall back to image if not available
  const imageLight = card.imageLight || card.image;
  const imageColor = card.image;
  const hasHoverImage = card.imageLight && card.imageLight !== card.image;

  const innerFlex =
    layout === 'grid'
      ? 'flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-4 md:text-left'
      : 'flex min-h-0 flex-row items-center gap-3 text-left';

  if (layout === 'carousel') {
    return (
      <Link
        href={href}
        className="group block w-[min(80vw,320px)] h-[135px] snap-start rounded-[33px] border-[1px] border-[#5B5B5B] bg-transparent px-[14px] py-[12px] opacity-100 rotate-0"
      >
        <div className="flex items-center gap-[15px]">
          <div className="flex h-[104px] w-[120px] shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent p-2">
            <Image
              src={imageLight}
              alt={card.name}
              className="h-[104px] w-[120px] object-contain opacity-100"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="font-mukta text-[18px] font-bold leading-[26px] text-[#742718]">{card.name}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: starCount }).map((_, i) => (
                  <StartIcon key={`${card.key}-star-${i}`} className="h-3.5 w-3.5 text-[#ef8a20]" />
                ))}
              </div>
            </div>

            <p className="line-clamp-2 font-mukta text-[13px] leading-[20px] text-[#6b6560]">{cleanSummary}</p>

            <span className="mt-1 inline-flex items-center gap-1 self-start border-b border-[#7b3b27] pb-0.5 font-mukta text-[13px] font-semibold text-[#7b3b27]">
              {readMoreLabel}
              <ArrowRight className="h-3 w-3 text-[#7b3b27]" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block h-full min-w-0 max-w-full rounded-[20px] border border-[#5B5B5B] bg-transparent px-4 py-4 transition-[transform,box-shadow,colors] duration-200 active:scale-[0.99] hover:-translate-y-0.5 hover:border-[#5B5B5B] hover:bg-white/20 hover:shadow-[0_6px_20px_rgba(97,21,8,0.06)] md:rounded-[24px] md:border-[#5B5B5B] md:bg-transparent md:shadow-[0_2px_12px_rgba(0,0,0,0.05)] md:hover:border-[#5B5B5B] md:hover:bg-transparent xl:rounded-[26px]"
    >
      <div className={innerFlex}>
        <div className="relative flex h-[104px] w-[120px] shrink-0 items-center justify-center rounded-[18px] border border-transparent bg-transparent md:border-transparent md:bg-transparent">
          {hasHoverImage ? (
            <>
              <Image
                src={imageLight}
                alt={card.name}
                className="h-[104px] w-[120px] object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src={imageColor}
                alt={card.name}
                className="absolute h-[104px] w-[120px] object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </>
          ) : (
            <Image
              src={imageLight}
              alt={card.name}
              className="h-[104px] w-[120px] object-contain opacity-100"
            />
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
            <p className="font-mukta text-[15px] font-bold leading-snug text-[#742718] sm:text-[16px]">{card.name}</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: starCount }).map((_, i) => (
                <StartIcon key={`${card.key}-star-${i}`} className="h-3 w-3 text-[#ef8a20] sm:h-3.5 sm:w-3.5" />
              ))}
            </div>
          </div>

          <p className="mt-1.5 line-clamp-3 font-mukta text-[11px] leading-[1.45] text-[#706258] sm:line-clamp-2 sm:text-[11px] md:leading-[1.35]">{cleanSummary}</p>

          <span className="mt-3 inline-flex items-center justify-center gap-1 self-center border-b border-[#7b3b27] pb-0.5 font-mukta text-[12px] font-semibold text-[#7b3b27] md:mt-2 md:justify-start md:self-start">
            {readMoreLabel}
            <ArrowRight className="h-3 w-3 text-[#7b3b27]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CompatibilityHoroscopeSection({
  title,
  cards,
  listError,
  uiLanguage,
  readMoreLabel,
  emptyLabel,
  errorFallbackSuffix,
  horoscopeCardLang,
  onLanguageChange,
}: CompatibilityHoroscopeSectionProps) {
  const swiperKey = `compatibility-horoscope-${horoscopeCardLang}-${
    cards === 'loading' ? 'loading' : cards.map(card => card.key).join(',')
  }`;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip">
      <div className="flex flex-col gap-6 sm:gap-8">
        {title ? (
          <h2 className="px-1 text-center font-sahitya text-[20px] font-bold leading-[28px] text-primary text-balance sm:text-left sm:text-[26px] sm:leading-[34px] md:text-[28px] md:leading-[38px]">
            {title}
          </h2>
        ) : null}

        <div className="mx-auto flex w-full flex-row flex-wrap justify-center gap-[10px]">
          <button
            type="button"
            onClick={() => onLanguageChange(ELanguage.ENGLISH)}
            className={clsx(
              'flex h-[38px] w-[130px] items-center justify-center rounded-[28px] border font-mukta text-[15px] transition-colors',
              horoscopeCardLang === ELanguage.ENGLISH
                ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange(ELanguage.NEPALI)}
            className={clsx(
              'flex h-[38px] w-[130px] items-center justify-center rounded-[28px] border font-mukta text-[15px] transition-colors',
              horoscopeCardLang === ELanguage.NEPALI
                ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
            )}
          >
            Nepali
          </button>
        </div>

        <ZodiacSignCardsGrid
          cards={cards}
          listError={listError}
          emptyLabel={emptyLabel}
          errorFallbackSuffix={errorFallbackSuffix}
          swiperKey={swiperKey}
          dataQaId="compatibility-horoscope-sign-cards-grid"
          compact
          useSmUpGrid
          alignStart
          showCarouselNav={false}
          className="lg:grid-cols-3"
          renderCard={(card, layout) => (
            <CompatibilityHoroscopeCardLink
              card={card}
              uiLanguage={uiLanguage}
              readMoreLabel={readMoreLabel}
              layout={layout}
            />
          )}
        />
      </div>
    </div>
  );
}
