import type { ReactNode } from 'react';

type CalculatorPageIntroProps = {
  title: string;
  shortDescription: string;
  longDescription?: string[];
  infoSections?: Array<{ title: string; body: string }>;
  children: ReactNode;
};

const DEFAULT_LONG = [
  'AstroSewa calculators use accurate Vedic astronomy and your birth details to generate personalized results for each chart-based calculation.',
  'Enter your birth date, time, and birthplace to get a precise reading from our Vedic astrology engine, not a generic sun sign formula.',
];

export default function CalculatorPageIntro({
  title,
  shortDescription,
  longDescription = DEFAULT_LONG,
  infoSections,
  children,
}: CalculatorPageIntroProps) {
  const sections = infoSections ?? [
    {
      title: `How does a ${title} work?`,
      body: `This calculator uses your birth details and Vedic planetary data to compute an accurate chart-based result for ${title.toLowerCase()}.`,
    },
    {
      title: 'What information is needed?',
      body: 'Provide your birth date, time, and place so the calculator can determine the exact astrological positions and generate a meaningful response.',
    },
    {
      title: 'Why choose AstroSewa?',
      body: 'AstroSewa calculations are powered by accurate Vedic ephemeris and astrology principles for precise, chart-aware insights.',
    },
  ];

  return (
    <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
      <div className="max-w-[1454px] mx-auto">
        <h1 className="font-sahitya text-[20px] sm:text-[24px] md:text-[30px] lg:text-[36px] xl:text-[40px] font-bold text-[#2f2f2f] leading-snug">
          {title}
        </h1>

        <p className="mt-2 sm:mt-2.5 md:mt-3 lg:mt-4 xl:mt-5 w-full text-left font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] xl:text-[18px] font-normal leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] xl:leading-[30px] text-[#4a423d]">
          {shortDescription}
        </p>

        {longDescription.map((paragraph, index) => (
          <p
            key={index}
            className="mt-2.5 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6 w-full text-left font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] font-normal leading-[22px] sm:leading-[24px] md:leading-[26px] lg:leading-[28px] xl:leading-[30px] text-[#4a423d]"
          >
            {paragraph}
          </p>
        ))}

        {children}

        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 xl:mt-16 space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} className="pt-5 sm:pt-6 md:pt-7 lg:pt-8 xl:pt-10 pb-2">
              <h2 className="font-sahitya text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] font-bold text-[#2f2f2f] mb-2 sm:mb-2.5 md:mb-3 lg:mb-3.5 xl:mb-4">
                {section.title}
              </h2>
              <p className="w-full text-left font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] xl:text-[18px] font-normal leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] xl:leading-[30px] text-[#4a423d]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
