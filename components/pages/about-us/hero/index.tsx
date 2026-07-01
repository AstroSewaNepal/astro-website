import React from 'react';
import Image from 'next/image';

import { AboutUsHeroImage } from '@/components/images/about-us';

const AboutUsHero: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 pt-8 md:pt-10 lg:pt-12 pb-12 md:pb-16 lg:pb-20 border-b border-b-[#79787A]">
      <div className="flex flex-col items-center gap-10 md:gap-14 lg:gap-16">
        {/* Main content container */}
        <div className="flex flex-col items-center gap-[30px] md:gap-[40px] lg:gap-[50px] w-full max-w-[1283px]">
          {/* Astrological illustration placeholder */}
          <Image src={AboutUsHeroImage} alt="About Us Hero" width={368} />

          {/* Text content */}
          <div className="flex flex-col items-center gap-[10px] w-full">
            {/* "Who are we?" heading */}
            <h2 className="w-full text-center text-[40px] md:text-[60px] lg:text-[80px] leading-[125%] text-[#691709] font-tiro-devanagari font-normal">
              Who Is AstroSewa?
            </h2>

            {/* Description text */}
            <p className="w-full max-w-[1200px] text-center text-[16px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[rgba(0,0,0,0.81)] font-mukta font-normal px-0 md:px-1">
              AstroSewa is an online Vedic astrology platform that connects you with verified
              astrologers for consultations, Kundali readings, horoscopes, compatibility reports,
              and more. We combine the depth of classical Jyotish with tools that are simple enough
              for anyone to use.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsHero;
