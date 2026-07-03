'use client';

import { useRouter } from 'next/navigation';

import CalculatorBirthDetailsForm from '@/components/pages/calculators/shared/calculator-birth-details-form';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorPageIntro from '@/components/pages/calculators/shared/calculator-page-intro';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { runVedastroBirthCalculator } from '@/lib/calculators/run-vedastro-birth-calculator';

const STORAGE_KEY = 'rashiCalculatorResult';

type MoonSignApiResponse = {
  moonSign: string;
  source: string;
};

export default function RashiCalculatorSection() {
  const router = useRouter();

  const handleSubmit = async (form: CalculatorFormValues) => {
    const api = await runVedastroBirthCalculator<MoonSignApiResponse>('moon-sign', form);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        rashi: api.moonSign,
        moonSign: api.moonSign,
        source: api.source,
      }),
    );

    router.push('/calculators/rashi-calculator/result');
  };

  return (
    <CalculatorPageIntro
      title="Rashi Calculator: Find Your Vedic Moon Sign"
      shortDescription="Find your Janma Rashi using real VedAstro Panchanga data. Calculated from your exact birth time and location, not a simplified date table."
      longDescription={[
        'Your Rashi is the zodiac sign the Moon occupied at the exact moment of your birth. In Vedic astrology, the Moon moves through all twelve signs approximately every 27 days, spending around 2 to 2.5 days in each sign. Because the Moon moves so quickly, your exact birth time is important for an accurate Rashi result.',
        'In Vedic astrology, the moon sign carries far more weight than the sun sign for understanding personality. While the sun sign shows your outer identity and ego, the Rashi reveals your emotional nature, instinctive responses, and inner world. It is also the starting point for calculating your Dasha timeline and is central to Kundali matching.',
      ]}
      infoSections={[
        {
          title: 'Why Is Rashi More Important Than the Sun Sign in Vedic Astrology?',
          body: 'Vedic astrology places the Moon at the centre of personality analysis because the Moon governs the mind and emotions. Your sun sign shows the broader identity and life purpose, but your Rashi shows how you actually feel, respond, and connect day to day. Most Vedic predictions, including Dasha periods and Kundali matching, are calculated primarily from the moon sign.',
        },
        {
          title: 'Why Might My Rashi Differ from My Western Zodiac Sign?',
          body: 'Vedic and Western astrology use different zodiac systems. Western astrology uses the tropical zodiac, fixed to the seasons. Vedic astrology uses the sidereal zodiac, aligned with the actual positions of the stars. Because of the precession of the equinoxes, the two systems are currently offset by about 23 to 24 degrees. This means most people\'s Vedic moon sign is one sign earlier than their Western sun sign.',
        },
        {
          title: 'What If I Do Not Know My Exact Birth Time?',
          body: 'Because the Moon changes signs every 2 to 2.5 days, an unknown birth time creates uncertainty in the Rashi result. If your birth was near a sign change, the result may not be accurate. This calculator will flag if your time is uncertain. If accuracy matters, for example for Kundali matching or Dasha calculation, our astrologers can help narrow down your birth time using chart rectification.',
        },
        {
          title: 'What Are the 12 Rashis?',
          body: 'The 12 Rashis correspond to the 12 zodiac signs in Vedic astrology. They are: Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), and Meena (Pisces). Each Rashi has a ruling planet, an element, and a set of characteristics that shape the emotional and instinctive nature of people born under it.',
        },
        {
          title: 'How Does Rashi Connect to Nakshatra?',
          body: 'Each Rashi contains two and a quarter Nakshatras. The 27 Nakshatras are lunar mansions that divide the zodiac into finer sections. While your Rashi gives the broad sign of your Moon, your Nakshatra gives a much more precise description of your emotional nature and character. Both are used together in Vedic astrology for detailed personality analysis, Dasha calculations, and Kundali matching.',
        },
      ]}
    >
      <CalculatorBirthDetailsForm submitLabel="Find Your Rashi" onSubmit={handleSubmit} />
      <CalculatorChooserSection exclude="rashi" />
    </CalculatorPageIntro>
  );
}
