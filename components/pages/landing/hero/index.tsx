import React from 'react';
import Image from 'next/image';

import { HeroSectionImage } from '@/components/images';
import ArrowRight from '@/components/icons/arrow-right';

const LandingHero: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 grid grid-cols-2 pt-10 border-b border-b-[#79787A] pb-[100px]">
      <div className="flex flex-col justify-center">
        <div className="space-x-2.5">
          <h1 className="text-[80px] leading-[120%] text-primary font-normal">
            Astrology, <br />
            Made Personal.
          </h1>
          <p className="font-mukta text-2xl leadning-[150%] text-black opacity-80 max-w-[580px]">
            Astro Sewa combines ancient Vedic wisdom with Modern insight, to help you transform
            uncertainty into Opportunity
          </p>
        </div>
        <div className="mt-11 flex items-center gap-6 min-w-max">
          <button className="border border-solid border-moonlight-600 rounded-3xl px-8 py-3 flex items-center cursor-pointer">
            <p className="font-mukta text-2xl leading-7 text-moonlight-600 font-normal">
              Book Consultation
            </p>
            <ArrowRight />
          </button>
          <button className="font-mukta text-2xl leading-7 text-white bg-primary rounded-3xl px-8 py-3 cursor-pointer">
            Download App
          </button>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <Image src={HeroSectionImage} alt="Hero Section Image" width={516} height={515.39} />
      </div>
    </section>
  );
};

export default LandingHero;
