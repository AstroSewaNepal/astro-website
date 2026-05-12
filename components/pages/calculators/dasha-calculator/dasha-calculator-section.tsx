'use client';

import DashaImage from '@/components/images/calculator/dasha.png';
import CalculatorSection from '@/components/pages/calculators/calculator-section';

const dashaResult = (birthDate: string) => {
  const digits = birthDate.replace(/-/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  const cycle = ((sum - 1) % 9) + 1;
  return `Your current major dasha cycle is ${cycle}. This period focuses on personal growth, life lessons, and energy shifts associated with this number.`;
};

export default function DashaCalculatorSection() {
  return (
    <CalculatorSection
      title="Dasha Calculator"
      description="Discover your current dasha cycle and gain insight into the timing of life events based on your birth date."
      image={DashaImage}
      imageAlt="Dasha calculator illustration"
      fields={[
        {
          id: 'birthDate',
          label: 'Enter your date of birth',
          type: 'date',
        },
      ]}
      buttonLabel="Calculate Dasha"
      resultTitle="Dasha Cycle"
      resultMessage={values => dashaResult(values.birthDate)}
    />
  );
}
