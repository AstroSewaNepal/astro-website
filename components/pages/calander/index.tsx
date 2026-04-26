'use client';

import React from 'react';

import PanchangTimingStrip from './panchang-timing-strip';
import PanchangTodaySection from './panchang-today-section';

const CalanderPageContent: React.FC = () => {
  return (
    <div className="min-h-screen px-4 md:px-8 pt-2 pb-10 text-[#2a1f1a]">
      {/* Title */}
      <h1 className="text-[24px] leading-[30px] md:text-[36px] md:leading-[44px] font-sahitya font-bold text-[#7b1c1c] mb-1 tracking-wide">
        Panchangam
      </h1>

      {/* Subtitle */}
      <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[30px] font-medium font-mukta text-[#141414] mb-3 tracking-wide">
        Plan Your Day with Accurate Panchang
      </p>

      {/* Divider */}
      <hr className="border-t border-[#c0785a] mb-6" />

      {/* Section Heading */}
      <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
        What is Panchangam?
      </h2>

      {/* Body Text */}
      <p className="text-[16px] leading-6 md:text-[24px] md:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-8 md:mb-10 text-justify">
        Panchang (also called Panchagam) is a traditional Hindu calendar that provides important
        astrological and time-related details used for daily activities, rituals, and
        decision-making. It is based on the positions of the Sun, Moon, and planets and typically
        includes five key elements: Tithi (lunar day), Vara (day of the week), Nakshatra
        (constellation), Yoga (planetary alignment), and Karana (half of Tithi).
      </p>

      <PanchangTodaySection />

      <PanchangTimingStrip />
    </div>
  );
};

export default CalanderPageContent;
