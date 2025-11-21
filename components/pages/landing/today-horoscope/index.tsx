'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';

import clsx from 'clsx';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';

import ArrowRight from '@/components/icons/arrow-right';
// import StartIcon from '@/components/icons/start-icon';
import Pagination from '@/components/common/pagination';
import {
  EnglishAriesLight,
  EnglishTaurusLight,
  EnglishGeminiLight,
  EnglishCancerLight,
  EnglishLeoLight,
  EnglishVirgoLight,
  EnglishLibraLight,
  EnglishScorpioLight,
  EnglishSagittariusLight,
  EnglishCapricornLight,
  EnglishAquariusLight,
  EnglishPiscesLight,
} from '@/components/images/zodiac/english';
import { ELanguage } from '@/components/enums/language.enum';

interface HoroscopeApiResponse {
  _id: string;
  sign: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HoroscopeItem {
  name: string;
  detail: string;
  image: string | typeof EnglishAriesLight;
  sign: string;
  content: string;
}

// Map zodiac sign names to images
const getZodiacImage = (sign: string) => {
  const signMap: Record<string, typeof EnglishAriesLight> = {
    aries: EnglishAriesLight,
    taurus: EnglishTaurusLight,
    gemini: EnglishGeminiLight,
    cancer: EnglishCancerLight,
    leo: EnglishLeoLight,
    virgo: EnglishVirgoLight,
    libra: EnglishLibraLight,
    scorpio: EnglishScorpioLight,
    sagittarius: EnglishSagittariusLight,
    capricorn: EnglishCapricornLight,
    aquarius: EnglishAquariusLight,
    pisces: EnglishPiscesLight,
  };
  return signMap[sign.toLowerCase()] || EnglishAriesLight;
};

// Capitalize first letter of sign name
const capitalizeSign = (sign: string) => {
  return sign.charAt(0).toUpperCase() + sign.slice(1);
};

// Get short description from content (first sentence or first 60 chars)
const getShortDescription = (content: string) => {
  const firstSentence = content.split('.')[0];
  if (firstSentence.length <= 60) return firstSentence;
  return content.substring(0, 60) + '...';
};

const TodayHoroscope: React.FC = () => {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slidesPerView = 2; // Fixed at 2 for mobile

  // Fetch horoscope data from API
  useEffect(() => {
    const fetchHoroscope = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://54.225.40.197/api/v1/astrology/horoscope');
        if (!response.ok) {
          throw new Error('Failed to fetch horoscope data');
        }
        const result = await response.json();

        if (result.success && result.data) {
          const transformedData: HoroscopeItem[] = result.data
            .filter((item: HoroscopeApiResponse) => item.isActive)
            .map((item: HoroscopeApiResponse) => ({
              name: capitalizeSign(item.sign),
              detail: getShortDescription(item.content),
              image: getZodiacImage(item.sign),
              sign: item.sign,
              content: item.content,
            }));
          setHoroscopeData(transformedData);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Error fetching horoscope:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch horoscope data');
        setHoroscopeData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoroscope();
  }, []);

  // Calculate pagination based on current slidesPerView
  const totalPages = useMemo(() => {
    const dataLength = horoscopeData.length;
    if (slidesPerView >= dataLength) return 1;
    return Math.ceil(dataLength / slidesPerView);
  }, [slidesPerView, horoscopeData.length]);

  const currentPage = useMemo(() => {
    const dataLength = horoscopeData.length;
    if (slidesPerView >= dataLength) return 1;
    return Math.floor(activeIndex / slidesPerView) + 1;
  }, [activeIndex, slidesPerView, horoscopeData.length]);

  const handlePageChange = (page: number) => {
    if (swiperRef.current) {
      const targetIndex = (page - 1) * slidesPerView;
      const dataLength = horoscopeData.length;
      const maxIndex = Math.max(0, dataLength - slidesPerView);
      swiperRef.current.slideTo(Math.min(targetIndex, maxIndex));
    }
  };

  const handlePrevious = () => {
    if (swiperRef.current && swiperRef.current.activeIndex > 0) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      const dataLength = horoscopeData.length;
      const maxIndex = Math.max(0, dataLength - slidesPerView);
      if (swiperRef.current.activeIndex < maxIndex) {
        swiperRef.current.slideNext();
      }
    }
  };

  // Reset activeIndex and swiper position when language changes
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [language]);

