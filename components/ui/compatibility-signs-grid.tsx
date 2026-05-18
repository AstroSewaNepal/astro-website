'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

import type { HoroscopeSign } from '@/lib/types/horoscope';

import 'swiper/css';
import 'swiper/css/free-mode';

type SignImage = string | StaticImageData;

export type CompatibilitySignItem = {
  slug: HoroscopeSign;
  name: string;
  image: SignImage;
  href: string;
};

type Props = {
  title: string;
  currentSignLabel: string;
  currentSignImage: SignImage;
  items: CompatibilitySignItem[];
  variant?: 'compact' | 'figma';
  className?: string;
};

export function CompatibilitySignsGrid({
  title,
  currentSignLabel,
  currentSignImage,
  items,
  variant = 'compact',
  className,
}: Props) {
  if (items.length === 0) {
    return null;
  }

  const itemLink = (item: CompatibilitySignItem) => (
    <Link
      href={item.href}
      className={clsx(
        'transition-colors hover:border-[#f4a11a]/80',
        variant === 'figma'
          ? 'flex min-h-[160px] min-w-0 items-center justify-center gap-3 rounded-[20px] border border-[#383838] p-3 sm:min-h-[172px] sm:gap-4 sm:p-4'
          : 'rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] px-2 py-2',
      )}
    >
      {variant === 'figma' ? (
        <>
          <div className="flex h-full w-[88px] shrink-0 flex-col items-center gap-3 sm:w-[100px] sm:gap-4">
            <Image
              src={currentSignImage}
              alt={currentSignLabel}
              className="h-[80px] w-full max-w-[100px] object-contain sm:h-[96px]"
            />
            <span className="text-center font-mukta text-[15px] font-normal leading-snug text-[#611508] sm:text-[18px] sm:leading-7">
              {currentSignLabel}
            </span>
          </div>
          <span className="shrink-0 text-[36px] leading-none text-[#7b241f] sm:text-[44px]">
            ❤
          </span>
          <div className="flex h-full w-[96px] shrink-0 flex-col items-center gap-3 sm:w-[110px] sm:gap-4">
            <Image
              src={item.image}
              alt={item.name}
              className="h-[80px] w-full max-w-[110px] object-contain sm:h-[96px]"
            />
            <span className="text-center font-mukta text-[15px] font-normal leading-snug text-[#611508] sm:text-[18px] sm:leading-7">
              {item.name}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center gap-1">
            <Image
              src={currentSignImage}
              alt={currentSignLabel}
              className="h-[42px] w-[42px] object-contain"
            />
            <span className="text-[14px] text-[#ff1a78]">❤</span>
            <Image src={item.image} alt={item.name} className="h-[42px] w-[42px] object-contain" />
          </div>
          <div className="mt-1 flex items-center justify-between px-1">
            <span className="font-mukta text-[10px] text-[#846e5f]">{currentSignLabel}</span>
            <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
          </div>
        </>
      )}
    </Link>
  );

  return (
    <div className={clsx('min-w-0 max-w-full', className)}>
      <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618] text-center md:text-left">
        {title}
      </h3>

      {variant === 'figma' ? (
        <>
          <div className="horoscope-details-compat-mob -mx-1 mt-3 min-w-0 md:hidden">
            <Swiper
              modules={[FreeMode]}
              freeMode={{ enabled: true, momentumRatio: 0.85 }}
              slidesPerView={1.12}
              spaceBetween={12}
              centeredSlides
              slidesOffsetBefore={6}
              slidesOffsetAfter={6}
              breakpoints={{
                420: { slidesPerView: 1.22, spaceBetween: 14 },
                520: { slidesPerView: 1.35, spaceBetween: 14 },
              }}
              className="!overflow-visible pb-1"
            >
              {items.map(item => (
                <SwiperSlide key={item.slug} className="!h-auto min-w-0">
                  {itemLink(item)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-3 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
            {items.map(item => (
              <div key={item.slug} className="min-w-0">
                {itemLink(item)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(item => (
            <div key={item.slug} className="min-w-0">
              {itemLink(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
