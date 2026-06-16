'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination as SwiperPagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/pagination';

import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import Pagination from '@/components/common/pagination';

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
   * Show custom mobile pagination dots and left/right buttons for the carousel.
   */
  showCustomPagination?: boolean;
  /**
   * Show exactly one slide per view on mobile, without partial peeking.
   */
  oneSlidePerView?: boolean;
  /**
   * Start the carousel aligned to the left edge instead of centering the first card.
   */
  alignStart?: boolean;
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
  showCarouselNav = true,
  pagination,
  showCustomPagination = false,
  oneSlidePerView = false,
  alignStart = false,
  compact = false,
  useSmUpGrid = false,
}: ZodiacSignCardsGridProps<T>) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const cardsCount = cards === 'loading' ? 0 : cards.length;
  const isEmpty = cards !== 'loading' && cards.length === 0;
  const showCustomPaginationBar = showCustomPagination && cardsCount > 1;
  const showCarouselNavButtons = showCarouselNav && showCustomPaginationBar && cardsCount > 1;
  const swiperPagination = showCustomPaginationBar
    ? false
    : (pagination ?? {
        clickable: true,
      });
  const showError = Boolean(listError);
  const carouselHideUp = useSmUpGrid ? 'sm:hidden' : 'md:hidden';
  const gridShowFrom = useSmUpGrid ? 'sm:grid' : 'md:grid';

  const updateSlidesPerView = (swiper: SwiperType) => {
    if (oneSlidePerView) {
      setSlidesPerView(1);
      return;
    }

    if (typeof swiper.params.slidesPerView === 'number') {
      setSlidesPerView(swiper.params.slidesPerView);
      return;
    }

    if (typeof window === 'undefined') {
      setSlidesPerView(1);
      return;
    }

    const width = swiper.width ?? window.innerWidth;

    if (compact) {
      setSlidesPerView(width >= 400 ? 2 : 1);
      return;
    }

    setSlidesPerView(1);
  };

  const totalPages = useMemo(() => {
    if (cards === 'loading') return 0;
    if (slidesPerView >= cards.length) return 1;
    return Math.ceil(cards.length / slidesPerView);
  }, [cards, slidesPerView]);

  const currentPage = useMemo(() => {
    if (cards === 'loading' || cards.length === 0) return 1;
    return Math.min(Math.floor(activeIndex / slidesPerView) + 1, totalPages);
  }, [activeIndex, slidesPerView, totalPages, cards]);

  const handlePageChange = (page: number) => {
    if (!swiperRef.current || cards === 'loading') return;

    const maxIndex = Math.max(0, cards.length - slidesPerView);
    const targetIndex = Math.min((page - 1) * slidesPerView, maxIndex);
    swiperRef.current.slideTo(targetIndex);
  };

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
            {showCarouselNavButtons ? (
              <>
                <button
                  type="button"
                  aria-label="Previous sign"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className={clsx(
                    'absolute z-10 flex items-center justify-center rounded-full border border-[#611508] bg-transparent text-[#611508] hover:bg-[#fff7f4] transition-colors opacity-100 md:hidden',
                  )}
                  style={{
                    width: 23.72283935546875,
                    height: 23.72283935546875,
                    top: '75.14px',
                    left: '-0px',
                    borderWidth: 1,
                  }}
                >
                  <ArrowLeft className="h-[12px] w-[12px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next sign"
                  onClick={() => swiperRef.current?.slideNext()}
                  className={clsx(
                    'absolute z-10 flex items-center justify-center rounded-full border border-[#611508] bg-transparent text-[#611508] hover:bg-[#fff7f4] transition-colors opacity-100 md:hidden',
                  )}
                  style={{
                    width: 23.72283935546875,
                    height: 23.72283935546875,
                    top: '75.14px',
                    right: 0,
                    borderWidth: 1,
                  }}
                >
                  <ArrowRight className="h-[12px] w-[12px]" />
                </button>
              </>
            ) : null}
            <Swiper
              key={swiperKey}
              modules={[SwiperPagination]}
              slidesPerView={oneSlidePerView ? 1 : compact ? 2 : 1.28}
              spaceBetween={oneSlidePerView ? 0 : compact ? 8 : 10}
              centeredSlides={!alignStart}
              slidesOffsetBefore={oneSlidePerView ? 0 : compact ? 30 : alignStart ? 0 : 4}
              slidesOffsetAfter={oneSlidePerView || alignStart ? 40 : compact ? 40 : 4}
              breakpoints={
                oneSlidePerView
                  ? {}
                  : compact
                    ? {
                        320: { slidesPerView: 1.8, spaceBetween: 8 },
                        400: { slidesPerView: 2, spaceBetween: 8 },
                        480: { slidesPerView: 2.15, spaceBetween: 10 },
                      }
                    : {
                        400: { slidesPerView: 1.38, spaceBetween: 11 },
                        480: { slidesPerView: 1.48, spaceBetween: 12 },
                      }
              }
              className={clsx(
                'horoscope-cards-swiper pb-12 sm:pb-14',
                alignStart
                  ? 'max-w-full !overflow-hidden px-0'
                  : compact
                    ? 'max-w-full !overflow-hidden px-5'
                    : '!overflow-visible px-10',
              )}
              pagination={swiperPagination}
              onSwiper={swiper => {
                swiperRef.current = swiper;
                updateSlidesPerView(swiper);
              }}
              onSlideChange={swiper => {
                setActiveIndex(swiper.activeIndex);
                updateSlidesPerView(swiper);
              }}
              onResize={swiper => updateSlidesPerView(swiper)}
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
            {showCustomPaginationBar ? (
              <div className="mt-3 px-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onPrevious={() => swiperRef.current?.slidePrev()}
                  onNext={() => swiperRef.current?.slideNext()}
                  hideControls
                  dotClassName="w-[4.784643650054932px] h-[4.784643650054932px]"
                  dotGap="4.16px"
                  className="justify-center w-full"
                />
              </div>
            ) : null}
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
