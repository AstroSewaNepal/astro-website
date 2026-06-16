import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-0 lg:px-0">
      <header className="max-w-4xl">
        <h1 className="font-mukta font-semibold text-[18px] leading-[28px] md:font-sahitya md:font-bold md:text-[36px] md:leading-[48px] text-primary opacity-100">
          Free Kundali Matching
        </h1>
        <p className="font-mukta font-normal text-[12px] leading-[20px] capitalize md:font-medium md:text-[24px] md:leading-[30px] text-[#141414] mt-2 md:mt-3">
          Discover your match through Kundali
        </p>
      </header>

      <section className="max-w-7xl mx-auto py-4 ml-4 md:ml-8 lg:ml-0">
        {/* <h2 className="font-sahitya font-bold text-[20px] md:text-[20px] lg:text-[30px] xl:text-[20px] leading-[1.15] text-primary mb-3">What is Kundali?</h2> */}
        <p className="font-mukta font-normal text-gray-500 text-[14px] leading-[24px] md:text-[18px] md:leading-[28px] py-4">
          Kundali matching is an ancient practice that analyzes the compatibility between two
          individuals based on their astrological birth charts. By examining the positions of
          planets and stars at the time of birth, our Kundali matching system provides insights into
          emotional connection, life goals, and long-term relationship potential. Whether
          you&apos;re exploring marriage compatibility or seeking deeper understanding of your
          connection with someone special, our comprehensive matching report evaluates essential
          factors like Guna Milan, Mangal Dosha, and planetary influences to guide you on your
          journey.
        </p>
      </section>

      <KundaliMatchingFormSection />
    </section>
  );
};

export default KundaliMatching;
