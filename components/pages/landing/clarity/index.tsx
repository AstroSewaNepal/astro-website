import React from 'react';

import clsx from 'clsx';

import ClarityCSS from './clarity.module.css';
import Image from 'next/image';
import { AstrologyImage } from '@/components/images';
import ChevronRight from '@/components/icons/chevron-right';

const Clarity: React.FC = () => {
  return (
    <section
      className={clsx(
        'container mx-auto px-6 lg:px-0 pb-12 md:pb-16 lg:pb-[100px] border-b border-b-[#79787A]',
      )}
    >
      <div
        className={clsx(
          ClarityCSS.background,
          'px-6 md:px-12 lg:px-20 xl:px-28 py-6 md:py-8 lg:py-9 rounded-3xl md:rounded-[50px] lg:rounded-[74px] flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 md:gap-8 lg:gap-10',
        )}
      >
        <div className="flex-1 w-full lg:w-auto text-center lg:text-left">
          <h2 className="text-[34px] md:text-[48px] lg:text-[64px] xl:text-[80px] leading-[42px] md:leading-[56px] lg:leading-[80px] xl:leading-[122.57px] text-[#F8F3DF]">
            Find Clarity today
          </h2>
          <p className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-mukta text-[#FFFFFFCF] mt-2 md:mt-3 lg:mt-4">
            Discover insights through Vedic astrology.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
            <button className="flex items-center justify-center gap-1 border border-solid border-[#F8F3DF] rounded-3xl py-2.5 md:py-3 lg:py-3.5 px-6 md:px-7 lg:px-8 text-[#F8F3DF] w-full sm:w-auto transition-all duration-300 hover:bg-[#F8F3DF]/10">
              <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl">Chat Now</p>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>
            <button className="bg-[#F8F3DF] rounded-3xl px-6 md:px-7 lg:px-8 py-2.5 md:py-3 lg:py-3.5 text-black font-mukta text-base md:text-lg lg:text-xl xl:text-2xl w-full sm:w-auto transition-all duration-300 hover:bg-[#F8F3DF]/90">
              Download app
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
          <Image
            src={AstrologyImage}
            alt="astrology"
            className="max-w-[250px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[376px] w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Clarity;
