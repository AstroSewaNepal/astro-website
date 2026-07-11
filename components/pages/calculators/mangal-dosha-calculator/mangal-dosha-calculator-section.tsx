'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { MangalDoshaLevel } from '@/lib/calculators/determine-mangal-dosha';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import CalculatorChooserSection from '../shared/calculator-chooser-section';

const STORAGE_KEY = 'mangalDoshaCalculatorResult';

type ManglikApiResponse = {
  level: MangalDoshaLevel;
  manglik: {
    present: boolean;
    strength: string;
    reasons: string[];
  };
  source: string;
};

export default function MangalDoshaCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<ManglikApiResponse>('manglik', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        level: api.level,
        manglik: api.manglik,
        source: api.source,
      }),
    );

    router.push('/calculators/mangal-dosha-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Mangal Dosha Calculator: Check Your Manglik Status"
      shortDescription="A chart-based Mangal Dosha check using real planetary positions, not a simplified birth date rule."
      longDescription={[
        'Mangal Dosha, also called Kuja Dosha or Manglik Dosha, occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house of the birth chart. In Vedic astrology, these placements are significant for marriage compatibility because a strong Mars in these positions can create intensity or friction in close partnerships.',
        'Mangal Dosha is not a simple yes or no condition. Its strength depends on the sign Mars occupies, other planets aspecting it, and whether classical cancellation conditions apply. Many people with Mangal Dosha have long and stable marriages. This calculator checks all six houses using your actual planetary positions and will flag any cancellation factors found in your chart.',
      ]}
      infoHeading="Frequently Asked Questions"
      infoDescription="Find quick answers to common questions about Mangal Dosha, how it affects marriage, and what cancellation factors mean."
      infoSections={[
        {
          title: 'What Exactly Is Mangal Dosha?',
          body: 'Mangal Dosha occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house of the Lagna chart. These houses relate to the self, family, home, marriage, longevity, and emotional wellbeing. A strongly placed Mars in these houses can affect partnership dynamics. The 7th and 8th house placements are generally considered most significant for marriage.',
        },
        {
          title: 'Can Mangal Dosha Be Cancelled?',
          body: 'Yes, and this is important to know before drawing any conclusions. If both partners have Mangal Dosha, it is traditionally considered neutralised. Mars in its own signs (Aries, Scorpio) or exaltation (Capricorn) significantly reduces its negative expression. Jupiter aspecting Mars is another common cancellation factor. Our calculator checks for these conditions and flags them in your result.',
        },
        {
          title: 'Should I Be Worried If My Result Shows Mangal Dosha?',
          body: 'Not necessarily. Mangal Dosha is one factor among many in a birth chart and does not determine the outcome of a marriage on its own. Many people with uncancelled Mangal Dosha have strong, lasting relationships, especially when other compatibility factors are positive. If you want to understand its specific strength in your chart, book a consultation with one of our astrologers for a full reading.',
        },
        {
          title: 'Which Houses Create the Most Serious Mangal Dosha?',
          body: 'All six house placements create Mangal Dosha to some degree, but they are not all equally serious. Placement in the 7th house, which governs marriage, and the 8th house, which governs longevity, are generally considered the strongest forms. Placement in the 1st or 4th house is usually considered milder. The final assessment always depends on other factors in the chart, including the sign Mars is in and any aspects it receives.',
        },
        {
          title: 'Do Both Partners Need to Be Checked?',
          body: 'Yes. Kundali matching for marriage checks both partners for Mangal Dosha. If only one partner has it, traditional astrology recommends careful evaluation. If both partners have it, the Dosha is generally considered to cancel out. This is why checking both charts together, which our Kundali matching tool does, gives you a more complete picture than checking one chart alone.',
        },
      ]}
    >
      <CalculatorBirthDetailsForm submitLabel="Check Mangal Dosha" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="mangal-dosha" />
    </CalculatorPageIntro>
  );
}
