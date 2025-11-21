import React from 'react';
import Image from 'next/image';

import { MandalaImage } from '@/components/images/about-us';
import { CheckImageIcon } from '@/components/images/icons';

const AboutUsWhatWeDo: React.FC = () => {
  const services = [
    'Instant astrology chat & calls',
    'Kundli analysis & matchmaking',
    'Daily, weekly & monthly horoscopes',
    'Remedies and gemstone suggestions',
    'Career, relationship, and health guidance',
    'Vedic, Tarot, Numerology & more',
  ];

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 xl:py-[100px]">
      <div className="container mx-auto px-6 lg:px-0">
        {/* Mandala Banner with Text Overlay */}
        <div className="relative w-full h-auto min-h-[750px] md:h-[950px] lg:h-[999px] mx-auto rounded-3xl md:rounded-[50px] lg:rounded-[74px] overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(53,11,4,1)] to-[rgba(105,23,9,1)]"></div>

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-10 xl:p-[114px] py-8 md:py-10 lg:py-12 xl:py-0">
            <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12 xl:gap-[109px] w-full max-w-[1228px]">
              {/* Left Text Content */}
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 xl:gap-[54px] w-full flex-1">
                {/* Main Text Section */}
                <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 xl:gap-[24px] w-full">
                  <h2 className="w-full text-left text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] leading-[85%] text-[#F8F3DF] font-tiro-devanagari font-normal">
                    What we do ?
                  </h2>
                  <p className="w-full text-left text-sm md:text-base lg:text-lg xl:text-[24px] leading-[150%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                    At AstroSewa, we connect you with trusted astrologers to provide personalized
                    guidance and accurate predictions based on your birth chart and planetary
                    positions. Whether you&apos;re facing confusion in love, career, health, or
                    finances we help you gain clarity through chat, call, or live sessions with
                    expert astrologers.
                  </p>
                </div>

                {/* Services Section */}
                <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-[33px] w-full lg:w-[449px]">
                  <h3 className="w-full text-left text-[28px] md:text-[36px] lg:text-[48px] xl:text-[56px] leading-[107%] text-[#F8F3DF] font-tiro-devanagari font-normal">
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
                        <span className="text-sm md:text-base lg:text-lg xl:text-[24px] leading-[117%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Mandala Image (positioned on the right) */}
              <div className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end">
                <div className="relative w-full lg:w-auto max-w-[500px]">
                  <Image
                    src={MandalaImage}
                    alt="Sacred Mandala"
                    width={619}
                    height={619}
                    className="w-full max-w-[250px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[619px] h-auto"
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
