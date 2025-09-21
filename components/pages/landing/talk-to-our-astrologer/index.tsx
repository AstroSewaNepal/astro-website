'use client';
import React, { useRef } from 'react';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import { VerifiedIcon } from '@/components/images';
import ChatIcon from '@/components/icons/chat-icon';
import PhoneIcon from '@/components/icons/phone-icon';
import StartIcon from '@/components/icons/start-icon';
import { ASTROLOGER_LIST } from './astrologer-data.const';
import { ChevronLeftIcon } from '@/components/images/icons';
import CalendarIcon from '@/components/icons/calendar-icon';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const TalkToOurAstrologer: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

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

  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-[56px] leading-[47.83px] text-primary">Talk To Our Top Astrologer</h2>
        <p className="font-mukta text-2xl text-[#000000CF] max-w-[810px] text-center">
          Connect with our most trusted and experienced astrologers for personalized guidance,
          accurate predictions, and compassionate support on your life’s journey.
        </p>
      </div>
      <div className="mt-[50px]">
        <Swiper
          modules={[Pagination]}
          slidesPerView={3}
          spaceBetween={30}
          className="mySwiper"
          onSwiper={swiper => {
            swiperRef.current = swiper;
          }}
          pagination={{
            el: '.swiper-pagination',
            clickable: true,
          }}
        >
          {ASTROLOGER_LIST.map(data => (
            <SwiperSlide key={`data-${data.id}`}>
              <div className="rounded-4xl border border-solid border-[#0000007D]">
                <div className="p-7 pt-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-center relative">
                      <Image src={data.image} alt="Astrologer" className="max-w-[217px] w-full" />
                      <div className="absolute w-9 h-9 rounded-full bg-[#34C759] border-4 border-solid border-[#F6EFDB] right-4 top-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mukta text-[32px] text-[#181A2A] font-medium">
                          {data.name}
                        </p>
                        <Image src={VerifiedIcon} alt="Verified" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {Array(data.rating)
                          .fill(0)
                          .map((_, index) => (
                            <StartIcon className="w-4 h-4 text-[#F59236]" key={`star-${index}`} />
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <p className="font-mukta text-2xl text-[#949395] line-through">
                        NPR {data.price.original}/min
                      </p>
                      <p className="text-primary font-mukta text-4xl font-bold">
                        NPR {data.price.discounted}/min
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-1.5">
                    {data.feature.map(value => (
                      <div
                        className="flex items-center gap-1 border border-solid border-[#79787A] rounded-3xl px-2 py-3"
                        key={value.title}
                      >
                        <Image src={value.icon} alt={value.title} className="w-6 h-6" />
                        <p className="font-mukta text-sm text-[#5B5B5B]">{value.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-4xl bg-primary px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button className="rounded-full bg-[#F8F3DF] border border-solid border-[#F8F3DF] p-2">
                      <ChatIcon />
                    </button>
                    <button className="rounded-full bg-[#F8F3DF] border border-solid border-[#F8F3DF] p-2">
                      <PhoneIcon />
                    </button>
                  </div>
                  <button className="flex gap-1 items-center px-4 py-2 rounded-4xl border border-solid border-[#F8F3DF]">
                    <CalendarIcon />
                    <p className="font-mukta text-lg text-[#F8F3DF]">Schedule</p>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center gap-5 ">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="aspect-square h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Image src={ChevronLeftIcon} alt="Previous" className="w-2 text-[#5B5B5B]" />
            </button>

            {/* Pagination */}
            <div className="swiper-pagination flex items-center gap-[9px]"></div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="aspect-square h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Image src={ChevronLeftIcon} alt="Next" className="w-2 text-[#5B5B5B] rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalkToOurAstrologer;
