'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import Pagination from '@/components/common/pagination';
import { fetchTopAstrologers } from '@/lib/astrologer-api';

import AstrologerCard from './AstrologerCard';
import AstrologerCardSkeleton from './AstrologerCardSkeleton';
import type { Astrologer, AstrologerCardActions } from './types';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';

import 'swiper/css';
import 'swiper/css/navigation';

const SKELETON_COUNT = 3;

export type TopAstrologersProps = AstrologerCardActions;

const TopAstrologers: React.FC<TopAstrologersProps> = ({ onChat, onCall, onSchedule }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAstrologers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTopAstrologers();
        if (cancelled) return;
        setAstrologers(data);
      } catch (loadError) {
        if (cancelled) return;
        setAstrologers([]);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load astrologers.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAstrologers();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = useMemo(
    () => Math.max(isLoading ? SKELETON_COUNT : astrologers.length, 1),
    [astrologers.length, isLoading],
  );

  const handlePrevious = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  }, []);

  const handleNext = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }
  }, [totalPages]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentPage(swiper.realIndex + 1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(page - 1);
    }
    setCurrentPage(page);
  }, []);

  if (!isLoading && !error && astrologers.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-[#0000001f] bg-white/50 px-6 py-10 text-center sm:mt-10 md:mt-[50px]">
        <p className="font-mukta text-base text-[#5b5b5b] sm:text-lg">
          No astrologers available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-10 md:mt-[50px]">
      <style>{`
        @media (max-width: 639px) {
          .talk-to-our-astrologer-swiper .swiper-slide {
            width: 100% !important;
            height: 375px !important;
            opacity: 1;
            transform: rotate(0deg);
          }
          .talk-to-our-astrologer-card {
            width: 297.087890625px !important;
            height: 375px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
      {error ? (
        <p className="mb-4 text-center font-mukta text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="relative w-full sm:px-0">
        {/* Mobile Navigation Arrows */}
        <div className="block sm:hidden">
          <button
            onClick={handlePrevious}
            aria-label="Previous astrologer"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-transparent transition-colors hover:bg-[#fff7f4]"
            style={{ border: '1.27px solid #611508' }}
          >
            <ArrowLeft className="w-[14px] h-[14px] text-[#611508]" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next astrologer"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-transparent transition-colors hover:bg-[#fff7f4]"
            style={{ border: '1.27px solid #611508' }}
          >
            <ArrowRight className="w-[14px] h-[14px] text-[#611508]" />
          </button>
        </div>

        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          centeredSlides={true}
          breakpoints={{
            640: {
              spaceBetween: 20,
              centeredSlides: false,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
              centeredSlides: false,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
              centeredSlides: false,
            },
          }}
          className="mySwiper talk-to-our-astrologer-swiper"
          onSwiper={swiper => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          aria-busy={isLoading}
        >
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SwiperSlide key={`skeleton-${index}`} className="!h-auto">
                  <AstrologerCardSkeleton />
                </SwiperSlide>
              ))
            : astrologers.map((astrologer, index) => (
                <SwiperSlide key={astrologer._id} className="!h-auto">
                  <AstrologerCard
                    astrologer={astrologer}
                    priorityImage={index === 0}
                    onChat={onChat}
                    onCall={onCall}
                    onSchedule={onSchedule}
                  />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex mt-6 justify-center pb-12 sm:mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          dotClassName="w-[4.784643650054932px] h-[4.784643650054932px] md:w-[10.363306999206543px] md:h-[10.363306999206543px]"
          dotGap="4.16px"
        />
      </div>

      {/* Mobile Pagination (Dots Only) */}
      <div className="flex sm:hidden mt-6 justify-center pb-12">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hideControls={true}
          dotClassName="w-[4.784643650054932px] h-[4.784643650054932px]"
          dotGap="4.16px"
        />
      </div>
    </div>
  );
};

export default TopAstrologers;
