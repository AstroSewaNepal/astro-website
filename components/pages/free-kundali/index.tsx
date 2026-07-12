import React from 'react';
import Image from 'next/image';
import { FreeKundaliIllustration } from '@/components/images';
const FreeKundali: React.FC = () => {
  return (
    <section className="w-full px-0 lg:min-h-[398.327px] lg:rotate-0 lg:opacity-100">
      <div className="w-full max-w-full sm:max-w-[462px] rotate-0 opacity-100 lg:w-full lg:max-w-[1453px] lg:rotate-0 lg:opacity-100 flex flex-col gap-2 lg:gap-8 lg:pb-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
            Free Kundali: Generate Your Janam Kundali Online
          </h1>
          <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
            Enter your birth date, time, and place to generate your complete Vedic birth chart
            instantly and free.
          </p>
        </header>
        <hr className="w-full border-0 border-b-2 border-[#BE7B71] opacity-100 mt-4 md:mt-6" />
      </div>
      <div className="mt-4 md:mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <div className="lg:col-span-7 mt-0 space-y-4 md:space-y-5 font-mukta text-Paragraph text-left lg:w-full lg:max-w-full lg:min-h-[272px] lg:rotate-0 lg:opacity-100">
          <p className="font-normal text-base leading-relaxed md:text-[24px] md:leading-[34px] md:tracking-[0]">
            <span className="text-primary md:whitespace-nowrap lg:text-[24px] lg:leading-[34px] lg:tracking-[0]">
              Your Kundali is a map of the sky at the exact moment you were born.
            </span>{' '}
            It shows where every planet was positioned and what those positions mean for your
            personality, relationships, career, health, and the timing of major life events.
            AstroSewa generates your complete Vedic Kundali for free. All you need is your birth
            date, time, and place.
          </p>
          <p className="hidden md:block font-normal md:text-[24px] md:leading-[34px] md:tracking-[0]">
            A Kundali is not a prediction set in stone. It is a starting point for
            self-understanding. Many people find that reading their birth chart helps them make
            sense of patterns they have always felt but never been able to name. It can help you
            approach important decisions with more clarity and confidence.
          </p>
        </div>
        <div className="lg:col-span-5 hidden md:flex justify-center lg:justify-end">
          <Image
            src={FreeKundaliIllustration}
            alt="Vedic astrologer preparing a Janam Kundli chart"
            className="w-full max-w-[320px] md:max-w-[380px] lg:w-[422.026px] lg:h-[398.327px] lg:max-w-none lg:rotate-0 lg:opacity-100 drop-shadow-sm"
            sizes="(max-width: 1024px) 90vw, 422px"
          />
        </div>
      </div>
    </section>
  );
};

export default FreeKundali;
