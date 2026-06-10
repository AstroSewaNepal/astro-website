'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import Pagination from '@/components/common/pagination';
import { fetchTopAstrologers } from '@/lib/astrologer-api';

import AstrologerCard from './AstrologerCard';
import AstrologerCardSkeleton from './AstrologerCardSkeleton';
import type { Astrologer, AstrologerCardActions } from './types';

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
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load astrologers.',
        );
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
      {error ? (
        <p className="mb-4 text-center font-mukta text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Swiper
        slidesPerView={1}
        spaceBetween={16}
        breakpoints={{
          640: {
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
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
              <SwiperSlide key={`skeleton-${index}`}>
                <AstrologerCardSkeleton />
              </SwiperSlide>
            ))
          : astrologers.map((astrologer, index) => (
              <SwiperSlide key={astrologer._id}>
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

      <div className="mt-6 flex justify-center pb-12 sm:mt-8">
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
    </div>
  );
};

export default TopAstrologers;
