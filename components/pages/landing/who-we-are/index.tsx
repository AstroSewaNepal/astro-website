import React from 'react';
import Image from 'next/image';

import clsx from 'clsx';

import WhoWeAreCSS from './who-we-are.module.css';
import { WhoWeAreImage } from '@/components/images';
import ChevronRight from '@/components/icons/chevron-right';

const WhoWeAre: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div
        className={clsx(
          WhoWeAreCSS.container,
          'py-6 md:py-8 lg:py-9 px-6 md:px-12 lg:px-20 xl:px-[108px] rounded-3xl md:rounded-[50px] lg:rounded-[74px] flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-10',
        )}
      >
        <div className="flex flex-col flex-1 w-full lg:w-auto text-center lg:text-left">
          <h2 className="text-[34px] md:text-[48px] lg:text-[64px] xl:text-[80px] 2xl:text-[110px] leading-[42px] md:leading-[56px] lg:leading-[80px] xl:leading-[96px] 2xl:leading-[120%] text-[#F8F3DF] font-normal">
            Who are we?
          </h2>
          <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-[32px] leading-6 md:leading-7 lg:leading-8 xl:leading-10 2xl:leading-[52px] text-[#FFFFFFCF] max-w-[700px] mt-2 md:mt-3 lg:mt-4">
            AstroSewa is Nepal&apos;s trusted online astrology platform, connecting people with over
            1000+ verified and experienced astrologers.{' '}
          </p>
          <button className="mt-4 md:mt-5 lg:mt-6 rounded-3xl bg-white max-w-full md:max-w-[279px] w-full md:w-auto py-2.5 md:py-3 lg:py-3.5 px-6 md:px-8 flex items-center justify-center gap-1 transition-all duration-300 hover:bg-gray-50">
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-primary font-normal">
              Learn More
            </p>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
          </button>
        </div>
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
          <Image
            src={WhoWeAreImage}
            alt="Who We Are"
            className="max-w-[250px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
