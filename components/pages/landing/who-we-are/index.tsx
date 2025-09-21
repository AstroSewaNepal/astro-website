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
        className={clsx(WhoWeAreCSS.container, 'py-9 px-[108px] rounded-[74px] flex items-center')}
      >
        <div className="flex flex-col">
          <h2 className="text-[110px] leading-[120%] text-[#F8F3DF] font-normal">Who are we?</h2>
          <p className="font-mukta text-[32px] leading-[52px] text-[#FFFFFFCF] max-w-[700px]">
            AstroSewa is Nepal’s trusted online astrology platform, connecting people with over
            1000+ verified and experienced astrologers.{' '}
          </p>
          <button className="mt-6 rounded-3xl bg-white max-w-[279px] w-full py-3.5 flex items-center justify-center gap-1">
            <p className="font-mukta text-2xl leading-7 text-primary font-normal">Learn More</p>
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        </div>
        <div>
          <Image src={WhoWeAreImage} alt="Who We Are" className="max-w-[400px] w-full" />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
