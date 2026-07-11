import React from 'react';
import Image from 'next/image';

import { DarshanImage, SankalpaImage, MoolyaImage } from '@/components/images/about-us';

const AboutUsVision: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 py-[70px] lg:py-[80px]">
      <div className="flex flex-col items-center gap-[36px] lg:gap-[40px]">
        {/* Header section */}
        <div className="flex flex-col items-center gap-[24px] w-full max-w-[1405px]">
          <h2 className="w-full text-center text-[40px] md:text-[48px] lg:text-[56px] leading-[119%] text-[#691709] font-tiro-devanagari font-normal">
            Our Vision, Mission & Values
          </h2>
          <p className="w-full max-w-[883px] text-center text-[18px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[rgba(0,0,0,0.81)] font-mukta font-normal">
            The principles behind everything we do at AstroSewa.
          </p>
        </div>

        {/* Three cards section */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-[36px] w-full">
          {/* Vision Card */}
          <div className="w-full max-w-[460.16px] lg:w-[460.16px] lg:h-[671.97px] border-[1px] border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-6 md:p-8 lg:p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[162px] md:h-[160px] mb-[24px] mt-[10px] sm:mt-[14px] md:mt-[16px] flex items-center justify-center p-3 sm:p-4 md:p-5">
              <Image
                src={DarshanImage}
                alt="Vision Darshan"
                width={162}
                height={160}
                className="max-w-full h-auto object-contain"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full max-w-[420px] mx-auto">
              <h3 className="w-full text-center text-[28px] sm:text-[32px] md:text-[42px] lg:text-[54px] leading-[120%] text-[#323232] font-tiro-devanagari font-normal">
                Vision (Darshan)
              </h3>
              <p className="w-full text-center text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                A world where people use the wisdom of the stars to make better decisions,
                understand themselves more honestly, and live with greater intention. We want
                astrology to be a tool for real life.
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="w-full max-w-[460.16px] lg:w-[460.16px] lg:h-[671.97px] border-[1px] border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-6 md:p-8 lg:p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[159px] md:h-[157px] mb-[25px] mt-[10px] sm:mt-[14px] md:mt-[16px] flex items-center justify-center p-3 sm:p-4 md:p-5">
              <Image
                src={SankalpaImage}
                alt="Mission Sankalpa"
                width={159}
                height={157}
                className="max-w-full h-auto object-contain"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full max-w-[420px] mx-auto">
              <h3 className="w-full text-center text-[28px] sm:text-[32px] md:text-[42px] lg:text-[54px] leading-[119%] text-[#323232] font-tiro-devanagari font-normal">
                Mission (Sankalpa)
              </h3>
              <p className="w-full text-center text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                To make Vedic astrology genuinely accessible and genuinely useful. That means
                verified astrologers, accurate tools, and content written with care. We want every
                person who comes to AstroSewa to leave with something real.
              </p>
            </div>
          </div>

          {/* Values Card */}
          <div className="w-full max-w-[460.16px] lg:w-[460.16px] lg:h-[671.97px] border-[1px] border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-6 md:p-8 lg:p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[151px] md:h-[151px] mb-[24px] mt-[10px] sm:mt-[14px] md:mt-[16px] flex items-center justify-center p-3 sm:p-4 md:p-5">
              <Image
                src={MoolyaImage}
                alt="Values Moolya"
                width={151}
                height={151}
                className="max-w-full h-auto object-contain"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full max-w-[420px] mx-auto">
              <h3 className="w-full text-center text-[28px] sm:text-[32px] md:text-[42px] lg:text-[54px] leading-[119%] text-[#323232] font-tiro-devanagari font-normal">
                Values (Moolya)
              </h3>
              <p className="w-full text-center text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                Truth, compassion, and clarity. We do not over-promise. We do not treat astrology as
                entertainment. Every interaction, from a free Kundali to a live consultation, is
                built on genuine care for the person on the other side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsVision;
