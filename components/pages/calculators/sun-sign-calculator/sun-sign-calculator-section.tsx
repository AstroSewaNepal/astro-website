'use client';

import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import CalculatorSection from '@/components/pages/calculators/calculator-section';

const determineSunSign = (month: number, day: number) => {
  const ranges = [
    { sign: 'Capricorn', start: [1, 1], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
    { sign: 'Capricorn', start: [12, 22], end: [12, 31] },
  ];

  for (const range of ranges) {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;
    const afterStart = month > startMonth || (month === startMonth && day >= startDay);
    const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
    if (afterStart && beforeEnd) return range.sign;
  }

  return 'Unknown';
};

export default function SunSignCalculatorSection() {
  return (
    <CalculatorSection
      title="Sun Sign Calculator"
      description="Find your sun sign based on your birth date and learn what it reveals about your personality."
      image={SunSignCalculatorImage}
      imageAlt="Sun sign illustration"
      fields={[
        {
          id: 'birthDate',
          label: 'Enter your date of birth',
          type: 'date',
        },
      ]}
      buttonLabel="Calculate Sun Sign"
      resultTitle="Your Sun Sign"
      resultMessage={values => {
        const [year, month, day] = values.birthDate.split('-').map(Number);
        const sign = determineSunSign(month, day);
        return `${sign} is your sun sign. Explore its strengths and traits for a deeper understanding of your core identity.`;
      }}
    />
  );
}
