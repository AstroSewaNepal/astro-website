'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';

const STORAGE_KEY = 'dashaCalculatorResult';

type DashaApiResponse = {
  source: string;
  calculator: string;
  birthUtc: string;
  currentMahadasha: { lord: string; start: string; end: string };
  currentAntardasha: { lord: string; start: string; end: string };
  mahadashas: Array<{ lord: string; start: string; end: string; years: number }>;
  nakshatra: { name: string; lord: string };
};

export default function DashaCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<DashaApiResponse>('dasha', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        source: api.source,
        birthUtc: api.birthUtc,
        currentMahadasha: api.currentMahadasha,
        currentAntardasha: api.currentAntardasha,
        mahadashas: api.mahadashas,
        nakshatra: api.nakshatra,
      }),
    );

    router.push('/calculators/dasha-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Dasha Calculator: Find Your Mahadasha and Antardasha"
      shortDescription="Enter your birth details to calculate your full Vimshottari Dasha timeline using the Lahiri ayanamsa. See which planet rules your current period and what comes next."
      infoHeading="Frequently Asked Questions"
      infoDescription="Find quick answers to common questions about Vimshottari Dasha, your current planetary period, and how to use your Mahadasha timeline."
      infoSections={[
        {
          title: 'What Is a Mahadasha?',
          body: 'A Mahadasha is a major planetary period in the Vimshottari system. Each planet rules a fixed span. The shortest is Sun at 6 years and the longest is Venus at 20 years. The planet active during your Mahadasha acts like a dominant theme through which you experience life during that time. It shapes your career, relationships, inner focus, and the type of challenges that come up.',
        },
        {
          title: 'How Is My Starting Dasha Determined?',
          body: 'Your starting Dasha is determined by the Nakshatra (lunar mansion) the Moon occupied at the exact moment of your birth. Each Nakshatra is ruled by one of the nine planets, and that planet becomes the ruler of your first Dasha. The sequence then follows a fixed order through all nine planets until the full 120-year cycle is complete.',
        },
        {
          title: 'How Do I Use My Dasha Results Practically?',
          body: 'Knowing your Dasha helps you understand what is happening in your life right now and what to expect in the periods ahead. A Jupiter Mahadasha generally favours education, expansion, and wisdom. Saturn brings discipline, karmic lessons, and hard work. If you want a detailed interpretation of what your current Dasha means for your specific chart, our astrologers can walk you through it in a consultation.',
        },
        {
          title: 'What Is the Difference Between Mahadasha and Antardasha?',
          body: 'A Mahadasha is the major planetary period, which can last anywhere from 6 to 20 years. Within each Mahadasha, there are nine shorter sub-periods called Antardasha, each ruled by one of the nine planets in a specific sequence. The Antardasha modifies the energy of the Mahadasha. For example, if you are in a Saturn Mahadasha but a Jupiter Antardasha, the expansive and optimistic quality of Jupiter will soften Saturn\'s usual strictness during that sub-period.',
        },
        {
          title: 'Do I Need My Exact Birth Time to Use This Calculator?',
          body: 'Yes, birth time is important for an accurate Dasha result because the starting Dasha is calculated from the Moon\'s position at the exact moment of birth. The Moon moves quickly, spending only about 2 days in each Nakshatra. If your birth time is off by even a few hours, your starting Dasha could be calculated incorrectly. If you do not know your exact birth time, the calculator will still give a result but it may have some margin of error. Our astrologers can help you narrow down your birth time using a technique called chart rectification.',
        },
      ]}
    >
      <CalculatorBirthDetailsForm submitLabel="Calculate Dasha" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="dasha" />
    </CalculatorPageIntro>
  );
}
