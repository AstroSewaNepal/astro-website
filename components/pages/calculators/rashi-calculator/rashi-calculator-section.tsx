'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';

const STORAGE_KEY = 'rashiCalculatorResult';

type MoonSignApiResponse = {
  moonSign: string;
  source: string;
};

export default function RashiCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<MoonSignApiResponse>('moon-sign', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        rashi: api.moonSign,
        moonSign: api.moonSign,
        source: api.source,
      }),
    );

    router.push('/calculators/rashi-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Rashi/Moon Sign Calculator"
      shortDescription="Your Vedic moon sign (Rashi) from precise panchanga data — based on real birth time and location, not a date table."
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Rashi" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="rashi" />
    </CalculatorPageIntro>
  );
}
