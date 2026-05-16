import type { StaticImageData } from 'next/image';

import DashaImage from '@/components/images/calculator/dasha.png';

export type DashaMeta = {
  cycle: number;
  title: string;
  subtitle: string;
  image: StaticImageData;
  description: string;
};

const DASHA_DESCRIPTIONS: Record<number, string> = {
  1:
    'This dasha cycle emphasizes new beginnings, self-discovery, and personal initiative. It is a time to build confidence and take purposeful steps forward.',
  2:
    'This period highlights relationships, cooperation, and emotional balance. Partnerships and diplomacy play a stronger role in your life path.',
  3:
    'Creativity, communication, and expression come to the forefront. Learning, teaching, and sharing ideas can bring meaningful growth.',
  4:
    'Stability, home, and foundations are central themes. Focus on security, family matters, and building long-term support systems.',
  5:
    'Change, curiosity, and expansion define this cycle. Travel, education, and broader perspectives may open new opportunities.',
  6:
    'Responsibility, service, and harmony take priority. Health routines, daily discipline, and caring for others bring fulfillment.',
  7:
    'Reflection, spirituality, and inner wisdom are emphasized. Meditation, study, and quiet growth support deeper understanding.',
  8:
    'Ambition, discipline, and achievement are highlighted. Hard work, structure, and perseverance can lead to lasting results.',
  9:
    'Completion, compassion, and humanitarian values mark this phase. Letting go of the old makes room for wisdom and renewal.',
};

export const DASHA_METADATA: DashaMeta[] = Array.from({ length: 9 }, (_, i) => {
  const cycle = i + 1;
  return {
    cycle,
    title: `Dasha Cycle ${cycle}`,
    subtitle: 'Major planetary period indicator',
    image: DashaImage,
    description: DASHA_DESCRIPTIONS[cycle],
  };
});

const BY_CYCLE = new Map(DASHA_METADATA.map(meta => [meta.cycle, meta]));

export function getDashaMeta(cycle: number): DashaMeta | undefined {
  return BY_CYCLE.get(cycle);
}
