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
   * If false, hide the carousel navigation arrows.
   */
  showCarouselNav?: boolean;
  /**
   * Optional swiper pagination config.
   */
  pagination?: Parameters<typeof Swiper>[0]['pagination'];
  /**
   * Show exactly one slide per view on mobile, without partial peeking.
   */
  oneSlidePerView?: boolean;
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
    <div className="min-h-[272px] w-full animate-pulse rounded-[40px] border border-[#4a4a4a]/35 sm:min-h-[288px]" />
  ) : (
    <div className="min-h-[120px] animate-pulse rounded-[20px] border border-[#5c4033]/25 bg-transparent md:min-h-[120px] md:rounded-[24px] md:border-[#d4d4d8] xl:rounded-[26px]" />
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
  showCarouselNav = true,
  pagination,
  oneSlidePerView = false,
  compact = false,
  useSmUpGrid = false,
}: ZodiacSignCardsGridProps<T>) {
  const swiperRef = useRef<SwiperType | null>(null);
  const isEmpty = cards !== 'loading' && cards.length === 0;
  const showCarouselNavButtons = showCarouselNav && cards !== 'loading' && cards.length > 1;
  const swiperPagination = pagination ?? { clickable: true };
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
            {/* {showCarouselNav ? (
              <>
                <button
                  type="button"
                  aria-label="Previous sign"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className={clsx(
                    'absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 shadow-sm transition-colors',
                    compact ? 'left-0.5 h-8 w-8 sm:left-0 sm:h-9 sm:w-9' : 'left-0 h-9 w-9',
                  )}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 19L8 12L15 5"
                      stroke="#6B2417"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next sign"
                  onClick={() => swiperRef.current?.slideNext()}
                  className={clsx(
                    'absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 shadow-sm transition-colors',
                    compact ? 'right-0.5 h-8 w-8 sm:right-0 sm:h-9 sm:w-9' : 'right-0 h-9 w-9',
                  )}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 5L16 12L9 19"
                      stroke="#6B2417"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </>
            ) : null} */}
            <Swiper
              key={swiperKey}
              modules={[Pagination]}
              slidesPerView={2}
              spaceBetween={compact ? 8 : 10}
              breakpoints={
                oneSlidePerView
                  ? {}
                  : compact
                    ? {
                        400: { slidesPerView: 1.22, spaceBetween: 9 },
                        480: { slidesPerView: 1.32, spaceBetween: 10 },
                        560: { slidesPerView: 1.65, spaceBetween: 10 },
                        640: { slidesPerView: 1.88, spaceBetween: 11 },
                      }
                    : {
                        400: { slidesPerView: 1.38, spaceBetween: 11 },
                        480: { slidesPerView: 1.48, spaceBetween: 12 },
                        560: { slidesPerView: 1.62, spaceBetween: 12 },
                        640: { slidesPerView: 1.88, spaceBetween: 12 },
                      }
              }
              className={clsx(
                'horoscope-cards-swiper pb-12 sm:pb-14',
                compact ? 'max-w-full !overflow-hidden px-5' : '!overflow-visible px-10',
              )}
              pagination={swiperPagination}
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
