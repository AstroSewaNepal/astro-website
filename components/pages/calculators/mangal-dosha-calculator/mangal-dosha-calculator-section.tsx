'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { determineMangalDosha } from '@/lib/calculators/determine-mangal-dosha';

const STORAGE_KEY = 'mangalDoshaCalculatorResult';

export default function MangalDoshaCalculatorSection() {
  const router = useRouter();

  const handleSubmit = (form: CalculatorFormValues) => {
    const level = determineMangalDosha(form.birthDate);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        level,
      }),
    );

    router.push('/calculators/mangal-dosha-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Mangal Dosha Calculator"
      shortDescription="Check whether Mangal Dosha appears in your birth chart and understand how it may impact marital harmony."
    >
      <CalculatorBirthDetailsForm submitLabel="Check Mangal Dosha" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
