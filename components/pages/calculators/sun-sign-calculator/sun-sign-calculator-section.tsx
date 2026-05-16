'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { determineSunSign } from '@/lib/calculators/determine-sun-sign';

const STORAGE_KEY = 'sunSignCalculatorResult';

export default function SunSignCalculatorSection() {
  const router = useRouter();

  const handleSubmit = (form: CalculatorFormValues) => {
    const [, month, day] = form.birthDate.split('-').map(Number);
    const sunSign = determineSunSign(month, day);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        sunSign,
      }),
    );

    router.push('/calculators/sun-sign-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Sun Sign Calculator"
      shortDescription="Find your sun sign based on your birth date and learn what it reveals about your personality and core identity in Western astrology."
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Sun Sign" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
