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
      title="Mangal Dosha Calculator"
      shortDescription="Real chart-based Manglik check using VedAstro planet positions and the AstroSewa dosha engine (not a random date trick)."
    >
      <CalculatorBirthDetailsForm submitLabel="Check Mangal Dosha" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="mangal-dosha" />
    </CalculatorPageIntro>
  );
}
