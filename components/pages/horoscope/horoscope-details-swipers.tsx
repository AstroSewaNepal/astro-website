'use client';

import { Fragment, useCallback } from 'react';
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
export { HoroscopeDetailsZodiacNav } from './horoscope-details-zodiac-nav';
import { useSwiperScrollToIndex } from './horoscope-details-swiper-utils';

import 'swiper/css';
import 'swiper/css/free-mode';

type RangeTab = { type: VedastroHoroscopeRangeType; label: string };

type SectionPill = { id: 'general' | 'love' | 'career' | 'health'; label: string };


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
