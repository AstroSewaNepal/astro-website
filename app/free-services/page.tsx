import type { Metadata } from 'next';

import { FreeServices } from '@/components/free-services/free-services';

export const metadata: Metadata = {
  title: 'Free Services',
  description:
    'Free kundali, kundali matching, daily horoscope and the Nepali calendar from AstroSewa, plus your saved astro reports.',
  alternates: { canonical: '/free-services' },
};

export default function FreeServicesPage() {
  return <FreeServices />;
}
