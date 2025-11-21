'use client';
import { ChevronLeftIcon } from '@/components/images/icons';
import Image from 'next/image';
import React, { useRef } from 'react';
import { Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import StartIcon from '@/components/icons/start-icon';
import { CUSTOMER_FEEDBACK_DATA } from './customer-feeback.const';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CustomerFeedback: React.FC = () => {
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
      <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
        <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] text-primary font-tiro-devanagari text-center">
          What Our Customers Say
        </h2>
        <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl text-[#000000CF] max-w-[753px] text-center px-4">
          Hear heartfelt stories from people who found clarity, confidence, and peace through our
          astrologers&apos; guidance.
        </p>
      </div>
      <div className="mt-8 md:mt-10 lg:mt-[50px]">
        <Swiper
          modules={[Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="mySwiper"
          onSwiper={swiper => {
            swiperRef.current = swiper;
          }}
          pagination={{
            el: '.swiper-pagination',
            clickable: true,
          }}
        >
          {CUSTOMER_FEEDBACK_DATA.map(data => (
            <SwiperSlide key={`${data.id}-customer-feedback`}>
              <div className="px-3 md:px-3.5 py-6 md:py-8 lg:py-[37px] border border-solid border-[#79787A] rounded-2xl md:rounded-3xl lg:rounded-4xl h-full">
                <div>
                  <p className="font-mukta text-base md:text-lg lg:text-[22px] leading-[22px] md:leading-[24px] lg:leading-[28px] text-primary font-bold">
                    &ldquo;{data.comment}&rdquo;
                  </p>
                  <p className="font-mukta text-sm md:text-base lg:text-lg text-[#5B5B5B] mt-2 md:mt-3 lg:mt-3.5">
                    {data.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-5 lg:mt-6">
                  <Image
                    src={data.image}
                    alt="Customer Feedback"
                    width={50}
                    height={50}
                    className="md:w-[56px] md:h-[56px] lg:w-[62px] lg:h-[62px] rounded-full"
                  />
                  <div className="flex flex-col">
                    <p className="font-mukta text-sm md:text-base lg:text-lg text-[#323232] font-bold">
                      {data.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 md:gap-1">
                        {Array(data.rating)
                          .fill(0)
                          .map((_, index) => (
                            <StartIcon
                              className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-[#F59236]"
                              key={`star-${index}`}
                            />
                          ))}
                      </div>
                      <p className="font-mukta text-xs md:text-sm text-[#5B5B5B]">
                        {data.rating}/5
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex items-center justify-center mt-6 md:mt-8">
          <div className="flex items-center gap-4 md:gap-5">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="aspect-square h-8 md:h-9 lg:h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Image src={ChevronLeftIcon} alt="Previous" className="w-2 md:w-2.5 text-[#5B5B5B]" />
            </button>

            {/* Pagination */}
            <div className="swiper-pagination flex items-center gap-[9px] max-w-[50px] w-full"></div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="aspect-square h-8 md:h-9 lg:h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Image
                src={ChevronLeftIcon}
                alt="Next"
                className="w-2 md:w-2.5 text-[#5B5B5B] rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedback;
