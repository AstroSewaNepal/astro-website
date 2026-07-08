'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';

import StartIcon from '@/components/icons/start-icon';
import { ZodiacSignCardsGrid } from '@/components/ui/zodiac-sign-cards-grid';
import { ELanguage } from '@/components/enums/language.enum';
import type { TodayHoroscopeDisplayCard } from '@/lib/horoscope/build-today-horoscope-display-cards';

interface CompatibilityHoroscopeSectionProps {
  title?: string | null;
  subtitleHeading?: string | null;
  subtitle?: string | null;
  subtitleAsHeading?: boolean;
  headingLevel?: 'h1' | 'h2';
  headingAlign?: 'center' | 'left';
  cards: TodayHoroscopeDisplayCard[] | 'loading';
  listError: string | null;
  uiLanguage: ELanguage;
  readMoreLabel: string;
  emptyLabel: string;
  errorFallbackSuffix: string;
  horoscopeCardLang: ELanguage;
  onLanguageChange: (lang: ELanguage) => void;
  mobileButtonsWrapperClass?: string;
}

type HoroscopeCardLayout = 'grid' | 'carousel';

export function CompatibilityHoroscopeCardLink({
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

  const href = card.href ?? `/horoscope/details?${params.toString()}`;
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
        className="group block w-[148px] h-[174px] snap-start rounded-[16px] border-[1px] border-[#5B5B5B] bg-transparent p-2 sm:p-[12px] opacity-100 rotate-0 box-border overflow-hidden"
      >
        <div className="flex flex-col items-center h-full sm:flex-row sm:items-center gap-0 sm:gap-[12px] justify-start">
          <div className="flex sm:h-[104px] sm:w-[120px] h-auto w-auto shrink-0 items-start justify-center rounded-full border border-transparent bg-transparent p-1 sm:p-2">
            <Image
              src={imageLight}
              alt={card.name}
              className="h-[53px] w-[61px] sm:h-[104px] sm:w-[120px] object-contain opacity-100"
            />
          </div>

          {/* FIX: changed from justify-start + mt-auto to a tight top-aligned column */}
          <div className="flex flex-col items-center text-center gap-0 min-w-0 flex-1 px-0 justify-start">
            <div className="flex items-center gap-1 justify-center">
              <p className="font-mukta font-bold text-[14px] leading-[120%] text-[#742718] text-center sm:text-[15px] sm:leading-snug sm:text-left md:text-[14px]">
                {card.name}
              </p>
              <div className="flex items-center gap-0.5 relative -top-1 sm:top-0">
                {Array.from({ length: starCount }).map((_, i) => (
                  <StartIcon key={`${card.key}-star-${i}`} className="h-3.5 w-3.5 text-[#ef8a20]" />
                ))}
              </div>
            </div>

            {/* FIX: reduced mobile gap inside card */}
            <p className="mt-0 line-clamp-2 font-mukta font-light text-[14px] leading-[120%] text-[#6b6560]">
              {cleanSummary}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 justify-center border-b border-[#7b3b27] pb-0 font-mukta font-semibold text-[14px] leading-[16px] text-[#7b3b27] sm:mt-2 max-w-full">
              {readMoreLabel}
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px] opacity-100"
              />
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
        <div className="relative flex sm:h-[104px] sm:w-[120px] h-auto w-auto shrink-0 items-start justify-center rounded-[18px] border border-transparent bg-transparent md:border-transparent md:bg-transparent">
          {hasHoverImage ? (
            <>
              <Image
                src={imageLight}
                alt={card.name}
                className="h-[53px] w-[61px] sm:h-[104px] sm:w-[120px] object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src={imageColor}
                alt={card.name}
                className="absolute h-[53px] w-[61px] sm:h-[104px] sm:w-[120px] object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </>
          ) : (
            <Image
              src={imageLight}
              alt={card.name}
              className="h-[53px] w-[61px] sm:h-[104px] sm:w-[120px] object-contain opacity-100"
            />
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-center gap-1 md:justify-start">
            <p className="font-mukta font-bold text-[14px] leading-[120%] text-[#742718] text-center sm:text-[15px] sm:leading-snug sm:text-left md:text-[14px]">
              {card.name}
            </p>
            <div className="flex items-center gap-0.5 relative -top-1 sm:top-0">
              {Array.from({ length: starCount }).map((_, i) => (
                <StartIcon
                  key={`${card.key}-star-${i}`}
                  className="h-3 w-3 text-[#ef8a20] sm:h-3.5 sm:w-3.5"
                />
              ))}
            </div>
          </div>

          <p className="mt-1 line-clamp-3 font-mukta font-light text-[14px] leading-[120%] text-[#706258] text-center sm:line-clamp-2 sm:text-[11px] md:leading-[1.35] sm:text-left">
            {cleanSummary}
          </p>

          <span className="mt-1 sm:mt-3 inline-flex items-center justify-center gap-1 self-center border-b border-[#7b3b27] pb-0.5 font-mukta font-semibold text-[14px] leading-[28px] sm:text-[12px] sm:leading-[20px] md:mt-2 md:justify-start md:self-start text-[#7b3b27]">
            {readMoreLabel}
            <Image
              src="/icons/arrow-right.svg"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] opacity-100"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CompatibilityHoroscopeSection({
  title,
  subtitleHeading,
  subtitle,
  subtitleAsHeading = false,
  headingLevel = 'h2',
  headingAlign = 'left',
  cards,
  listError,
  uiLanguage,
  readMoreLabel,
  emptyLabel,
  errorFallbackSuffix,
  horoscopeCardLang,
  onLanguageChange,
  mobileButtonsWrapperClass = '-mt-6 sm:mt-0',
}: CompatibilityHoroscopeSectionProps) {
  const swiperKey = `compatibility-horoscope-${horoscopeCardLang}-${
    cards === 'loading' ? 'loading' : cards.map(card => card.key).join(',')
  }`;

  const HeadingTag = headingLevel;

  return (
    <div className="w-full min-w-0 max-w-full overflow-visible">
      <div className="flex flex-col gap-2 sm:gap-8">
        {title ? (
          <div
            className={clsx(
              'px-1',
              headingAlign === 'center' ? 'text-center' : 'text-left sm:text-left',
            )}
          >
            <HeadingTag
              className={clsx(
                'font-sahitya text-primary text-balance tracking-[0em]',
                headingLevel === 'h1'
                  ? 'font-semibold text-[38px] leading-[44px] sm:text-[56px] sm:leading-[47.83px]'
                  : 'font-semibold text-[20px] leading-[28px] sm:text-[26px] sm:leading-[34px] md:text-[28px] md:leading-[38px]',
              )}
            >
              {title}
            </HeadingTag>
          </div>
        ) : null}

        <div
          className={clsx(
            'mx-auto flex w-full flex-row flex-wrap justify-center gap-[10px] mt-3 sm:mt-4',
            mobileButtonsWrapperClass,
          )}
        >
          <button
            type="button"
            onClick={() => onLanguageChange(ELanguage.ENGLISH)}
            className={clsx(
              'flex h-[38px] sm:h-[48px] w-full max-w-[130px] items-center justify-center rounded-[28px] border font-mukta font-normal text-[20px] leading-[28px] tracking-[0em] transition-colors gap-[10px] rotate-0 opacity-100 py-[10px] px-[35px]',
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
              'flex h-[38px] sm:h-[48px] w-full max-w-[130px] items-center justify-center rounded-[28px] border font-mukta font-normal text-[20px] leading-[28px] tracking-[0em] transition-colors gap-[10px] rotate-0 opacity-100 py-[10px] px-[35px]',
              horoscopeCardLang === ELanguage.NEPALI
                ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
            )}
          >
            Nepali
          </button>
        </div>

        {(subtitleHeading || subtitle) ? (
          <div
            className={clsx(
              'px-1',
              headingAlign === 'center' ? 'text-center' : 'text-left sm:text-left',
            )}
          >
            {subtitleHeading ? (
              <h2 className="mt-3 font-sahitya font-semibold text-[24px] leading-[32px] text-primary sm:text-[26px] sm:leading-[36px] md:text-[28px] md:leading-[40px]">
                {subtitleHeading}
              </h2>
            ) : null}
            {subtitle ? (
              subtitleAsHeading && !subtitleHeading ? (
                <h2 className="mt-3 font-sahitya font-semibold text-[24px] leading-[32px] text-primary sm:text-[26px] sm:leading-[36px] md:text-[28px] md:leading-[40px]">
                  {subtitle}
                </h2>
              ) : (
                <p className={clsx('mt-3 font-mukta text-[16px] leading-[28px] text-[#5f5248] sm:text-[18px] sm:leading-[30px]', subtitleHeading ? 'mt-2' : '')}>
                  {subtitle}
                </p>
              )
            ) : null}
          </div>
        ) : null}

        <ZodiacSignCardsGrid
          cards={cards}
          listError={listError}
          emptyLabel={emptyLabel}
          errorFallbackSuffix={errorFallbackSuffix}
          swiperKey={swiperKey}
          dataQaId="compatibility-horoscope-sign-cards-grid"
          compact
          useSmUpGrid
          showCarouselNav
          showCustomPagination
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
