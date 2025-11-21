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
    <section className="container mx-auto px-6 lg:px-0 flex flex-col lg:flex-row gap-6 lg:gap-10">
      <div className="w-full lg:w-3/5">
        <div className="bg-[#691709] text-[#F8F3DF] px-4 md:px-6 lg:px-10 py-2 md:py-2.5 rounded-lg flex items-center justify-between">
          <h2 className="font-mukta text-xl md:text-2xl lg:text-4xl leading-tight md:leading-8 lg:leading-12">
            Festival Calendar
          </h2>
          <p className="font-mukta text-3xl md:text-4xl lg:text-[64px] leading-tight md:leading-[48px] lg:leading-[76px] font-bold">
            2025
          </p>
        </div>
        <div className="mt-6 md:mt-8 lg:mt-10 flex flex-wrap gap-2 md:gap-3.5 items-center overflow-x-auto pb-2 scrollbar-hide">
          {Object.values(EMonthShort).map(month => (
            <button
              key={month}
              className={clsx(
                'bg-[#F8F3DF] px-2 md:px-2.5 py-1 md:py-0.5 text-[#691709] rounded-lg mb-2 cursor-pointer flex-shrink-0 transition-all duration-300',
                selectedMonth === month && 'bg-turmeric-500 text-[#323232]',
              )}
              onClick={() => setSelectedMonth(month)}
            >
              <p className="font-mukta text-sm md:text-base lg:text-lg leading-6 md:leading-7 whitespace-nowrap">
                {month}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-2.5 md:mt-4 space-y-3 md:space-y-4">
          {EventsList.map(event => (
            <div
              className="bg-[#FFFCEF] flex flex-col md:flex-row items-center gap-4 md:gap-5 lg:gap-7 p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl"
              key={event.id}
            >
              <div className="w-full md:w-2/5 lg:w-2/3 flex-shrink-0">
                <Image
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 w-full md:w-auto">
                <p className="font-sahitya text-xl md:text-2xl lg:text-[32px] font-bold text-[#323232]">
                  {event.title}
                </p>
                <p className="font-mukta text-sm md:text-base lg:text-lg text-[#F59236] mt-1 md:mt-2">
                  {event.date} | {event.year} | {event.day}
                </p>
                <p
                  className={clsx(
                    'font-mukta text-sm md:text-base mt-2 md:mt-3',
                    EventsCSS['line-clamp'],
                  )}
                >
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-2/5 mt-8 lg:mt-0">
        <div
          className={clsx(
            EventsCSS['total-panchang-background'],
            'py-4 md:py-5 lg:py-[26px] px-4 md:px-6 rounded-lg',
          )}
        >
          <h2 className="font-mukta text-2xl md:text-3xl lg:text-4xl font-bold text-[#F8F3DF] text-center">
            Today&apos;s Panchang
          </h2>
        </div>
        <div className="mt-2 md:mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between font-mukta font-medium text-base md:text-lg lg:text-[22px] leading-6 md:leading-7 lg:leading-[32px] text-[#323232] gap-2">
          <p>B.S : 2081/04/08</p>
          <p>Aug 24, 2025</p>
        </div>
        <div className="mt-2.5 md:mt-3 grid grid-cols-2 gap-2 md:gap-2.5">
          {PANCHANG_DETAILS.map((details, index) => (
            <div
              className={clsx(
                'bg-[#FFD7001A] py-3 md:py-4 lg:py-5 font-mukta text-sm md:text-base lg:text-[22px] leading-5 md:leading-6 lg:leading-[32px] text-center text-[#323232] rounded-lg',
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
