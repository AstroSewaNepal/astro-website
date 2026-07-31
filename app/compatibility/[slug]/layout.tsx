import type { Metadata } from 'next';
import { parseCompatibilitySlug } from '@/lib/constants/compatibility-nav';

type Props = {
  params: { slug: string };
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const parsed = parseCompatibilitySlug(resolvedParams.slug);

  const defaultTitle = 'Compatibility Match Results';
  const defaultDesc =
    'View your detailed zodiac compatibility results — love, friendship, communication, and more. Get Vedic astrology insights for your sign pairing from Astro Sewa.';

  if (!parsed?.yourSign || !parsed?.partnerSign || !parsed?.yourGender || !parsed?.partnerGender) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      keywords: [
        'zodiac compatibility match',
        'love compatibility result',
        'sign match astrology',
        'vedic compatibility score',
        'kundali matching result',
      ],
      alternates: {
        canonical: '/compatibility',
      },
    };
  }

  const yg = parsed.yourGender === 'male' ? 'Man' : 'Woman';
  const pg = parsed.partnerGender === 'male' ? 'Man' : 'Woman';
  const ys = capitalize(parsed.yourSign);
  const ps = capitalize(parsed.partnerSign);

  const title = `${ys} ${yg} and ${ps} ${pg} Compatibility Match Results`;
  const description = `See the detailed zodiac compatibility match for ${ys} ${yg} and ${ps} ${pg} based on Vedic astrology. Discover your scores for love, friendship, sex, and communication.`;

  return {
    title,
    description,
    keywords: [
      `${parsed.yourSign} and ${parsed.partnerSign} compatibility`,
      `${parsed.yourSign} ${parsed.yourGender} ${parsed.partnerSign} ${parsed.partnerGender}`,
      'zodiac compatibility match',
      'love compatibility result',
      'sign match astrology',
      'vedic compatibility score',
    ],
    alternates: {
      canonical: `/compatibility/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${title} | Astro Sewa`,
      description,
    },
  };
}

export default function CompatibilityMatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
