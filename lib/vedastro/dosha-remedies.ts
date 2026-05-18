import type { AllDoshaResult } from './dosha-types';

export interface DoshaRemedyGuide {
  key: keyof AllDoshaResult;
  title: string;
  affects: string;
  remedies: string[];
  faq: Array<{ question: string; answer: string }>;
}

export const DOSHA_REMEDY_GUIDES: DoshaRemedyGuide[] = [
  {
    key: 'manglik',
    title: 'Manglik (Mangal Dosha)',
    affects: 'Marriage timing, harmony with spouse, patience in relationships.',
    remedies: [
      'Chant Hanuman Chalisa or “Om Ang Angarakaya Namah” on Tuesdays.',
      'Fast on Tuesdays or donate red lentils (masoor dal), jaggery, or red cloth.',
      'Visit Hanuman temple; offer sindoor or red flowers if tradition allows.',
      'Consider Kumbh Vivah or marrying another Manglik — many astrologers suggest this only after full chart review.',
      'Wear red coral (moonga) only after a qualified astrologer confirms it suits your chart.',
    ],
    faq: [
      {
        question: 'Does Manglik always mean a bad marriage?',
        answer:
          'No. It highlights Mars-related themes (energy, assertiveness). Many Manglik natives have stable marriages, especially with matching charts or cancellation (dosha bhanga) rules.',
      },
      {
        question: 'Should I delay marriage?',
        answer:
          'Delay is suggested only when Mars is strongly afflicted and other factors agree. A full D1/D9 review is more reliable than one rule alone.',
      },
    ],
  },
  {
    key: 'kaalSarp',
    title: 'Kaal Sarp',
    affects: 'Obstacles, delays, mental pressure, feeling “stuck” despite effort.',
    remedies: [
      'Chant Maha Mrityunjaya Mantra or “Om Namah Shivaya” regularly.',
      'Perform or participate in Kaal Sarp dosh nivaran puja at Trimbakeshwar or under priest guidance.',
      'Feed birds or donate to charity on Nag Panchami; respect serpent symbolism in tradition.',
      'Meditation and steady routine help balance the anxiety this yoga is associated with.',
    ],
    faq: [
      {
        question: 'Is Kaal Sarp permanent?',
        answer:
          'It describes a chart pattern, not a life sentence. Remedies and positive dashas are traditionally used to soften its effects.',
      },
      {
        question: 'Partial Kaal Sarp?',
        answer:
          'Some astrologers distinguish partial vs full forms. This app uses a strict “all planets between Rahu–Ketu” rule; a pandit may interpret differently.',
      },
    ],
  },
  {
    key: 'shani',
    title: 'Shani (Saturn affliction)',
    affects: 'Delays, discipline tests, pressure on career, health, or emotional stability.',
    remedies: [
      'Chant Shani mantra (“Om Sham Shanicharaya Namah”) on Saturdays.',
      'Light sesame oil lamp for Shani; donate black cloth, urad dal, or iron items with good intent.',
      'Serve elders, workers, or the needy; practice patience and honest work — Saturn responds to sincerity.',
      'Avoid unnecessary conflict; build long-term habits rather than quick fixes.',
    ],
    faq: [
      {
        question: 'Is this the same as Sade Sati?',
        answer:
          'Not exactly. Sade Sati is Saturn transiting the Moon sign. This check covers natal Saturn affliction in the birth chart.',
      },
      {
        question: 'How long do remedies take?',
        answer:
          'Traditional practice is continuous (especially Saturdays) over months, combined with ethical conduct, not a one-day ritual.',
      },
    ],
  },
  {
    key: 'pitra',
    title: 'Pitra',
    affects: 'Ancestral karma, family lineage, father/sun themes, delays in blessings.',
    remedies: [
      'Perform Shraddha or tarpan for ancestors on Amavasya or during Pitru Paksha when possible.',
      'Donate food to priests, cows, or the poor in ancestors’ memory.',
      'Chant Gayatri Mantra daily; respect parents and elders.',
      'Offer water to the Sun at sunrise (“Arghya”) with gratitude.',
    ],
    faq: [
      {
        question: 'Can Pitra dosha block marriage or children?',
        answer:
          'Tradition links it to lineage karma. Effects vary by full chart; remedies focus on honoring ancestors rather than fear.',
      },
      {
        question: 'What if I don’t know my ancestors?',
        answer:
          'General prayers, charity, and Gayatri/Sun worship are commonly advised without needing specific names.',
      },
    ],
  },
  {
    key: 'guruChandal',
    title: 'Guru Chandal',
    affects: 'Wisdom, teachers, judgment, spirituality — confusion when Jupiter is with Rahu/Ketu.',
    remedies: [
      'Chant Guru mantra (“Om Gram Grim Graum Sah Gurave Namah”) on Thursdays.',
      'Wear yellow clothes on Thursdays; donate turmeric, chana dal, or yellow sweets.',
      'Study scripture or learn from a respected teacher; avoid blind faith in misleading guides.',
      'Practice truthfulness and avoid unethical shortcuts for gain.',
    ],
    faq: [
      {
        question: 'Does it mean I cannot succeed in education?',
        answer:
          'No. It suggests checking discernment in gurus/advice. Hard work and ethical Jupiter remedies are emphasized.',
      },
      {
        question: 'Yellow sapphire?',
        answer:
          'Pukhraj is prescribed only after chart suitability. Wrong gemstones can aggravate issues — consult before wearing.',
      },
    ],
  },
  {
    key: 'chandra',
    title: 'Chandra (Moon affliction)',
    affects: 'Mind, emotions, sleep, mother-related themes, mood stability.',
    remedies: [
      'Chant Chandra mantra (“Om Som Somaya Namah”) on Mondays.',
      'Wear pearl (moti) only if recommended; otherwise drink water from silver vessel, stay hydrated.',
      'Meditation, moon-gazing on Purnima, and calming routines (regular sleep).',
      'Donate white items (rice, milk, white cloth) on Mondays.',
    ],
    faq: [
      {
        question: 'Moon debilitated vs afflicted?',
        answer:
          'Debilitation is weak sign placement; affliction includes malefic conjunction/aspect. Both can appear together.',
      },
      {
        question: 'Mental health note',
        answer:
          'Astrology is complementary. Seek professional help for persistent anxiety or depression — remedies support, not replace, care.',
      },
    ],
  },
  {
    key: 'surya',
    title: 'Surya (Sun affliction)',
    affects: 'Confidence, father, authority, vitality, career visibility.',
    remedies: [
      'Offer water to the rising Sun (Surya Arghya) with “Om Suryaya Namah”.',
      'Chant Aditya Hridaya Stotra or Gayatri Mantra at sunrise.',
      'Donate wheat, copper, or red flowers on Sundays; respect father figures.',
      'Practice leadership with humility; avoid ego battles.',
    ],
    faq: [
      {
        question: 'Sun debilitated in Libra?',
        answer:
          'Sun is considered weaker in Libra. Remedies strengthen Sun energy; full chart may show compensations elsewhere.',
      },
      {
        question: 'Ruby (manik)?',
        answer:
          'Ruby is powerful for Sun but must be suitability-tested. Unsuitable gems are discouraged.',
      },
    ],
  },
];

const GUIDE_BY_KEY = new Map(DOSHA_REMEDY_GUIDES.map(g => [g.key, g]));

export function getDoshaRemedyGuide(key: keyof AllDoshaResult): DoshaRemedyGuide | undefined {
  return GUIDE_BY_KEY.get(key);
}
