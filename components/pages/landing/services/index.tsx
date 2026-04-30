'use client';
import Image from 'next/image';
import React, { useState, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import { SERVICES_LIST } from './service.const';
import Pagination from '@/components/common/pagination';

import 'swiper/css';

const Services = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  // Calculate pagination based on current slidesPerView
  const totalPages = useMemo(() => {
    if (slidesPerView >= SERVICES_LIST.length) return 1;
    return Math.ceil(SERVICES_LIST.length / slidesPerView);
  }, [slidesPerView]);

  const currentPage = useMemo(() => {
    if (slidesPerView >= SERVICES_LIST.length) return 1;
    return Math.floor(activeIndex / slidesPerView) + 1;
  }, [activeIndex, slidesPerView]);

  const handlePageChange = (page: number) => {
    if (swiperRef.current) {
      const targetIndex = (page - 1) * slidesPerView;
      swiperRef.current.slideTo(Math.min(targetIndex, SERVICES_LIST.length - slidesPerView));
    }
  };

  const handlePrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const updateSlidesPerView = (swiper: SwiperType) => {
    // Get current slidesPerView - use params.slidesPerView or calculate from actual slides
    let currentSlidesPerView =
      typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;

    // If using breakpoints, calculate based on window width
    if (typeof swiper.params.slidesPerView !== 'number' && typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1024) {
        currentSlidesPerView = 4;
      } else if (width >= 768) {
        currentSlidesPerView = 2;
      } else {
        currentSlidesPerView = 1;
      }
    }

    setSlidesPerView(currentSlidesPerView);
  };

  return (
    <section>
      <div className="max-w-[1180px] mx-auto px-4 sm:px-5 flex flex-col items-center gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 max-w-[1405px] w-full">
          <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[34px] md:leading-[40px] lg:leading-[47.83px] text-primary font-tiro-devanagari text-center">
            Our Services
          </h2>
          <p className="font-mukta text-sm md:text-base lg:text-lg text-[#000000CF] max-w-[753px] text-center px-4">
            Explore our range of trusted astrology services, designed to bring clarity, guidance,
            and confidence to every step of your journey.
          </p>
        </div>

        {/* Services Grid with Swiper */}
        <div className="relative w-full">
          <Swiper
            spaceBetween={32}
            slidesPerView={1}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 32,
              },
            }}
            onSwiper={swiper => {
              swiperRef.current = swiper;
              updateSlidesPerView(swiper);
            }}
            onSlideChange={swiper => {
              setActiveIndex(swiper.activeIndex);
              updateSlidesPerView(swiper);
            }}
            onResize={swiper => {
              updateSlidesPerView(swiper);
            }}
            className="w-full"
          >
            {SERVICES_LIST.map(service => (
              <SwiperSlide key={service.id}>
                <div className="flex flex-col items-center gap-5 w-full min-h-[390px] flex-shrink-0 p-3 sm:p-4 select-none">
                  <div className="flex justify-center items-center w-[150px] h-[180px] sm:w-[170px] sm:h-[200px] lg:w-[189px] lg:h-[222px]">
                    <div className="w-full h-full flex justify-center items-center rounded-lg">
                      <Image
                        src={service.icon}
                        alt={`${service.buttonText} icon`}
                        width={189}
                        height={222}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full flex-1 justify-between">
                    <h3 className="font-mukta text-[15px] md:text-base lg:text-[18px] leading-[1.3] text-[#000000CF] text-center max-w-[260px]">
                      {service.title}
                    </h3>
                    <button className="flex justify-center items-center gap-2.5 px-4 md:px-[18px] py-2 w-full max-w-[280px] bg-[#691709] border-none rounded-[32px] cursor-pointer transition-all duration-300 hover:bg-[#8b1f0f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(105,23,9,0.3)] active:translate-y-0">
                      <span className="font-mukta font-bold text-sm md:text-[15px] lg:text-base leading-[1.4] text-center text-[#f8f3df]">
                        {service.buttonText}
                      </span>
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </section>
  );
};

export default Services;
