'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import { ENGLISH_ZODIAC_COLOR } from '@/lib/zodiac-sign/english-zodiac';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import { zodiacListingCopy } from '@/lib/zodiac-sign/listing-copy';
import { ELanguage } from '@/components/enums/language.enum';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = {
  language?: ELanguage;
};

export function ZodiacCarousel({ language = ELanguage.ENGLISH }: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [, setActiveIndex] = useState(0);
  const copy = zodiacListingCopy[language];

  const handleSlideChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.activeIndex);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-center gap-4">
        {/* Left Arrow */}
        <button
          className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#5b5b5b] text-[#5b5b5b] hover:bg-[#f5f5f5] transition-colors"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous zodiac sign"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Swiper Container */}
        <div className="w-full max-w-[640px]">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination]}
            slidesPerView={2}
            spaceBetween={20}
            onSlideChange={handleSlideChange}
            pagination={{
              enabled: true,
              clickable: true,
              dynamicBullets: false,
            }}
            className="zodiac-carousel"
          >
            {HOROSCOPE_SIGNS.map(sign => (
              <SwiperSlide key={sign}>
                <Link
                  href={`/zodiac-sign/${sign}`}
                  className="group flex h-[220px] flex-col items-center justify-center rounded-[16px] border border-[#5b5b5b] px-3 py-4 transition-colors hover:bg-[#f8f0e4]"
                >
                  <article className="flex w-full flex-col items-center gap-3">
                    {/* Zodiac Icon */}
                    <div className="relative h-[60px] w-[70px] flex-shrink-0">
                      <Image
                        src={ENGLISH_ZODIAC_COLOR[sign]}
                        alt={sign}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Zodiac Name with Stars */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mukta text-lg font-bold capitalize text-[#691709]">
                          {sign}
                        </h3>
                        <div className="flex items-center gap-1 text-[#ef8a20]">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <StartIcon key={`${sign}-star-${index}`} className="h-4 w-4" />
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-center font-mukta text-xs font-light leading-relaxed text-[#5b5b5b] max-w-[120px]">
                        {copy.cardBlurb}
                      </p>
                    </div>

                    {/* Read More Link */}
                    <div className="flex flex-col items-center gap-1 border-t border-[#5b5b5b] pt-2">
                      <button className="flex items-center gap-1 font-mukta text-sm font-semibold text-[#691709] hover:text-[#7b3b27] transition-colors">
                        {copy.readMore}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Right Arrow */}
        <button
          className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#5b5b5b] text-[#5b5b5b] hover:bg-[#f5f5f5] transition-colors"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next zodiac sign"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <style jsx>{`
        .zodiac-carousel :global(.swiper-pagination) {
          position: static;
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .zodiac-carousel :global(.swiper-pagination-bullet) {
          background-color: #d0d0d0;
          opacity: 1;
          width: 8px;
          height: 8px;
          margin: 0;
        }

        .zodiac-carousel :global(.swiper-pagination-bullet-active) {
          background-color: #5b5b5b;
        }
      `}</style>
    </div>
  );
}