  // Don't render if loading or no data
  if (isLoading) {
    return (
      <section className="container mx-auto px-6 lg:px-0">
        <div className="flex w-full items-center justify-center flex-col">
          <h2 className="text-[56px] leading-[47.83px] font-normal text-primary text-center">
            Today&apos;s Astrology Horoscope
          </h2>
          <div className="mt-12">
            <p className="font-mukta text-xl text-primary">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || horoscopeData.length === 0) {
    return (
      <section className="container mx-auto px-6 lg:px-0">
        <div className="flex w-full items-center justify-center flex-col">
          <h2 className="text-[56px] leading-[47.83px] font-normal text-primary text-center">
            Today&apos;s Astrology Horoscope
          </h2>
          <div className="mt-12">
            <p className="font-mukta text-xl text-primary">
              {error || 'No horoscope data available'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex w-full items-center justify-center flex-col">
        <h2 className="text-4xl md:text-[40px] lg:text-[56px] leading-[47.83px] font-bold text-primary text-center">
          Today&apos;s Astrology Horoscope
        </h2>
        <div className="mt-12 flex gap-5">
          <button
            className={clsx(
              'border border-solid border-primary rounded-3xl px-[35px] py-2.5 text-primary font-mukta text-xl leading-7 font-normal cursor-pointer transition-all duration-300 ease-in-out',
              language === ELanguage.ENGLISH && 'bg-primary text-white',
            )}
            onClick={() => setLanguage(ELanguage.ENGLISH)}
          >
            English
          </button>
          <button
            className={clsx(
              'border border-solid border-primary rounded-3xl px-[35px] py-2.5 text-primary font-mukta text-xl leading-7 font-normal cursor-pointer transition-all duration-300 ease-in-out',
              language === ELanguage.NEPALI && 'bg-primary text-white',
            )}
            disabled={true}
          >
            Nepali (Coming Soon)
          </button>
        </div>
      </div>
      {/* Mobile Swiper - shows 2 slides at a time */}
      <div className="mt-[50px] md:hidden">
        <Swiper
          spaceBetween={32}
          slidesPerView={2}
          className="w-full"
          allowTouchMove={true}
          onSwiper={swiper => {
            swiperRef.current = swiper;
            setActiveIndex(swiper.activeIndex);
          }}
          onSlideChange={swiper => {
            setActiveIndex(swiper.activeIndex);
          }}
        >
          {horoscopeData.map(item => (
            <SwiperSlide key={item.sign}>
              <div className="border border-solid border-moonlight-600 px-3.5 py-3 rounded-[33px] flex gap-5 flex-col items-center h-full">
                <div className="w-[100px] h-[100px] flex items-center justify-center flex-shrink-0">
                  <Image src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mukta text-[22px] leading-[32px] text-primary font-bold">
                      {item.name}
                    </p>
                    {/* Stars section commented out as API doesn't provide stars */}
                    {/* <div className="flex items-center">
                      {Array(item.numberOfStars)
                        .fill(0)
                        .map((_, starIdx) => (
                          <StartIcon key={`${item.name}-star-${starIdx}`} />
                        ))}
                    </div> */}
                  </div>
                  <p className="font-mukta text-sm leading-[120%] font-light text-[#5b5b5b]">
                    {item.detail}
                  </p>
                  <button className="flex items-center border-b border-primary gap-[5px] cursor-pointer mt-2 text-[#F8F3DF]">
                    <p className="font-mukta text-sm leading-7 font-semibold text-primary">
                      Read More
                    </p>
                    <ArrowRight />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* Desktop Grid - shows all items */}
      <div className="mt-[50px] hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
        {horoscopeData.map(item => (
          <div
            className="border border-solid border-moonlight-600 px-3.5 py-3 rounded-[33px] flex gap-5 items-center"
            key={item.sign}
          >
            <div className="w-[100px] h-[100px] flex items-center justify-center">
              <Image src={item.image} alt={item.name} />
            </div>
            <div className="">
              <div className="flex items-center gap-2">
                <p className="font-mukta text-[22px] leading-[32px] text-primary font-bold">
                  {item.name}
                </p>
                {/* Stars section commented out as API doesn't provide stars */}
                {/* <div className="flex items-center">
                  {Array(item.numberOfStars)
                    .fill(0)
                    .map((_, starIdx) => (
                      <StartIcon key={`${item.name}-star-${starIdx}`} />
                    ))}
                </div> */}
              </div>
              <p className="font-mukta text-sm leading-[120%] font-light text-[#5b5b5b]">
                {item.detail}
              </p>
              <button className="flex items-center border-b border-primary gap-[5px] cursor-pointer mt-2 text-[#F8F3DF]">
                <p className="font-mukta text-sm leading-7 font-semibold text-primary">Read More</p>
                <ArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodayHoroscope;
