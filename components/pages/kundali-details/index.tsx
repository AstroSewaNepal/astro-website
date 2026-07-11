import React from 'react';

import KundaliCard from './kundali-card';
import { SquareNumberChart, FreeKundaliChart } from '@/components/images';
import QNASComponent from '@/components/common/qnas-component';

const KundaliDetails: React.FC = () => {
  return (
    <section className="w-full px-0 pt-6 md:pt-12 pb-10">
      <header className="w-full">
        <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
          Kundali: Free Birth Chart and Kundali Matching
        </h1>
        <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
          Generate your free Janam Kundali or check Kundali matching for marriage compatibility.
          Complete Vedic analysis in minutes.
        </p>
      </header>

      <hr className="border-Trinary mt-4 md:mt-6 mb-6" />

      {/* ── What is Kundali ── */}
      <section className="pt-2 pb-6 md:py-6">
        <h2 className="font-sahitya font-bold text-[20px] leading-[38px] md:text-[28px] text-primary mb-3">
          What is Kundali?
        </h2>
        <p className="font-mukta font-normal text-[16px] leading-6 tracking-[0] md:text-[24px] md:leading-[34px] text-[#464646] text-justify py-4">
          A Kundali is a Vedic birth chart drawn for the exact moment of your birth. It maps the
          nine planets and your rising sign (Lagna) across twelve houses and twelve zodiac signs.
          From this chart, an astrologer can read your personality, predict life events, assess
          relationships, and map your Dasha timeline. The Dasha timeline is the sequence of
          planetary periods that governs different phases of your life. In Vedic tradition, the
          Kundali is a lifelong reference tool consulted for decisions about marriage, career,
          health, and spiritual direction.
        </p>
      </section>

      <section className="pt-1 md:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <KundaliCard
            title="Free Kundali"
            subtitle="Discover your detailed Janam Kundli instantly"
            description="Generate your complete Vedic birth chart instantly. Enter your name, birth date, time, and location to get your Lagna chart, planetary positions, Nakshatra, Dosha summary, and Dasha timeline. All free, no sign-in required."
            cta="Generate Free Kundali"
            href="/free-kundali"
            imageAlt="Kundali chart illustration"
            imageSrc={FreeKundaliChart}
            imageWidth={463}
            imageHeight={379}
            imageGap={12.64}
            imageOpacity={1}
            imageRotation={0}
            imageContainerClassName="gap-[10.36px] md:gap-[12.64px]"
            imageClassName="w-full max-w-[380.0007px] h-[310.869px] md:max-w-[463px] md:h-[379px]"
            descriptionWidth={673}
            descriptionHeight={204}
            descriptionOpacity={1}
            descriptionRotation={0}
          />

          <KundaliCard
            title="Free Kundali Matching"
            subtitle="Discover your match through Kundali."
            description="Compare birth charts of two people to check marriage compatibility. Get a detailed report with Guna Milan score out of 36, Dosha analysis, Lagna compatibility, and planetary alignment based on the Ashtakoot system."
            cta="Generate Free Kundali Matching"
            href="/kundali-matching"
            imageAlt="Kundali matching illustration"
            imageSrc={SquareNumberChart}
            imageWidth={630}
            imageHeight={319.3263854980469}
            imageGap={120.1}
            imageOpacity={1}
            imageRotation={0}
            imageContainerClassName="gap-[72.44px] md:gap-[120.1px]"
            imageClassName="w-full max-w-[380px] h-[192.6116px] md:max-w-[630px] md:h-[319.3264px]"
            descriptionWidth={673}
            descriptionHeight={238}
            descriptionGap={40}
            descriptionOpacity={1}
          />
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-0 border-t border-[#79787A] pt-12 mt-12">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
          <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
            Frequently Asked Questions
          </h2>
          <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
            Quick answers about Free Kundali and Kundali Matching.
          </p>
        </div>
        <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
          <QNASComponent
            question="When Should I Use Free Kundali vs Kundali Matching?"
            answer={`Use Free Kundali when you want to generate and explore your own birth chart. It gives you your planetary positions, Lagna, Nakshatra, Dasha timeline, and Dosha summary. Use Kundali Matching when you want to compare two birth charts for marriage compatibility. Kundali matching requires the birth details of both people and produces a compatibility report based on the Ashtakoot system, scoring out of 36.`}
            isDefaultOpen={true}
          />
        </div>
      </section>
    </section>
  );
};

export default KundaliDetails;
