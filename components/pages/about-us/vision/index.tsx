import React from 'react';
import Image from 'next/image';

import { DarshanImage, SankalpaImage, MoolyaImage } from '@/components/images/about-us';

const AboutUsVision: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 py-[100px]">
      <div className="flex flex-col items-center gap-[50px]">
        {/* Header section */}
        <div className="flex flex-col items-center gap-[24px] w-full max-w-[1405px]">
          <h2 className="w-full text-center text-[40px] md:text-[48px] lg:text-[56px] leading-[119%] text-[#691709] font-tiro-devanagari font-normal">
            Our Vision, Mission & Values
          </h2>
          <p className="w-full max-w-[883px] text-center text-[18px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[rgba(0,0,0,0.81)] font-mukta font-normal uppercase">
            The guiding principles that shape everything we do bringing clarity, compassion, and
            authenticity to every astrology experience.
          </p>
        </div>

        {/* Three cards section */}
        <div className="flex flex-col lg:flex-row items-center gap-[36px] w-full">
          {/* Vision Card */}
          <div className="w-full max-w-[460px] h-[672px] border border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[162px] h-[160px] mb-[24px] flex items-center justify-center">
              <Image src={DarshanImage} alt="Vision Darshan" width={162} height={160} />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full">
              <h3 className="w-full text-center text-[32px] md:text-[42px] lg:text-[54px] leading-[120%] text-[#323232] font-tiro-devanagari font-normal">
                Vision (Darshan)
              </h3>
              <p className="w-full text-center text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                AstroSewa envisions a world where every individual can align their life with cosmic
                rhythm (Rituchakra), guided by the light of Vedic astrology.
                <br />
                <br />
                We dream of a society where decisions about career, marriage, health, and family are
                taken with clarity, devotion, and astrological wisdom bridging ancient scriptures
                and modern technology.
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="w-full max-w-[460px] h-[672px] border border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[159px] h-[157px] mb-[25px] flex items-center justify-center">
              <Image src={SankalpaImage} alt="Mission Sankalpa" width={159} height={157} />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full">
              <h3 className="w-full text-center text-[32px] md:text-[42px] lg:text-[54px] leading-[119%] text-[#323232] font-tiro-devanagari font-normal">
                Mission (Sankalpa)
              </h3>
              <p className="w-full text-center text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                Our mission is to bring the spiritual strength of Jyotish Shastra into the hands of
                every seeker through a simple and accessible mobile platform.
                <br />
                <br />
                We offer personalized Kundali charts, Dasha analysis, 36 Guna Milan, remedies, and
                live consultations all delivered with cultural respect, compassion, and trust rooted
                in Sanatana Dharma.
              </p>
            </div>
          </div>

          {/* Values Card */}
          <div className="w-full max-w-[460px] h-[672px] border border-[#323232] rounded-[50px] flex flex-col items-center justify-center p-[37px] relative">
            {/* Image placeholder */}
            <div className="w-[151px] h-[151px] mb-[24px] flex items-center justify-center">
              <Image src={MoolyaImage} alt="Values Moolya" width={151} height={151} />
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-[8px] w-full">
              <h3 className="w-full text-center text-[32px] md:text-[42px] lg:text-[54px] leading-[119%] text-[#323232] font-tiro-devanagari font-normal">
                Values (Moolya)
              </h3>
              <p className="w-full text-center text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] tracking-[2%] text-[#323232] font-mukta font-normal">
                We are guided by Satya (Truth), Karuna (Compassion), and Bodh (Clarity) offering
                astrology rooted in Vedic wisdom, delivered with honesty, empathy, and simplicity.
                <br />
                <br />
                Through Samāvesh (Inclusivity) and Vridhi (Growth), we welcome every seeker with
                openness and support their spiritual journey with karmic insights, remedies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsVision;
