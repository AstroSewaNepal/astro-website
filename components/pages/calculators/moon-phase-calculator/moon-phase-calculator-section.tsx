'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';
import CalculatorChooserSection from '../shared/calculator-chooser-section';

const STORAGE_KEY = 'moonPhaseCalculatorResult';

type MoonPhaseApiResponse = {
  phase: string;
  moonSign?: string;
  source: string;
};

export default function MoonPhaseCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<MoonPhaseApiResponse>('moon-phase', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        phase: api.phase,
        moonSign: api.moonSign,
        source: api.source,
      }),
    );

    router.push('/calculators/moon-phase-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Moon Phase Calculator: Find Your Birth Tithi and Lunar Phase"
      shortDescription="See the exact lunar phase and Tithi at the moment of your birth, calculated from real Vedic Panchanga data."
      longDescription={[
        'In Vedic astrology, the moon phase at your birth is one of the five elements of the Panchanga, the sacred Hindu almanac used to track auspicious and inauspicious timings. The lunar month is divided into 30 Tithis across the waxing (Shukla Paksha) and waning (Krishna Paksha) fortnights. Each Tithi carries its own energy and deity association.',
        'Your birth Tithi shows the lunar energy you arrived with. It influences your instinctive emotional patterns, your relationship with cycles and timing, and which days of the month naturally feel more aligned for you. This calculator uses real ephemeris data from VedAstro, not a simplified calendar formula.',
      ]}
      infoHeading="Frequently Asked Questions"
      infoDescription="Find quick answers to common questions about lunar phases, Tithis, and how the Panchanga influences your birth energy."
      infoSections={[
        {
          title: 'What Is a Tithi in Vedic Astrology?',
          body: 'A Tithi is a lunar day defined by the angular distance between the Sun and Moon. Every 12 degrees of separation between them equals one Tithi. There are 15 Tithis in the waxing half (Shukla Paksha) and 15 in the waning half (Krishna Paksha). Each Tithi has a ruling deity and a general quality. Some are auspicious for new beginnings and others are better for rest or spiritual practice.',
        },
        {
          title: 'What Does My Birth Moon Phase Tell Me?',
          body: 'People born during a waxing moon tend to have outward, building energy. They often thrive when initiating and growing things. Those born in the waning phase may be more reflective and attuned to completion and release. The specific Tithi adds a further layer of detail, describing the quality of the lunar energy present at your birth.',
        },
        {
          title: 'How Do I Use the Panchanga for Daily Timing?',
          body: 'Once you know your birth Tithi, you can use the daily Panchanga on AstroSewa to identify which days of each month naturally resonate with your birth energy. The Panchanga lists the current Tithi, Nakshatra, Yoga, Karana, and auspicious windows for each day. This helps you align important actions with the natural rhythm of the lunar cycle.',
        },
        {
          title: 'What Is the Difference Between Moon Phase and Moon Sign?',
          body: 'Moon phase (Tithi) tells you the relationship between the Sun and Moon at your birth, specifically how much of the Moon was illuminated. Moon sign (Rashi) tells you which zodiac sign the Moon was positioned in at the time of your birth. Both are important in Vedic astrology but they tell you different things. Your Rashi is used for personality analysis, Dasha calculations, and Kundali matching. Your birth Tithi adds detail about your emotional rhythms and the quality of the lunar energy you carry.',
        },
        {
          title: 'Do I Need an Exact Birth Time for This Calculator?',
          body: 'Yes, birth time matters for an accurate Tithi result. A Tithi changes roughly once every 24 hours but the transition can happen at any point during the day or night. If your birth was close to the moment a Tithi changed, an incorrect birth time could give you the wrong Tithi. If you are unsure of your birth time, enter what you know and the calculator will flag the level of confidence in the result.',
        },
      ]}
    >
      <CalculatorBirthDetailsForm submitLabel="Check Moon Phase" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="moon-phase" />
    </CalculatorPageIntro>
  );
}
