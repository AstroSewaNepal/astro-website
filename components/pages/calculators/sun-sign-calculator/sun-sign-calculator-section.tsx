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
      title="Sun Sign Calculator"
      shortDescription="Sidereal sun sign from precise sidereal astrology at your birth time and place (Vedic / Lahiri-style chart, not Western newspaper dates)."
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Sun Sign" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="sun-sign" />
    </CalculatorPageIntro>
  );
}
