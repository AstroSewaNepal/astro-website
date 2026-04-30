import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-8">
      <header className="max-w-4xl">
        <h1 className="w-[209px] md:w-auto font-mukta font-semibold text-[18px] leading-[28px] md:font-sahitya md:font-bold md:text-[36px] md:leading-[48px] text-primary -mt-8 md:-mt-10 lg:-mt-25 opacity-100">
          Free Kundali Matching
        </h1>
        <p className="font-mukta font-normal text-[12px] leading-[20px] capitalize md:font-medium md:text-[24px] md:leading-[30px] text-[#141414] mt-2 md:mt-3">
          Discover your match through Kundali
        </p>
      </header>

      <section className="max-w-7xl mx-auto  py-4">
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
