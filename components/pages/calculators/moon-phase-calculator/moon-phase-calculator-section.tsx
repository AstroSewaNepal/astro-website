'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { determineMoonPhase } from '@/lib/calculators/determine-moon-phase';

const STORAGE_KEY = 'moonPhaseCalculatorResult';

export default function MoonPhaseCalculatorSection() {
  const router = useRouter();

  const handleSubmit = (form: CalculatorFormValues) => {
    const phase = determineMoonPhase(form.birthDate);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        phase,
      }),
    );

    router.push('/calculators/moon-phase-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Moon Phase Calculator"
      shortDescription="Find the moon phase for your birth date and uncover the lunar energy associated with that day."
    >
      <CalculatorBirthDetailsForm submitLabel="Check Moon Phase" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
