import React from 'react';

import clsx from 'clsx';

import ClarityCSS from './clarity.module.css';
import Image from 'next/image';
import { AstrologyImage } from '@/components/images';
import ChevronRight from '@/components/icons/chevron-right';

const Clarity: React.FC = () => {
  return (
    <section
      className={clsx('container mx-auto px-6 lg:px-0 pb-[100px] border-b border-b-[#79787A]')}
    >
      <div
        className={clsx(ClarityCSS.background, 'px-28 py-9 rounded-[74px] flex justify-between')}
      >
        <div>
          <h2 className="text-[80px] leading-[122.57px] text-[#F8F3DF]">Find Clarity today</h2>
          <p className="text-4xl font-mukta text-[#FFFFFFCF]">
            Discover insights through Vedic astrology.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <button className="flex items-center gap-1 border border-solid border-[#F8F3DF] rounded-3xl py-3.5 px-8 text-[#F8F3DF]">
              <p className="font-mukta text-2xl">Chat Now</p>
              <ChevronRight />
            </button>
            <button className="bg-[#F8F3DF] rounded-3xl px-8 py-3.5 text-black font-mukta text-2xl">
              Download app
            </button>
          </div>
        </div>
        <Image src={AstrologyImage} alt="astrology" className="max-w-[376px] w-full" />
      </div>
    </section>
  );
};

export default Clarity;
