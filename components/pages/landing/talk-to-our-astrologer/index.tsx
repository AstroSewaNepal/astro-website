'use client';
import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import { VerifiedIcon } from '@/components/images';
import Pagination from '@/components/common/pagination';
import ChatIcon from '@/components/icons/chat-icon';
import PhoneIcon from '@/components/icons/phone-icon';
import StartIcon from '@/components/icons/start-icon';
import { ASTROLOGER_LIST } from './astrologer-data.const';
import { ChevronLeftIcon } from '@/components/images/icons';
import CalendarIcon from '@/components/icons/calendar-icon';

import 'swiper/css';
import 'swiper/css/navigation';

interface TalkToOurAstrologerProps {
  title?: string;
  description?: string;
  className?: string;
}

const TalkToOurAstrologer: React.FC<TalkToOurAstrologerProps> = ({
  title = 'Talk To Our Top Astrologer',
  description = 'Connect with our most trusted and experienced astrologers for personalized guidance, accurate predictions, and compassionate support on your life’s journey.',
  className,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = ASTROLOGER_LIST.length;

  const handlePrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentPage(swiper.realIndex + 1);
  };

  const handlePageChange = (page: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(page - 1);
    }
    setCurrentPage(page);
  };

  return (
    <section
      className={clsx(
        'talk-to-our-astrologer-section container mx-auto max-w-full px-3 sm:px-5 lg:px-0',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6">
        <h2
          className="max-w-[20ch] px-1 text-center font-sahitya text-[26px] font-normal leading-[1.12] text-primary sm:max-w-none sm:text-[34px] sm:leading-tight md:text-[42px] lg:text-[52px] xl:text-[56px]"
          style={{
            fontFamily: 'Tiro Devanagari Sanskrit',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '56px',
            lineHeight: '47.83px',
            letterSpacing: '0%',
            textAlign: 'center',
          }}
        >
          {title}
        </h2>
        <p
          className="max-w-[810px] px-1 text-center font-mukta text-black/75"
          style={{
            fontFamily: 'Mukta',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '24px',
            lineHeight: '150%',
            letterSpacing: '2%',
            textAlign: 'center',
            textTransform: 'capitalize',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </p>
      </div>
      <div className="mt-8 sm:mt-10 md:mt-[50px]">
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
        >
          {ASTROLOGER_LIST.map(data => (
            <SwiperSlide key={`data-${data.id}`}>
              <div className="h-full overflow-hidden rounded-4xl border border-solid border-[#0000007D] shadow-[0_8px_32px_rgba(97,21,8,0.08)]">
                <div className="flex flex-col p-6 pt-11 sm:p-7 sm:pt-12">
                  <div className="flex flex-col items-center">
                    <div className="relative shrink-0">
                      <div className="relative h-[132px] w-[132px] overflow-hidden rounded-full ring-2 ring-[#e8dcc8] sm:h-[148px] sm:w-[148px] md:h-[156px] md:w-[156px]">
                        <Image
                          src={data.image}
                          alt={data.name}
                          fill
                          sizes="(max-width: 640px) 132px, (max-width: 768px) 148px, 156px"
                          className="object-cover"
                          priority={data.id === 1}
                        />
                      </div>
                      {data.isOnline ? (
                        <span
                          className="absolute right-0.5 top-0.5 z-[1] h-3.5 w-3.5 rounded-full border-[3px] border-[#fbf6ee] bg-[#34C759] sm:right-1 sm:top-1 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]"
                          aria-label="Online"
                        />
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col items-center text-center sm:mt-5">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        <p className="font-mukta text-[19px] font-semibold leading-tight text-[#5a6a8a] sm:text-[22px] md:text-[24px]">
                          {data.name}
                        </p>
                        <Image
                          src={VerifiedIcon}
                          alt=""
                          className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-0.5 sm:mt-2">
                        {Array(data.rating)
                          .fill(0)
                          .map((_, index) => (
                            <StartIcon
                              className="h-3.5 w-3.5 text-[#F59236] sm:h-4 sm:w-4"
                              key={`star-${index}`}
                            />
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center sm:mt-5">
                      <span className="font-mukta text-[13px] text-[#8a8583] line-through sm:text-sm md:text-base">
                        NPR {data.price.original}/min
                      </span>
                      <span className="font-mukta text-[26px] font-bold leading-none text-primary sm:text-[28px] md:text-[32px]">
                        {data.price.discounted}/min
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                    {data.feature.map(value => (
                      <div
                        className="flex min-h-[48px] items-center gap-1.5 rounded-3xl border border-solid border-[#79787A]/70 bg-white/40 px-2 py-2 sm:min-h-[52px] sm:gap-2 sm:px-2.5 sm:py-2.5 md:px-3"
                        key={value.title}
                      >
                        <Image
                          src={value.icon}
                          alt=""
                          className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                          width={24}
                          height={24}
                        />
                        <p className="min-w-0 font-mukta text-[10px] leading-snug text-[#5b5b5b] sm:text-[11px] md:text-sm">
                          {value.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white shadow-sm transition-opacity hover:opacity-90 sm:h-11 sm:w-11"
                      aria-label="Chat"
                    >
                      <ChatIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white shadow-sm transition-opacity hover:opacity-90 sm:h-11 sm:w-11"
                      aria-label="Call"
                    >
                      <PhoneIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex min-w-0 shrink-0 items-center gap-1 rounded-full border border-[#F8F3DF] px-3 py-2 transition-colors hover:bg-white/10 sm:gap-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3"
                  >
                    <CalendarIcon className="h-5 w-5 shrink-0 text-[#F8F3DF] sm:h-6 sm:w-6" />
                    <span className="font-mukta text-sm font-medium text-[#F8F3DF] sm:text-base md:text-lg">
                      Schedule
                    </span>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-6 flex justify-center sm:mt-8 pb-12">
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
    </section>
  );
};

export default TalkToOurAstrologer;
