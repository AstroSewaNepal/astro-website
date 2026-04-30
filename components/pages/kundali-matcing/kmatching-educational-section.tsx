import React from 'react';
import { KMATCHING_EDUCATIONAL_BLOCKS } from './kmatching-educational.const';

const KundaliEducationalSection: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8" aria-labelledby="kmatching-educational-heading">
      <h2 id="kmatching-educational-heading" className="sr-only">
        About Janam Kundli
      </h2>

      <div className="w-full flex flex-col gap-2 md:gap-14 lg:gap-16">
        {KMATCHING_EDUCATIONAL_BLOCKS.map(block => (
          <article key={block.title} className="text-left w-full">
            <h3 className="font-mukta font-semibold text-[#7c221d] text-[18px] leading-[28px] tracking-[0] md:font-sahitya md:font-bold md:text-[28px] md:leading-[38px]">
              {block.title}
            </h3>
            <p className="font-mukta font-normal text-[14px] leading-[24px] tracking-[0] text-[#79787A] mt-4 md:text-lg md:leading-[1.9] md:text-[#2f1d18]">
              {block.body} {/* Render as single paragraph */}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default KundaliEducationalSection;
