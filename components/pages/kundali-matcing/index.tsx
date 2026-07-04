import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-0 lg:px-0">
      <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
        Kundali Matching: Free Marriage Compatibility Check
      </h1>
      <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
        Enter birth details for both partners to get a complete compatibility report with Guna Milan score, Dosha analysis, and Ashtakoot breakdown.
      </p>

      <hr className="border-t border-[#c0785a] mt-4 md:mt-6 mb-6" />

      <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
        What is Kundali Matching?
      </h2>

      <p className="text-[16px] leading-6 md:text-[24px] md:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-8 md:mb-10 text-justify">
        Kundali matching, also called Kundali Milan or horoscope matching, is a Vedic method for assessing compatibility between two people before marriage. It compares both birth charts across eight compatibility categories, known as Ashtakoot, to produce a score out of 36. A score of 18 or above is generally considered sufficient for a compatible match. Higher scores indicate stronger alignment across more areas of life.
      </p>

      <KundaliMatchingFormSection />
    </section>
  );
};

export default KundaliMatching;
