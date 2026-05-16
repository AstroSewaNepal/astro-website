import type { StaticImageData } from 'next/image';

import MoonPhaseImage from '@/components/images/calculator/moonphase.png';

import type { MoonPhaseName } from './determine-moon-phase';

export type MoonPhaseMeta = {
  phase: MoonPhaseName;
  title: string;
  subtitle: string;
  image: StaticImageData;
  description: string;
};

export const MOON_PHASE_METADATA: MoonPhaseMeta[] = [
  {
    phase: 'New Moon',
    title: 'New Moon',
    subtitle: 'Beginnings and fresh intentions',
    image: MoonPhaseImage,
    description:
      'The New Moon marks a time of new beginnings, quiet reflection, and setting intentions. Emotions may feel inward as you plant seeds for the cycle ahead.',
  },
  {
    phase: 'Waxing Crescent',
    title: 'Waxing Crescent',
    subtitle: 'Growth and building momentum',
    image: MoonPhaseImage,
    description:
      'Energy builds gradually during the Waxing Crescent. This phase supports taking first steps, nurturing ideas, and staying open to possibility.',
  },
  {
    phase: 'First Quarter',
    title: 'First Quarter',
    subtitle: 'Action and decision-making',
    image: MoonPhaseImage,
    description:
      'The First Quarter brings tension that motivates action. Challenges can clarify priorities and help you commit to meaningful progress.',
  },
  {
    phase: 'Waxing Gibbous',
    title: 'Waxing Gibbous',
    subtitle: 'Refinement before culmination',
    image: MoonPhaseImage,
    description:
      'During the Waxing Gibbous, focus turns to refinement and preparation. Adjust details, stay patient, and align your efforts with your goals.',
  },
  {
    phase: 'Full Moon',
    title: 'Full Moon',
    subtitle: 'Illumination and emotional peak',
    image: MoonPhaseImage,
    description:
      'The Full Moon heightens emotions and brings matters to light. Insights, celebrations, and release often surface under this luminous energy.',
  },
  {
    phase: 'Waning Gibbous',
    title: 'Waning Gibbous',
    subtitle: 'Gratitude and sharing wisdom',
    image: MoonPhaseImage,
    description:
      'The Waning Gibbous invites gratitude and integration. Share what you have learned and soften your pace as the cycle begins to wane.',
  },
  {
    phase: 'Last Quarter',
    title: 'Last Quarter',
    subtitle: 'Release and reorientation',
    image: MoonPhaseImage,
    description:
      'The Last Quarter supports letting go of what no longer serves you. Reflect, forgive, and make space for the next lunar chapter.',
  },
  {
    phase: 'Waning Crescent',
    title: 'Waning Crescent',
    subtitle: 'Rest and spiritual closure',
    image: MoonPhaseImage,
    description:
      'The Waning Crescent favors rest, dreams, and quiet closure. Slow down, restore your energy, and prepare for renewal at the next New Moon.',
  },
];

const BY_PHASE = new Map(MOON_PHASE_METADATA.map(meta => [meta.phase, meta]));

export function getMoonPhaseMeta(phase: MoonPhaseName): MoonPhaseMeta | undefined {
  return BY_PHASE.get(phase);
}
