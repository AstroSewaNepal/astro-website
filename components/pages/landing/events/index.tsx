'use client';
import Image from 'next/image';
import React, { useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';

import EventsCSS from './events.module.css';
import { EMonthShort } from '@/components/enums/month-short.enum';
import { EventsList, PANCHANG_DETAILS } from './events-list.const';

const EventsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<EMonthShort | null>(
    moment().format('MMM') as EMonthShort,
  );

  return (
    <section className="container mx-auto px-6 lg:px-0 pt-[100px] flex flex-col lg:flex-row gap-10">
      <div className="w-full lg:w-3/5">
        <div className="bg-[#691709] text-[#F8F3DF] px-10 py-2 rounded-lg flex items-center justify-between">
          <h2 className="font-mukta text-4xl leading-12">Festival Calendar</h2>
          <p className="font-mukta text-[64px] leading-[76px] font-bold">2025</p>
        </div>
        <div className="mt-10 flex gap-3.5 items-center">
          {Object.values(EMonthShort).map(month => (
            <button
              key={month}
              className={clsx(
                'bg-[#F8F3DF] px-2.5 py-0.5 text-[#691709] rounded-lg mb-2 cursor-pointer',
                selectedMonth === month && 'bg-turmeric-500 text-[#323232]',
              )}
              onClick={() => setSelectedMonth(month)}
            >
              <p className="font-mukta text-lg leading-7">{month}</p>
            </button>
          ))}
        </div>
        <div className="mt-2.5 space-y-4">
          {EventsList.map(event => (
            <div className="bg-[#FFFCEF] flex items-center gap-7 p-6 rounded-3xl" key={event.id}>
              <Image src={event.image} alt={event.title} className="w-2/3" />
              <div>
                <p className="font-sahitya text-[32px] font-bold text-[#323232]">{event.title}</p>
                <p className="font-mukta text-lg text-[#F59236]">
                  {event.date} | {event.year} | {event.day}
                </p>
                <p className={clsx('font-mukta text-base mt-3', EventsCSS['line-clamp'])}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-2/5">
        <div className={clsx(EventsCSS['total-panchang-background'], 'py-[26px] rounded-lg')}>
          <h2 className="font-mukta text-4xl font-bold text-[#F8F3DF] text-center">
            Today’s Panchang
          </h2>
        </div>
        <div className="mt-2 flex items-center justify-between font-mukta font-medium text-[22px] leading-[32px] text-[#323232]">
          <p>B.S : 2081/04/08</p>
          <p>Aug 24, 2025</p>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {PANCHANG_DETAILS.map((details, index) => (
            <div
              className={clsx(
                'bg-[#FFD7001A] py-5 font-mukta text-[22px] leading-[32px] text-center text-[#323232] rounded-lg',
                index % 2 === 0 ? 'font-bold' : 'font-normal',
              )}
              key={details}
            >
              {details}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsPage;
