'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';

const STORAGE_KEY = 'moonPhaseCalculatorResult';

type MoonPhaseApiResponse = {
  phase: string;
  moonSign?: string;
  source: string;
};

export default function MoonPhaseCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<MoonPhaseApiResponse>('moon-phase', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        phase: api.phase,
        moonSign: api.moonSign,
        source: api.source,
      }),
    );

    router.push('/calculators/moon-phase-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Moon Phase Calculator"
      shortDescription="Lunar phase and tithi at your birth from VedAstro Panchanga (real ephemeris, not a formula on the date alone)."
    >
      <CalculatorBirthDetailsForm submitLabel="Check Moon Phase" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
