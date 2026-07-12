import React from 'react';
import Image from 'next/image';

import { MandalaImage } from '@/components/images/about-us';
import { CheckImageIcon } from '@/components/images/icons';

type Props = {
  compact?: boolean;
};

const AboutUsWhatWeDo: React.FC<Props> = ({ compact = false }) => {
  const services = [
    'Live astrology chat and call consultations',
    'Free Kundali and birth chart generation',
    'Kundali matching for marriage compatibility',
    'Daily, weekly, and monthly horoscopes',
    'Astrology calculators: Rashi, Dasha, Mangal Dosha, Sun Sign, Love, Numerology, Moon Phase',
    'Puja Bidhi guides for Hindu rituals',
    'Astrology blog written by our verified astrologers',
  ];

  const sectionPadding = compact ? 'w-full py-4 md:py-6 lg:py-8 xl:py-8' : 'w-full py-8 md:py-12 lg:py-16 xl:py-24';

  return (
    <section className={sectionPadding}>
      <div className="container mx-auto px-6 lg:px-0">
        {/* Mandala Banner with Text Overlay */}
        <div className="relative w-full max-w-[1455px] h-auto min-h-[720px] md:h-[760px] lg:h-[999px] mx-auto rounded-3xl md:rounded-[50px] lg:rounded-[74px] overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(53,11,4,1)] to-[rgba(105,23,9,1)]"></div>

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-10 xl:p-[114px] py-8 md:py-10 lg:py-12 xl:py-0">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-8 lg:gap-12 xl:gap-[109px] w-full max-w-[1228px]">
              {/* Left Text Content */}
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 xl:gap-[54px] w-full flex-1">
                {/* Main Text Section */}
                <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 xl:gap-[24px] w-full">
                  <h2 className="w-full text-left text-[26px] md:text-[36px] lg:text-[48px] xl:text-[56px] leading-[32px] md:leading-[44px] lg:leading-[56px] xl:leading-[65px] tracking-[0%] text-[#F8F3DF] font-tiro-devanagari font-normal">
                    What We Offer
                  </h2>
                  <p className="w-full text-left text-sm md:text-base lg:text-lg xl:text-[24px] leading-[150%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                    AstroSewa brings together everything you need for a complete astrology
                    experience in one place. You can generate your free Kundali, book a live
                    astrologer consultation, check Kundali matching, read your daily horoscope, use
                    our astrology calculators, browse Puja Bidhi guides, and read our blog. All in
                    one place.
                  </p>
                </div>

                {/* Services Section */}
                <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-[33px] w-full lg:w-[449px]">
                  <h3 className="w-full text-left text-[26px] md:text-[36px] lg:text-[48px] xl:text-[56px] leading-[32px] md:leading-[44px] lg:leading-[56px] xl:leading-[65px] tracking-[0%] text-[#F8F3DF] font-tiro-devanagari font-normal">
                    Our
                    <br />
                    Services Include:
                  </h3>

                  {/* Services List */}
                  <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 xl:gap-[16px] w-full">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-[8px] w-full"
                      >
                        <Image
                          src={CheckImageIcon}
                          alt="Check"
                          width={16}
                          height={16}
                          className="w-4 h-4 md:w-5 md:h-5 lg:w-[19px] lg:h-[19px] flex-shrink-0"
                        />
                        <span className="whitespace-nowrap text-sm md:text-base lg:text-lg xl:text-[24px] leading-[117%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Mandala Image (positioned on the right) */}
              <div className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end">
                <div className="relative w-[154px] h-[154px] mx-auto lg:w-auto lg:h-auto lg:max-w-[500px]">
                  <Image
                    src={MandalaImage}
                    alt="Sacred Mandala"
                    width={619}
                    height={619}
                    className="w-[154px] h-[154px] opacity-100 lg:w-full lg:max-w-[450px] lg:h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsWhatWeDo;
