import React from 'react';
import Image from 'next/image';

import { AboutUsHeroImage } from '@/components/images/about-us';

const AboutUsHero: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0 pb-[100px] border-b border-b-[#79787A]">
      <div className="flex flex-col items-center gap-[60px] md:gap-[80px] lg:gap-[100px]">
        {/* Main content container */}
        <div className="flex flex-col items-center gap-[30px] md:gap-[40px] lg:gap-[50px] w-full max-w-[1283px]">
          {/* Astrological illustration placeholder */}
          <Image src={AboutUsHeroImage} alt="About Us Hero" width={368} />

          {/* Text content */}
          <div className="flex flex-col items-end gap-[10px] w-full">
            {/* "We are we?" heading */}
            <h2 className="w-full text-center text-[40px] md:text-[60px] lg:text-[80px] leading-[125%] text-[#691709] font-tiro-devanagari font-normal">
              We are we?
            </h2>

            {/* Description text */}
            <p className="w-full max-w-[1200px] text-center text-[16px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[rgba(0,0,0,0.81)] font-mukta font-normal px-4">
              AstroSewa is Nepal&apos;s most trusted online astrology platform, connecting people
              with over 1000+ verified and experienced astrologers from across the country and
              beyond. We believe astrology is far more than just predictions it is a powerful tool
              for self-discovery, reflection, and personal growth. Our platform is built to make
              authentic Vedic astrology accessible to everyone, no matter where they are or what
              questions they carry in their hearts.
              <br />
              <br />
              Whether you&apos;re navigating uncertainty in love, seeking clarity in your career, or
              standing at a major life crossroads, our expert astrologers are here to guide you with
              compassion and accuracy. Each consultation blends ancient Vedic wisdom with modern
              approaches, offering you not just answers, but deep insights that empower confident
              and meaningful decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsHero;
