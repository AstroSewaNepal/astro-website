'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { determineDashaCycle } from '@/lib/calculators/determine-dasha';

const STORAGE_KEY = 'dashaCalculatorResult';

export default function DashaCalculatorSection() {
  const router = useRouter();

  const handleSubmit = (form: CalculatorFormValues) => {
    const cycle = determineDashaCycle(form.birthDate);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        cycle,
      }),
    );

    router.push('/calculators/dasha-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Dasha Calculator"
      shortDescription="Discover your current dasha cycle and gain insight into the timing of life events based on your birth date."
    >
      <CalculatorBirthDetailsForm submitLabel="Calculate Dasha" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
