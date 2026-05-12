'use client';

import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import CalculatorSection from '@/components/pages/calculators/calculator-section';

const moonPhase = (birthDate: string) => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const c = Math.floor((14 - month) / 12);
  const y = year - c;
  const m = month + 12 * c - 2;
  const jd =
    day +
    Math.floor((31 * m) / 12) +
    y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    730550;
  const phase = ((jd + 4.867) / 29.53059) % 1;
  if (phase < 0) return 'New Moon';
  if (phase < 0.25) return 'Waxing Crescent';
  if (phase < 0.5) return 'First Quarter';
  if (phase < 0.75) return 'Waxing Gibbous';
  if (phase < 0.9) return 'Full Moon';
  return 'Waning Gibbous';
};

export default function MoonPhaseCalculatorSection() {
  return (
    <CalculatorSection
      title="Moon Phase Calculator"
      description="Find the moon phase for your birth date and uncover the lunar energy associated with that day."
      image={MoonPhaseImage}
      imageAlt="Moon phase illustration"
      fields={[
        {
          id: 'birthDate',
          label: 'Enter the date',
          type: 'date',
        },
      ]}
      buttonLabel="Check Moon Phase"
      resultTitle="Moon Phase"
      resultMessage={values => {
        const phase = moonPhase(values.birthDate);
        return `Your selected date falls under the ${phase}. This lunar energy can influence emotions, intuition, and timing.`;
      }}
    />
  );
}
