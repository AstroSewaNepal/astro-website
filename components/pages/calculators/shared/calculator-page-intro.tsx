import type { ReactNode } from 'react';

type CalculatorPageIntroProps = {
  title: string;
  shortDescription: string;
  longDescription?: string[];
  infoSections?: Array<{ title: string; body: string }>;
  children: ReactNode;
};

const DEFAULT_LONG = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
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
      title: `How Does a ${title} Work?`,
      body: DEFAULT_LONG[0],
    },
    {
      title: `How Does a ${title} Work?`,
      body: DEFAULT_LONG[0],
    },
    {
      title: `How Does a ${title} Work?`,
      body: DEFAULT_LONG[0],
    },
  ];

  return (
    <section className="w-full px-3 md:px-8 py-8">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-sahitya text-[28px] md:text-[34px] font-bold text-[#2f2f2f] leading-snug">
          {title}
        </h1>

        <p className="mt-3 w-full text-left font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          {shortDescription}
        </p>

        {longDescription.map((paragraph, index) => (
          <p
            key={index}
            className="mt-4 w-full text-left font-mukta text-[16px] font-normal leading-[28px] text-[#4a423d] md:text-[18px] md:leading-[30px]"
          >
            {paragraph}
          </p>
        ))}

        {children}

        <div className="mt-12 space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} className="pt-8 pb-2">
              <h2 className="font-sahitya text-[18px] md:text-[20px] font-bold text-[#2f2f2f] mb-3">
                {section.title}
              </h2>
              <p className="w-full text-left font-mukta text-[16px] font-normal leading-[28px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
