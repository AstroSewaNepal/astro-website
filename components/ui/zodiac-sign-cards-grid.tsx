'use client';

import { useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/pagination';

import { ChevronLeftIcon } from '@/components/images/icons';

export type ZodiacSignCardLayout = 'carousel' | 'grid';

export interface ZodiacSignCardsGridProps<T> {
  cards: T[] | 'loading';
  listError?: string | null;
  emptyLabel: string;
  errorFallbackSuffix?: string;
  swiperKey: string;
  dataQaId?: string;
  renderCard: (card: T, layout: ZodiacSignCardLayout) => ReactNode;
  renderLoadingSkeleton?: (index: number, layout: ZodiacSignCardLayout) => ReactNode;
  className?: string;
  /**
   * Tighter carousel + less horizontal padding when nested in a narrow column
   * (avoids page-level horizontal scroll from Swiper overflow).
   */
  compact?: boolean;
  /** When true, switch from carousel to grid from `sm` (640px) instead of `md` (768px). */
  useSmUpGrid?: boolean;
}

function DefaultLoadingSkeleton({ layout }: { layout: ZodiacSignCardLayout }) {
  return layout === 'carousel' ? (
    <div className="min-h-[140px] animate-pulse rounded-[20px] border border-[#d4d4d8] bg-neutral-100" />
  ) : (
    <div className="min-h-[120px] animate-pulse rounded-[20px] border border-[#5c4033]/25 bg-transparent md:min-h-[120px] md:rounded-[24px] md:border-[#d4d4d8] md:bg-neutral-100 xl:rounded-[26px]" />
  );
}

export function ZodiacSignCardsGrid<T>({
  cards,
  listError,
  emptyLabel,
  errorFallbackSuffix,
  swiperKey,
  dataQaId,
  renderCard,
  renderLoadingSkeleton,
  className,
  compact = false,
  useSmUpGrid = false,
}: ZodiacSignCardsGridProps<T>) {
  const swiperRef = useRef<SwiperType | null>(null);
  const isEmpty = cards !== 'loading' && cards.length === 0;
  const showError = Boolean(listError);
  const carouselHideUp = useSmUpGrid ? 'sm:hidden' : 'md:hidden';
  const gridShowFrom = useSmUpGrid ? 'sm:grid' : 'md:grid';

  return (
    <div data-qa-id={dataQaId} className="min-w-0 max-w-full">
      {showError ? (
        <p
          className="mt-4 px-1 text-center font-mukta text-[12px] text-[#a94442] sm:text-[13px]"
          role="alert"
        >
          {listError} {errorFallbackSuffix}
        </p>
      ) : null}

      {isEmpty ? (
        <p className="mt-6 py-6 text-center font-mukta text-[14px] text-[#6b5a4e] sm:mt-8 sm:text-[15px]">
          {emptyLabel}
        </p>
      ) : (
        <>
          {/* Mobile: carousel with peek, side arrows, pagination dots */}
          <div
            className={clsx(
              'horoscope-hero-swiper-mob relative min-w-0 max-w-full',
              compact ? 'mt-4 sm:mt-6' : 'mt-6 sm:mt-8',
              carouselHideUp,
            )}
          >
            <button
              type="button"
              aria-label="Previous sign"
              onClick={() => swiperRef.current?.slidePrev()}
              className={clsx(
                'absolute top-[42%] z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 bg-white/95 shadow-sm transition-colors hover:bg-white',
                compact ? 'left-0.5 h-8 w-8 sm:left-0 sm:h-9 sm:w-9' : 'left-0 h-9 w-9',
              )}
            >
              <Image src={ChevronLeftIcon} alt="" className="h-2.5 w-2.5 opacity-75" />
            </button>
            <button
              type="button"
              aria-label="Next sign"
              onClick={() => swiperRef.current?.slideNext()}
              className={clsx(
                'absolute top-[42%] z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 bg-white/95 shadow-sm transition-colors hover:bg-white',
                compact ? 'right-0.5 h-8 w-8 sm:right-0 sm:h-9 sm:w-9' : 'right-0 h-9 w-9',
              )}
            >
              <Image src={ChevronLeftIcon} alt="" className="h-2.5 w-2.5 rotate-180 opacity-75" />
            </button>
            <Swiper
              key={swiperKey}
              modules={[Pagination]}
              slidesPerView={compact ? 1.12 : 1.28}
              spaceBetween={compact ? 8 : 10}
              centeredSlides
              slidesOffsetBefore={compact ? 0 : 4}
              slidesOffsetAfter={compact ? 0 : 4}
              breakpoints={
                compact
                  ? {
                      400: { slidesPerView: 1.22, spaceBetween: 9 },
                      480: { slidesPerView: 1.32, spaceBetween: 10 },
                    }
                  : {
                      400: { slidesPerView: 1.38, spaceBetween: 11 },
                      480: { slidesPerView: 1.48, spaceBetween: 12 },
                    }
              }
              className={clsx(
                'horoscope-cards-swiper pb-9',
                compact ? 'max-w-full !overflow-hidden px-5' : '!overflow-visible px-10',
              )}
              pagination={{ clickable: true }}
              onSwiper={swiper => {
                swiperRef.current = swiper;
              }}
            >
              {cards === 'loading'
                ? Array.from({ length: 8 }).map((_, index) => (
                    <SwiperSlide
                      key={`cards-skeleton-mob-${swiperKey}-${index}`}
                      className="!h-auto min-w-0 max-w-full"
                    >
                      {renderLoadingSkeleton?.(index, 'carousel') ?? (
                        <DefaultLoadingSkeleton layout="carousel" />
                      )}
                    </SwiperSlide>
                  ))
                : cards.map((card, index) => (
                    <SwiperSlide
                      key={`mob-${swiperKey}-${index}`}
                      className="!h-auto min-w-0 max-w-full"
                    >
                      {renderCard(card, 'carousel')}
                    </SwiperSlide>
                  ))}
            </Swiper>
          </div>

          <div
            className={clsx(
              'hidden min-w-0 max-w-full grid-cols-1 gap-3',
              gridShowFrom,
              compact ? 'mt-4 sm:mt-6' : 'mt-6 sm:mt-8',
              'sm:grid-cols-2 sm:gap-4',
              'xl:grid-cols-4 xl:gap-5',
              className,
            )}
          >
            {cards === 'loading'
              ? Array.from({ length: 12 }).map((_, index) => (
                  <div key={`cards-skeleton-${swiperKey}-${index}`}>
                    {renderLoadingSkeleton?.(index, 'grid') ?? (
                      <DefaultLoadingSkeleton layout="grid" />
                    )}
                  </div>
                ))
              : cards.map((card, index) => (
                  <div key={`grid-${swiperKey}-${index}`}>{renderCard(card, 'grid')}</div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
