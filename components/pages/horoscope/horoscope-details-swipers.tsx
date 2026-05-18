'use client';

import { Fragment, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import { ELanguage } from '@/components/enums/language.enum';
import { horoscopeDetailPageHref } from '@/lib/constants/horoscope-range-nav';
import { HOROSCOPE_SIGNS, type HoroscopeSign } from '@/lib/types/horoscope';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

import {
  capitalizeSign,
  SIGN_COLOR_IMAGE,
  SIGN_LIGHT_IMAGE,
} from './horoscope-details-sign-assets';

import 'swiper/css';
import 'swiper/css/free-mode';

type RangeTab = { type: VedastroHoroscopeRangeType; label: string };

type SectionPill = { id: 'general' | 'love' | 'career' | 'health'; label: string };

function useSwiperScrollToIndex(activeIndex: number) {
  const ref = useRef<SwiperType | null>(null);
  useEffect(() => {
    const s = ref.current;
    if (!s || activeIndex < 0) {
      return;
    }
    queueMicrotask(() => {
      s.slideTo(activeIndex, 0);
    });
  }, [activeIndex]);
  const onSwiper = useCallback(
    (s: SwiperType) => {
      ref.current = s;
      if (activeIndex >= 0) {
        queueMicrotask(() => s.slideTo(activeIndex, 0));
      }
    },
    [activeIndex],
  );
  return onSwiper;
}

/** Mobile: horizontal Swiper; md+: 6/12 column grid (unchanged layout). */
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
        className="group flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F8F3DF]"
      >
        <div
          className={clsx(
            'flex h-[52px] w-[52px] items-center justify-center rounded-full border p-1.5 transition-[border-color,box-shadow,background-color] duration-200',
            selected
              ? 'border-[#c9a063] bg-[#faf6f0] ring-2 ring-[#e8c47a]/35'
              : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#c9a88a] group-hover:bg-[#faf8f6] group-hover:shadow-sm',
          )}
        >
          <div className="relative h-full w-full">
            <Image
              src={SIGN_LIGHT_IMAGE[slug]}
              alt={capitalizeSign(slug)}
              className={clsx(
                'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                selected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
              )}
            />
            <Image
              src={SIGN_COLOR_IMAGE[slug]}
              alt={capitalizeSign(slug)}
              className={clsx(
                'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
            />
          </div>
        </div>
        <span
          className={clsx(
            'text-center font-tiro-devanagari text-[11px] font-normal leading-tight transition-colors duration-200 sm:text-[12px]',
            selected ? 'text-[#611508]' : 'text-[#9a6b5c] group-hover:text-[#691709]',
          )}
        >
          {capitalizeSign(slug)}
        </span>
      </Link>
    );
  };

  return (
    <div className="mt-6 min-w-0">
      <div className="horoscope-details-zodiac-mob -mx-1 min-w-0 md:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.85 }}
          slidesPerView="auto"
          spaceBetween={10}
          slidesOffsetBefore={4}
          slidesOffsetAfter={4}
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

      <div className="hidden gap-2 md:grid md:grid-cols-6 lg:grid-cols-12">
        {HOROSCOPE_SIGNS.map(slug => (
          <div key={slug} className="min-w-0">
            {signLink(slug)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mobile: horizontal Swiper; md+: flex wrap row. */
export function HoroscopeDetailsRangeTabs(props: {
  validSign: HoroscopeSign;
  rangeType: VedastroHoroscopeRangeType;
  uiLanguage: ELanguage;
  rangeTabs: RangeTab[];
}) {
  const { validSign, rangeType, uiLanguage, rangeTabs } = props;
  const activeIndex = rangeTabs.findIndex(t => t.type === rangeType);
  const onSwiperTabs = useSwiperScrollToIndex(activeIndex >= 0 ? activeIndex : 0);

  const tabLink = (tab: RangeTab) => (
    <Link
      href={horoscopeDetailPageHref(validSign, tab.type, uiLanguage)}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] px-5 py-3 font-mukta font-medium uppercase leading-7 tracking-wide',
        'text-[13px] sm:text-[15px] md:text-[18px] lg:text-[20px]',
        tab.type === rangeType
          ? 'bg-[#611508] text-[#f8f3df]'
          : 'bg-[#F8F3DF] text-[#611508] hover:bg-[#efe8d8]',
      )}
    >
      {tab.label}
    </Link>
  );

  return (
    <div className="mt-7 min-w-0 border-b border-[#e1d3c6] pb-4">
      <div className="horoscope-details-tabs-mob -mx-1 md:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.85 }}
          slidesPerView="auto"
          spaceBetween={10}
          slidesOffsetBefore={4}
          slidesOffsetAfter={4}
          className="!overflow-visible"
          onSwiper={onSwiperTabs}
        >
          {rangeTabs.map(tab => (
            <SwiperSlide key={tab.type} className="!w-auto">
              {tabLink(tab)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="hidden flex-wrap items-center gap-2.5 md:flex">
        {rangeTabs.map(tab => (
          <Fragment key={tab.type}>{tabLink(tab)}</Fragment>
        ))}
      </div>
    </div>
  );
}

/** Mobile: horizontal Swiper; md+: flex wrap. */
export function HoroscopeDetailsSectionPills(props: {
  sectionPills: SectionPill[];
  activeSection: SectionPill['id'];
  onSelect: (id: SectionPill['id']) => void;
}) {
  const { sectionPills, activeSection, onSelect } = props;
  const activeIndex = sectionPills.findIndex(p => p.id === activeSection);
  const onSwiperPills = useSwiperScrollToIndex(activeIndex >= 0 ? activeIndex : 0);

  const pillBtn = (pill: SectionPill) => (
    <button
      type="button"
      onClick={() => onSelect(pill.id)}
      className={clsx(
        'inline-flex shrink-0 rounded-full border-2 px-3 py-1.5 font-mukta text-[12px] font-medium uppercase tracking-wide sm:text-[14px]',
        activeSection === pill.id
          ? 'border-[#6f2618] bg-[#6f2618] text-[#F8F3DF]'
          : 'border-[#6f2618] bg-[#F8F3DF] text-[#6f2618] hover:bg-[#f2e1d0]',
      )}
    >
      {pill.label}
    </button>
  );

  return (
    <div className="mt-3 min-w-0">
      <div className="horoscope-details-pills-mob -mx-1 md:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.85 }}
          slidesPerView="auto"
          spaceBetween={8}
          slidesOffsetBefore={2}
          slidesOffsetAfter={8}
          className="!overflow-visible"
          onSwiper={onSwiperPills}
        >
          {sectionPills.map(pill => (
            <SwiperSlide key={pill.id} className="!w-auto">
              {pillBtn(pill)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="hidden flex-wrap gap-2 md:flex">
        {sectionPills.map(pill => (
          <Fragment key={pill.id}>{pillBtn(pill)}</Fragment>
        ))}
      </div>
    </div>
  );
}
