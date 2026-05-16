import type { StaticImageData } from 'next/image';

import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';

import type { MangalDoshaLevel } from './determine-mangal-dosha';

export type MangalDoshaMeta = {
  level: MangalDoshaLevel;
  title: string;
  subtitle: string;
  image: StaticImageData;
  description: string;
};

export const MANGAL_DOSHA_METADATA: MangalDoshaMeta[] = [
  {
    level: 'present',
    title: 'Mangal Dosha Present',
    subtitle: 'May influence marriage timing and harmony',
    image: MangalDoshaImage,
    description:
      'Mangal Dosha is present and can influence your marriage life. Consider consulting an astrologer for guidance and remedies tailored to your birth chart.',
  },
  {
    level: 'mild',
    title: 'Mild Mangal Dosha',
    subtitle: 'Generally manageable with awareness',
    image: MangalDoshaImage,
    description:
      'Mangal Dosha is mild and may not create major issues. A balanced approach, patience, and thoughtful matching can help reduce tension in relationships.',
  },
  {
    level: 'none',
    title: 'No Major Mangal Dosha',
    subtitle: 'Marriage prospects appear stable',
    image: MangalDoshaImage,
    description:
      'No major Mangal Dosha is indicated from your birth date pattern. Your marriage prospects appear stable, though a full chart review gives the most accurate picture.',
  },
];

const BY_LEVEL = new Map(MANGAL_DOSHA_METADATA.map(meta => [meta.level, meta]));

export function getMangalDoshaMeta(level: MangalDoshaLevel): MangalDoshaMeta | undefined {
  return BY_LEVEL.get(level);
}
