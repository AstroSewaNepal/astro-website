'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';

const STORAGE_KEY = 'sunSignCalculatorResult';

type SunSignApiResponse = {
  sunSign: string;
  source: string;
};

export default function SunSignCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<SunSignApiResponse>('sun-sign', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        sunSign: api.sunSign,
        source: api.source,
      }),
    );

    router.push('/calculators/sun-sign-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Sun Sign Calculator: Find Your Vedic Zodiac Sign"
      shortDescription="Find your true Vedic sun sign using the Lahiri ayanamsa and your exact birth time. Not the newspaper date range from Western astrology."
      longDescription={[
        'Most people know their sun sign from Western horoscopes. In Vedic astrology, the sun sign is calculated differently. Western astrology uses the tropical zodiac, which is tied to the seasons and the spring equinox. Vedic astrology uses the sidereal zodiac, which tracks the actual positions of the stars in the sky.',
        "Because Earth's axis shifts slowly over thousands of years, the two zodiac systems have drifted apart by about 23 to 24 degrees. This difference is called the ayanamsa. It means your Vedic sun sign is often one sign earlier than your Western sign. This calculator uses the Lahiri ayanamsa, which is the standard in Vedic astrology, to give you an accurate sidereal result from your exact birth time and place.",
      ]}
      infoSections={[
        {
          title: 'What Does the Sun Represent in Vedic Astrology?',
          body: 'In Jyotish, the Sun (Surya) governs the soul, ego, authority, vitality, and the relationship with the father. Its sign placement in your birth chart reveals your core identity and the areas of life where you seek recognition and purpose. A strong Sun suggests confidence and leadership. An afflicted Sun can point to challenges with self-assertion or authority figures.',
        },
        {
          title: 'Is the Sun Sign the Most Important Placement in Vedic Astrology?',
          body: 'No. In Vedic astrology, the moon sign (Rashi) and rising sign (Lagna) are generally considered more important for understanding personality and predicting life events. The sun sign matters for understanding purpose and soul direction, but a full chart reading looks at all planetary placements together. Your sun sign alone is just one piece of a much richer picture.',
        },
        {
          title: 'Why Does My Vedic Sign Feel More Accurate Than My Western Sign?',
          body: 'Many people who explore Vedic astrology find that their Vedic moon sign or rising sign feels far more accurate than their Western sun sign. This is partly because Vedic astrology uses the moon and ascendant as primary indicators, and partly because the sidereal zodiac is more precisely tied to actual astronomical positions. If your Western sign has never quite fit, exploring your full Vedic chart often gives a much more resonant picture.',
        },
        {
          title: 'What Is the Lahiri Ayanamsa?',
          body: "The ayanamsa is the difference in degrees between the tropical zodiac used in Western astrology and the sidereal zodiac used in Vedic astrology. The Lahiri ayanamsa is the most widely used standard for calculating this difference in Vedic astrology. It was officially adopted by the Indian government for the national calendar in 1955. Currently the Lahiri ayanamsa is approximately 23 to 24 degrees, which is why most people's Vedic sun sign is one sign behind their Western sun sign.",
        },
        {
          title: 'Do I Need My Exact Birth Time for This Calculator?',
          body: 'Yes, exact birth time is important. The Sun moves slowly through the zodiac, about one degree per day, but it does move. If you were born near the end or beginning of a month, even a few hours can affect whether the Sun was in one sign or the next. If you do not know your exact birth time, the calculator will still give a result, but it may flag the result as uncertain if you were born near a sign boundary.',
        },
      ]}
      infoHeading="Frequently Asked Questions"
      infoDescription="Find quick answers to common questions about your Vedic sun sign, the Lahiri ayanamsa, and how it differs from Western astrology."
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Sun Sign" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="sun-sign" />
    </CalculatorPageIntro>
  );
}
