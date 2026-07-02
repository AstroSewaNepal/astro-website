import type { ReactNode } from 'react';
import QNASComponent from '@/components/common/qnas-component';

type CalculatorPageIntroProps = {
  title: string;
  shortDescription: string;
  longDescription?: string[];
  infoHeading?: string;
  infoDescription?: string;
  infoSections?: Array<{ title: string; body: string }>;
  children: ReactNode;
};

const DEFAULT_LONG = [
  'In Vedic astrology, your life unfolds through a sequence of planetary periods called Dashas. The Vimshottari system divides life into nine cycles covering 120 years in total. Each cycle is governed by a different planet: Ketu for 7 years, Venus for 20 years, Sun for 6 years, Moon for 10 years, Mars for 7 years, Rahu for 18 years, Jupiter for 16 years, Saturn for 19 years, and Mercury for 17 years.',
  'The planet ruling your Mahadasha at any given time sets the overall quality of that life phase. It shapes the themes, opportunities, and challenges of that period. Within each Mahadasha, shorter sub-periods called Antardasha cycle through all nine planets in sequence. Knowing your current Mahadasha and Antardasha helps you understand why certain areas of life feel active or difficult right now.',
];

export default function CalculatorPageIntro({
  title,
  shortDescription,
  longDescription = DEFAULT_LONG,
  infoHeading,
  infoDescription,
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

        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 xl:mt-16">
          {infoHeading || infoDescription ? (
            <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 text-center">
              {infoHeading ? (
                <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary">
                  {infoHeading}
                </h2>
              ) : null}
              {infoDescription ? (
                <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px]">
                  {infoDescription}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 space-y-4 md:space-y-6 lg:space-y-[34px]">
            {sections.map((section, idx) => (
              <QNASComponent
                key={idx}
                question={section.title}
                answer={section.body}
                isDefaultOpen={idx === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
