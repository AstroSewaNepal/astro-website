import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-8 lg:max-w-[1453px] lg:mx-auto">
      <div className="w-full flex flex-col gap-2 lg:gap-8 lg:pb-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-sahitya font-bold text-[22px] leading-[32px] md:text-[36px] md:leading-[48px] tracking-[0] text-primary">
            Free Kundali Matching
          </h1>
          <p className="font-mukta font-normal text-[12px] leading-[20px] tracking-[0] capitalize md:text-lg lg:font-medium lg:text-[24px] lg:leading-[30px] lg:tracking-[0] text-[#141414]">
            Discover your match through Kundali
          </p>
        </header>
        <hr className="w-full border-0 border-b-2 border-[#BE7B71] opacity-100" />
      </div>

      <section className="max-w-7xl mx-auto mt-4 md:mt-6 lg:mt-8">
        {/* <h2 className="font-sahitya font-bold text-[20px] md:text-[20px] lg:text-[30px] xl:text-[20px] leading-[1.15] text-primary mb-3">What is Kundali?</h2> */}
        <p className="font-mukta font-normal text-gray-500 text-[14px] leading-[24px] md:text-[18px] md:leading-[28px] text-justify py-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
      </section>

      <KundaliMatchingFormSection />
    </section>
  );
};

export default KundaliMatching;
