import React from 'react';

import KundaliCard from './kundali-card';
import { AstrologyPrimaryColor, SquareNumberChart } from '@/components/images';

const KundaliDetails: React.FC = () => {
  return (
    <section className="w-full px-8 pt-0 md:pt-2 pb-10">
      <header className="max-w-4xl">
        <h1 className="font-sahitya font-bold text-[20px] leading-[100%] md:text-[36px] md:leading-[48px] text-primary mb-1">
          Kundali
        </h1>
        <p className="font-mukta font-medium text-[16px] leading-[30px] md:text-[24px] text-[#141414] mb-3">
          Get Your Detailed Birth Chart with Predictions
        </p>
      </header>

      <hr className="border-Trinary mb-6" />

      {/* ── What is Kundali ── */}
      <section className="pt-2 pb-6 md:py-6">
        <h2 className="font-sahitya font-bold text-[20px] leading-[38px] md:text-[28px] text-primary mb-3">
          What is Kundali?
        </h2>
        <p className="font-mukta font-normal text-[16px] leading-6 tracking-[0] md:text-[24px] md:leading-[34px] text-[#464646] text-justify py-4">
          Kundli, or Kundali, holds great importance in Nepali astrology (Vedic astrology). It is
          created using a person&apos;s date, time, and place of birth. Based on these details, the
          positions of the nine planets and the rising sign (Lagna) are calculated at the exact
          moment of birth. A visual chart is then drawn, showing the planets, the rising sign, and
          the twelve zodiac houses. With the help of this Kundali or birth chart, astrologers can
          study and predict different aspects and events of an individual&apos;s life. This makes
          Kundali an essential tool in astrology and for astrologers.
        </p>
      </section>

      <section className="pt-1 md:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <KundaliCard
            title="Free Kundali"
            subtitle="Discover your detailed Janam Kundli instantly"
            description="Astro Sewa is an astrology platform offering reliable tools and resources for both beginners and professional astrologers. On this Kundali page, users can generate their birth chart by entering their date, time, and place of birth. By clicking “Generate Kundali,” a detailed horoscope is created, including basic details, Lagna chart, planetary positions, and Dosha."
            cta="Generate Free Kundali"
            href="/free-kundali"
            imageAlt="Kundali chart illustration"
            imageSrc={AstrologyPrimaryColor}
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
            description="Astro Sewa is an astrology platform providing reliable tools and resources for both beginners and professional astrologers. On this Kundali Matching page, users can compare the birth charts of two individuals by entering their dates, times, and places of birth. By clicking “Check Compatibility,” a detailed matching report is generated, including Lagna compatibility, planetary positions, Doshas, and Basic details."
            cta="Generate Kundali Matching"
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
    </section>
  );
};

export default KundaliDetails;
