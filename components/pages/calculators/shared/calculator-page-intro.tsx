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
  'AstroSewa calculators use accurate Vedic astronomy and your birth details to generate personalized results for each chart-based calculation.',
  'Enter your birth date, time, and birthplace to get a precise reading from our Vedic astrology engine, not a generic sun sign formula.',
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
    <section className="pt-6 md:pt-12 pb-12">
      <div>
        <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
          {title}
        </h1>

        <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
          {shortDescription}
        </p>

        {longDescription.map((paragraph, index) => (
          <p
            key={index}
            className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.5] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]"
          >
            {paragraph}
          </p>
        ))}

        <div className="mt-6 md:mt-[50px]">{children}</div>

        <div className="mt-12 md:mt-[100px]">
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
