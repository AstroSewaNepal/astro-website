import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-0 lg:px-0">
      <h1 className="break-words text-[24px] leading-[30px] md:text-[36px] md:leading-[44px] font-sahitya font-bold text-[#7b1c1c] mb-1 tracking-wide">
        Free Kundali Matching
      </h1>
      <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[30px] font-medium font-mukta text-[#141414] mb-3 tracking-wide">
        Discover your match through Kundali
      </p>

      <hr className="border-t border-[#c0785a] mb-6" />

      <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
        What is Kundali Matching?
      </h2>

      <p className="text-[16px] leading-6 md:text-[24px] md:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-8 md:mb-10 text-justify">
        Kundali matching is an ancient practice that analyzes the compatibility between two
        individuals based on their astrological birth charts. By examining the positions of
        planets and stars at the time of birth, our Kundali matching system provides insights into
        emotional connection, life goals, and long-term relationship potential. Whether
        you&apos;re exploring marriage compatibility or seeking deeper understanding of your
        connection with someone special, our comprehensive matching report evaluates essential
        factors like Guna Milan, Mangal Dosha, and planetary influences to guide you on your
        journey.
      </p>

      <KundaliMatchingFormSection />
    </section>
  );
};

export default KundaliMatching;
