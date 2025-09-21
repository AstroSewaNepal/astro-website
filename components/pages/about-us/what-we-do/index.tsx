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
    <section className="w-full py-[100px]">
      <div className="container mx-auto px-6 lg:px-0">
        {/* Mandala Banner with Text Overlay */}
        <div className="relative w-full max-w-[1455px] h-[600px] md:h-[800px] lg:h-[999px] mx-auto rounded-[74px] overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(53,11,4,1)] to-[rgba(105,23,9,1)]"></div>

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-[114px]">
            <div className="flex flex-col lg:flex-row items-center gap-[54px] lg:gap-[109px] w-full max-w-[1228px]">
              {/* Left Text Content */}
              <div className="flex flex-col gap-[54px] w-full">
                {/* Main Text Section */}
                <div className="flex flex-col gap-[24px] w-full">
                  <h2 className="w-full text-left text-[40px] md:text-[48px] lg:text-[56px] leading-[85%] text-[#F8F3DF] font-tiro-devanagari font-normal">
                    What we do ?
                  </h2>
                  <p className="w-full text-left text-[18px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                    At AstroSewa, we connect you with trusted astrologers to provide personalized
                    guidance and accurate predictions based on your birth chart and planetary
                    positions. Whether you&apos;re facing confusion in love, career, health, or
                    finances we help you gain clarity through chat, call, or live sessions with
                    expert astrologers.
                  </p>
                </div>

                {/* Services Section */}
                <div className="flex flex-col gap-[33px] w-full lg:w-[449px]">
                  <h3 className="w-full text-left text-[40px] md:text-[48px] lg:text-[56px] leading-[107%] text-[#F8F3DF] font-tiro-devanagari font-normal">
                    Our
                    <br />
                    Services Include:
                  </h3>

                  {/* Services List */}
                  <div className="flex flex-col gap-[16px] w-full">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center gap-[8px] w-full">
                        <Image src={CheckImageIcon} alt="Check" width={19} height={19} />
                        <span className="text-[18px] md:text-[20px] lg:text-[24px] leading-[117%] tracking-[2%] text-[#F8F3DF] font-mukta font-normal">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Mandala Image (positioned on the right) */}
              <div className=" w-full">
                <div className="relative w-full h-full">
                  <Image src={MandalaImage} alt="Sacred Mandala" width={619} height={619} />
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
