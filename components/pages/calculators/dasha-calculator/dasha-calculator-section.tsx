'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
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
      title="Dasha Calculator"
      shortDescription="Vimshottari mahadasha and antardasha computed instantly on the server from your birth date and time (Lahiri ayanamsa)."
    >
      <CalculatorBirthDetailsForm submitLabel="Calculate Dasha" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
