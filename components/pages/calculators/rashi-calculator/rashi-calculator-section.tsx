'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { determineRashi } from '@/lib/calculators/determine-rashi';

const STORAGE_KEY = 'rashiCalculatorResult';

export default function RashiCalculatorSection() {
  const router = useRouter();

  const handleSubmit = (form: CalculatorFormValues) => {
    const [, month, day] = form.birthDate.split('-').map(Number);
    const rashi = determineRashi(month, day);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        rashi,
      }),
    );

    router.push('/calculators/rashi-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Rashi/Moon Sign Calculator"
      shortDescription="Discover your Rashi (moon sign) from your birth date and explore what it reveals about your emotional nature in Vedic astrology."
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Rashi" onSubmit={handleSubmit} />
    </CalculatorPageIntro>
  );
}
