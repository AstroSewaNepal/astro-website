import React from 'react';
import Image from 'next/image';
import { FreeKundaliIllustration } from '@/components/images';
const FreeKundali: React.FC = () => {
  return (
    <section className="w-full px-8 lg:max-w-[1453px] lg:min-h-[398.327px] lg:gap-8 lg:rotate-0 lg:opacity-100 lg:mx-auto">
      <div className="w-full max-w-[462px] min-h-[86px] rotate-0 opacity-100 lg:w-full lg:max-w-[1453px] lg:h-[102px] lg:rotate-0 lg:opacity-100 flex flex-col gap-2 lg:gap-8 lg:pb-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-sahitya font-bold text-[22px] leading-[32px] md:text-[36px] md:leading-[48px] tracking-[0] text-primary">
            Free Kundali
          </h1>
          <p className="font-mukta font-normal text-[12px] leading-[20px] tracking-[0] capitalize md:text-lg lg:font-medium lg:text-[24px] lg:leading-[30px] lg:tracking-[0] text-[#141414]">
            Discover your detailed Janam Kundli instantly
          </p>
        </header>
        <hr className="w-full border-0 border-b-2 border-[#BE7B71] opacity-100" />
      </div>
      <div className="mt-4 md:mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <div className="lg:col-span-7 mt-0 space-y-4 md:space-y-5 font-mukta text-Paragraph text-left lg:w-full lg:max-w-[998.974px] lg:min-h-[272px] lg:rotate-0 lg:opacity-100">
          <p className="font-normal text-base leading-relaxed md:text-[24px] md:leading-[34px] md:tracking-[0]">
            <span className="text-primary md:whitespace-nowrap lg:text-[24px] lg:leading-[34px] lg:tracking-[0]">
              Ever wondered what the stars reveal about your future?
            </span>{' '}
            With Astro Sewa&apos;s free online Kundli, you can uncover insights about your
            personality, career, relationships, and life journey that you may have never noticed
            before. This ancient astrological method has guided people for centuries, helping them
            understand their true path and make wiser decisions.
          </p>
          <p className="hidden md:block font-normal md:text-[24px] md:leading-[34px] md:tracking-[0]">
            With just your date of birth, Astro Sewa Kundli shows how the exact time and place of
            your birth influence who you are today and the opportunities waiting for you tomorrow.
            Discover the blueprint of your destiny and see how the universe has uniquely designed
            your life.
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
