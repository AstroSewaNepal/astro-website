import React from 'react';
import { KUNDALI_EDUCATIONAL_BLOCKS } from './kundali-educational.const';

const KundaliEducationalSection: React.FC = () => {
  return (
    <section className="w-full px-8" aria-labelledby="kundali-educational-heading">
      <h2 id="kundali-educational-heading" className="sr-only">
        About Janam Kundli
      </h2>

      <div className="w-full flex flex-col gap-2 md:gap-14 lg:gap-16">
        {KUNDALI_EDUCATIONAL_BLOCKS.map(block => (
          <article key={block.title} className="text-left w-full">
            <h3 className="font-sahitya font-bold text-[#7c221d] text-[22px] leading-[32px] tracking-[0] md:text-[28px] md:leading-[38px]">
              {block.title}
            </h3>
            <p className="font-mukta font-normal text-[16px] leading-[28px] tracking-[0] text-[#2f1d18] mt-4 md:text-[18px]">
              {block.body} {/* Render as single paragraph */}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default KundaliEducationalSection;
