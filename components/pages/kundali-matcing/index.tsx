import React from 'react';
import KundaliMatchingFormSection from './kundali-matching-form-section';

const KundaliMatching: React.FC = () => {
  return (
    <section className="w-full px-0 lg:px-0">
      <h1 className="break-words text-[24px] leading-[30px] md:text-[36px] md:leading-[44px] font-sahitya font-bold text-[#7b1c1c] mb-1 tracking-wide">
        Kundali Matching: Free Marriage Compatibility Check
      </h1>
      <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[30px] font-medium font-mukta text-[#141414] mb-3 tracking-wide">
        Enter birth details for both partners to get a complete compatibility report with Guna Milan score, Dosha analysis, and Ashtakoot breakdown.
      </p>

      <hr className="border-t border-[#c0785a] mb-6" />

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
