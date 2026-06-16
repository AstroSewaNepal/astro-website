'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

import { ELanguage } from '@/components/enums/language.enum';
import { horoscopeDetailPageHref } from '@/lib/constants/horoscope-range-nav';
import { HOROSCOPE_SIGNS, type HoroscopeSign } from '@/lib/types/horoscope';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

import {
  capitalizeSign,
  SIGN_COLOR_IMAGE,
  SIGN_LIGHT_IMAGE,
} from './horoscope-details-sign-assets';
import { useSwiperScrollToIndex } from './horoscope-details-swiper-utils';

export function HoroscopeDetailsZodiacNav(props: {
  validSign: HoroscopeSign;
  rangeType: VedastroHoroscopeRangeType;
  uiLanguage: ELanguage;
}) {
  const { validSign, rangeType, uiLanguage } = props;
  const activeIndex = HOROSCOPE_SIGNS.indexOf(validSign);
  const onSwiperZodiac = useSwiperScrollToIndex(activeIndex >= 0 ? activeIndex : 0);

  const signLink = (slug: HoroscopeSign) => {
    const selected = slug === validSign;
    return (
      <Link
        href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
        className="group flex w-[100px] shrink-0 flex-col items-center gap-[10px] rounded-[60px] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F8F3DF]"
      >
        <div
          className={clsx(
            'flex h-[98.305px] w-[100px] items-center justify-center rounded-[60px] border-[3px] border-solid p-[4px] opacity-100 transition-[border-color,box-shadow,background-color,transform] duration-200 transform rotate-0',
            selected
              ? 'border-[#611508] bg-[#faf6f0]'
              : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#611508] group-hover:bg-[#faf2f2] group-hover:shadow-sm',
          )}
        >
          <div className="relative h-[72px] w-[72px] sm:h-[80px] sm:w-[80px]">
            <Image
              src={SIGN_LIGHT_IMAGE[slug]}
              alt={capitalizeSign(slug)}
              fill
              className={clsx(
                'object-contain transition-opacity duration-200',
                selected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
              )}
            />
            <Image
              src={SIGN_COLOR_IMAGE[slug]}
              alt={capitalizeSign(slug)}
              fill
              className={clsx(
                'object-contain transition-opacity duration-200',
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span
            className={clsx(
              'text-center transition-colors duration-200',
              selected
                ? 'font-mukta font-medium text-[20px] leading-[100%] tracking-[0%] text-[#611508]'
                : 'font-tiro-devanagari text-[11px] font-normal leading-tight text-[#9a6b5c] group-hover:text-[#691709] sm:text-[12px]',
            )}
          >
            {capitalizeSign(slug)}
          </span>
          {selected ? <span className="h-[8px] w-[8px] rounded-full bg-[#611508]" /> : null}
        </div>
      </Link>
    );
  };

  return (
    <div className="mt-6 min-w-0">
      <div className="horoscope-details-zodiac-mob -mx-1 min-w-0 overflow-x-auto md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.85 }}
          slidesPerView="auto"
          spaceBetween={10}
          slidesOffsetBefore={4}
          slidesOffsetAfter={50}
          className="!overflow-visible pb-1"
          onSwiper={onSwiperZodiac}
        >
          {HOROSCOPE_SIGNS.map(slug => (
            <SwiperSlide key={slug} className="!w-auto">
              {signLink(slug)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden gap-[10px] md:grid md:grid-cols-6 lg:grid-cols-12">
        {HOROSCOPE_SIGNS.map(slug => (
          <div key={slug} className="min-w-0">
            {signLink(slug)}
          </div>
        ))}
      </div>
    </div>
  );
}
