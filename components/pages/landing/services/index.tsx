'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import { openAppStore } from '@/lib/constants/app-store';
import { SERVICES_LIST } from './service.const';
import Pagination from '@/components/common/pagination';

import 'swiper/css';

const Services = () => {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleServiceAction = (action: (typeof SERVICES_LIST)[number]['action']) => {
    if (action.type === 'app-store') {
      openAppStore();
      return;
    }
    const targetPath = action.href.split('?')[0];
    if (action.scrollTopOnSamePath && pathname === targetPath) {
      window.scrollTo(0, 0);
      return;
    }
    router.push(action.href);
  };

  return (
    <section id="services">
      <div className="max-w-[1450px] mx-auto px-5 flex flex-col items-center gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 max-w-[1405px] w-full">
          <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[34px] md:leading-[40px] lg:leading-[47.83px] text-primary font-tiro-devanagari text-center">
            Our Services
          </h2>
          <p className="font-mukta text-base md:text-lg lg:text-2xl text-[#000000CF] max-w-[753px] text-center px-4">
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
                <div className="flex flex-col items-center gap-2 md:gap-6 w-full md:min-h-[450px] flex-shrink-0 p-5 select-none">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center justify-center gap-14 md:gap-0 w-full">
                      <div className="md:hidden w-[40.72px]" />
                      <div className="flex justify-center items-center w-[123.49827575683594px] h-[144.8117218017578px] md:w-[189px] md:h-[222px]">
                        <div className="w-full h-full flex justify-center items-center rounded-lg">
                          <Image
                            src={service.icon}
                            alt={`${service.buttonText} icon`}
                            width={123.49827575683594}
                            height={144.8117218017578}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="md:hidden w-[40.72px]" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full flex-1 md:justify-between">
                    <div className="min-h-[84px] md:min-h-[96px] flex items-center justify-center">
                      <h3
                        className="font-mukta font-normal text-[14px] md:text-lg lg:text-[20px] leading-[150%] md:leading-[120%] tracking-[0.02em] text-[#000000CF] text-center capitalize overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {service.title}
                      </h3>
                    </div>
                    {service.action.type === 'link' && !service.action.scrollTopOnSamePath ? (
                      <Link
                        href={service.action.href}
                        className="flex justify-center items-center bg-[#691709] border-none rounded-[32px] cursor-pointer transition-all duration-300 hover:bg-[#8b1f0f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(105,23,9,0.3)] active:translate-y-0 w-[278px] min-h-[40px] gap-[10px] px-[18px] py-[4px] md:w-full md:h-auto md:gap-2.5 md:px-4 md:py-2"
                      >
                        <span className="font-mukta font-bold text-sm md:text-base lg:text-lg leading-[1.78] text-center text-[#f8f3df]">
                          {service.buttonText}
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleServiceAction(service.action)}
                        className="flex justify-center items-center bg-[#691709] border-none rounded-[32px] cursor-pointer transition-all duration-300 hover:bg-[#8b1f0f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(105,23,9,0.3)] active:translate-y-0 w-[278px] min-h-[40px] gap-[10px] px-[18px] py-[4px] md:w-full md:h-auto md:gap-2.5 md:px-4 md:py-2"
                      >
                        <span className="font-mukta font-bold text-sm md:text-base lg:text-lg leading-[1.78] text-center text-[#f8f3df] whitespace-nowrap">
                          {service.buttonText}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Fixed overlay arrows for mobile */}
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Previous service"
            className="md:hidden absolute left-0 top-[30%] w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center border border-[#611508] bg-transparent text-[#611508] hover:bg-[#fff7f4] transition-colors z-10"
          >
            <ArrowLeft className="w-[12px] h-[12px]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next service"
            className="md:hidden absolute right-0 top-[30%] w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center border border-[#611508] bg-transparent text-[#611508] hover:bg-[#fff7f4] transition-colors z-10"
          >
            <ArrowRight className="w-[12px] h-[12px]" />
          </button>

          {/* Fixed pagination dots for mobile */}
          <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-[4.16px] z-10">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to page ${index + 1}`}
                onClick={() => handlePageChange(index + 1)}
                className={`rounded-full transition-colors shadow-sm ${
                  currentPage === index + 1 ? 'bg-[#611508]' : 'bg-[#d9bdb7] hover:opacity-80'
                }`}
                style={{
                  width: '4.784643650054932px',
                  height: '4.784643650054932px',
                  minWidth: '4.784643650054932px',
                  minHeight: '4.784643650054932px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="hidden md:block">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
            dotClassName="w-[10.363306999206543px] h-[10.363306999206543px]"
            dotGap="3px"
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
