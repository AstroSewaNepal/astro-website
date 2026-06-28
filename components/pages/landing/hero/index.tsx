'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { HeroSectionImage } from '@/components/images';
import ArrowRight from '@/components/icons/arrow-right';
import { openAppStore } from '@/lib/constants/app-store';

const LandingHero: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 pt-10 gap-10 border-b border-b-[#79787A] pb-[100px]">
      <div className="flex flex-col justify-center">
        <div className="space-x-2.5">
          <h1 className="text-[34px] md:text-[40px] lg:text-[80px] leading-[120%] text-primary font-normal">
            Astrology, <br />
            Made Personal.
          </h1>
          <p className="font-mukta text-base md:text-lg lg:text-2xl leading-[150%] text-black opacity-80 max-w-[580px]">
            Astro Sewa combines ancient Vedic wisdom with Modern insight, to help you transform
            uncertainty into Opportunity
          </p>
        </div>
        <div className="mt-11 flex flex-row items-center gap-2 md:gap-6">
          <Link
            href="/login"
            className="border border-solid border-moonlight-600 rounded-3xl px-3 md:px-8 py-2 md:py-3 flex items-center cursor-pointer justify-center gap-2 flex-1 md:flex-none whitespace-nowrap"
          >
            <p className="font-mukta text-base md:text-lg lg:text-2xl leading-7 text-moonlight-600 font-normal">
              Book Consultation
            </p>
            <ArrowRight />
          </Link>
          <button
            type="button"
            onClick={openAppStore}
            className="font-mukta text-base md:text-lg lg:text-2xl leading-7 text-white bg-primary rounded-3xl px-3 md:px-8 py-2 md:py-3 cursor-pointer justify-center gap-2 flex-1 md:flex-none whitespace-nowrap"
          >
            Download App
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center lg:items-end lg:justify-end w-full">
        <Image
          src={HeroSectionImage}
          alt="Astro Sewa — astrology made personal"
          width={516}
          height={516}
          priority
          className="w-full max-w-[420px] lg:max-w-[516px] h-auto object-contain object-bottom lg:object-right-bottom"
        />
      </div>
    </section>
  );
};

export default LandingHero;
