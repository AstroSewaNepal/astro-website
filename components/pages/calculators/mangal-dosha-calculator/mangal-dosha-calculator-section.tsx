'use client';

import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import CalculatorSection from '@/components/pages/calculators/calculator-section';

const doshaResult = (birthDate: string) => {
  const day = Number(birthDate.split('-')[2] || 0);
  if (day % 3 === 0)
    return 'Mangal Dosha is present and can influence your marriage life. Consider consulting an astrologer for guidance.';
  if (day % 3 === 1)
    return 'Mangal Dosha is mild and may not create major issues. A balanced approach can help reduce tension.';
  return 'No major Mangal Dosha is indicated. Your marriage prospects appear stable from the birth date pattern.';
};

export default function MangalDoshaCalculatorSection() {
  return (
    <CalculatorSection
      title="Mangal Dosha Calculator"
      description="Check whether Mangal Dosha appears in your birth chart and understand how it may impact marital harmony."
      image={MangalDoshaImage}
      imageAlt="Mangal Dosha illustration"
      fields={[
        {
          id: 'birthDate',
          label: 'Enter your date of birth',
          type: 'date',
        },
      ]}
      buttonLabel="Check Dosha"
      resultTitle="Mangal Dosha Result"
      resultMessage={values => doshaResult(values.birthDate)}
    />
  );
}
