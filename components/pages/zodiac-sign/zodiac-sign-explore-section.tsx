'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { CompatibilityHoroscopeCardLink } from '@/app/compatibility/compatibilityMatch/compatibility-horoscope-section';
import { ZodiacSignMiniCard } from '@/components/pages/zodiac-sign/zodiac-sign-mini-card';
import { ZodiacSignCardsGrid } from '@/components/ui/zodiac-sign-cards-grid';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { zodiacDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import type { HoroscopeSign } from '@/lib/types/horoscope';

const cardBaseText = 'Your spark can move mountains, start bold today';

type Props = {
  title?: string;
  contentLanguage: ELanguage;
  headerLanguage: ELanguage;
  signSlug: HoroscopeSign;
  isNepali: boolean;
  onContentLanguageChange: (lang: ELanguage) => void;
  className?: string;
};

export function ZodiacSignExploreSection({
  title = 'Explore Other Zodiac Signs',
  contentLanguage,
  headerLanguage,
  signSlug,
  isNepali,
  onContentLanguageChange,
  className,
}: Props) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const readMoreLabel = isNepali ? 'थप पढ्नुहोस्' : 'Read More';

  const exploreCards = useMemo(
    () =>
      HOROSCOPE_SIGNS.map((sign, index) => {
        const card = HOROSCOPE_DATA[contentLanguage][index]!;
        return {
          key: sign,
          name: card.name,
          image: card.imageColor ?? card.image,
          imageLight: card.image,
          summary: card.detail || cardBaseText,
          stars: card.numberOfStars ?? 3,
          href: zodiacDetailHref(sign, contentLanguage, headerLanguage),
        };
      }),
    [contentLanguage, headerLanguage],
  );

  const updateActiveCarouselIndex = () => {
    if (!carouselRef.current) return;
    const containerRect = carouselRef.current.getBoundingClientRect();
    const slides = Array.from(carouselRef.current.children) as HTMLElement[];
    const activeIndex = slides.findIndex(slide => {
      const rect = slide.getBoundingClientRect();
      return rect.left >= containerRect.left - 1;
    });
    setActiveCarouselIndex(activeIndex >= 0 ? activeIndex : 0);
  };

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(updateActiveCarouselIndex);
    const element = carouselRef.current;
    if (!element) {
      cancelAnimationFrame(raf);
      return;
    }

    element.addEventListener('scroll', updateActiveCarouselIndex, { passive: true });
    window.addEventListener('resize', updateActiveCarouselIndex);

    return () => {
      cancelAnimationFrame(raf);
      element.removeEventListener('scroll', updateActiveCarouselIndex);
      window.removeEventListener('resize', updateActiveCarouselIndex);
    };
  }, [contentLanguage]);

  const scrollToCarouselIndex = (index: number) => {
    if (!carouselRef.current) return;
    const slide = carouselRef.current.children[index] as HTMLElement | undefined;
    if (!slide) return;
    carouselRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  };

  return (
    <section
      className={clsx('mx-auto mt-10 w-full min-w-0 max-w-[1180px] px-1 sm:px-0', className)}
    >
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="px-1 text-center font-sahitya text-[20px] font-bold leading-[28px] text-[#6b2417] text-balance sm:text-left sm:text-[24px] sm:leading-[34px] lg:text-[28px]">
          {title}
        </h2>

        <div className="mx-auto flex w-full min-w-0 flex-row flex-wrap justify-center gap-[10px] sm:mx-0 sm:justify-end">
          <button
            type="button"
            onClick={() => onContentLanguageChange(ELanguage.ENGLISH)}
            className={clsx(
              'flex h-[38px] w-[130px] shrink-0 items-center justify-center rounded-[28px] border px-[35px] py-[10px] font-mukta text-[20px] font-normal leading-[28px] tracking-[0em] transition-colors sm:h-[48px]',
              contentLanguage === ELanguage.ENGLISH
                ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onContentLanguageChange(ELanguage.NEPALI)}
            className={clsx(
              'flex h-[38px] w-[130px] shrink-0 items-center justify-center rounded-[28px] border px-[35px] py-[10px] font-mukta text-[20px] font-normal leading-[28px] tracking-[0em] transition-colors sm:h-[48px]',
              contentLanguage === ELanguage.NEPALI
                ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
            )}
          >
            Nepali
          </button>
        </div>
      </div>

      {/* Mobile: mini-card carousel */}
      <div
        ref={carouselRef}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide sm:hidden"
      >
        {HOROSCOPE_SIGNS.map((sign, index) => {
          const card = HOROSCOPE_DATA[contentLanguage][index]!;
          return (
            <div key={sign} className="min-w-[260px] shrink-0 snap-start">
              <ZodiacSignMiniCard
                href={zodiacDetailHref(sign, contentLanguage, headerLanguage)}
                image={card.image}
                imageColor={card.imageColor}
                name={card.name}
                blurb={card.detail || cardBaseText}
                readMoreLabel={readMoreLabel}
                active={sign === signSlug}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center gap-2 sm:hidden">
        {HOROSCOPE_SIGNS.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to card ${index + 1}`}
            onClick={() => scrollToCarouselIndex(index)}
            className={clsx(
              'h-2 min-w-[8px] rounded-full transition-colors',
              index === activeCarouselIndex ? 'bg-[#611508]' : 'bg-[#d7c3b1]',
            )}
          />
        ))}
      </div>

      {/* Desktop: horoscope-style card grid */}
      <div className="mt-5 hidden sm:block">
        <ZodiacSignCardsGrid
          cards={exploreCards}
          listError={null}
          emptyLabel="No zodiac signs available."
          errorFallbackSuffix=""
          swiperKey={`zodiac-explore-${contentLanguage}-${signSlug}`}
          dataQaId="zodiac-explore-sign-cards-grid"
          compact
          useSmUpGrid
          showCarouselNav={false}
          showCustomPagination={false}
          renderCard={(card, layout) => (
            <CompatibilityHoroscopeCardLink
              card={card}
              uiLanguage={contentLanguage}
              readMoreLabel={readMoreLabel}
              layout={layout}
            />
          )}
        />
      </div>
    </section>
  );
}
