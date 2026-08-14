import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Props = {
  params: { sign: string; type?: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const sign = resolvedParams.sign || 'Zodiac';
  const typeArray = resolvedParams.type || [];
  const type = typeArray[0] || 'today';

  const signCapitalized = sign.charAt(0).toUpperCase() + sign.slice(1);
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

  const title = `${signCapitalized} ${typeCapitalized} Horoscope`;
  const canonical = `/horoscope/${sign}${type === 'today' ? '' : `/${type}`}`;

  return {
    title,
    description: `Read your detailed ${typeCapitalized} horoscope for ${signCapitalized}. Get personalized astrological predictions for love, career, health, and finances.`,
    keywords: [
      `${sign} horoscope`,
      `${type} horoscope`,
      'daily horoscope',
      'zodiac horoscope',
      'vedic horoscope',
      'horoscope prediction Nepal',
    ],
    alternates: {
      canonical,
    },
  };
}

export default function HoroscopeDetailsLayout({ children }: { children: ReactNode }) {
  return children;
}
