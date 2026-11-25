import type { Metadata } from 'next';

import { RemedyCategories } from '@/components/remedies/remedy-categories';

export const metadata: Metadata = {
  title: 'Remedies',
  description:
    'Pujas, rituals, gemstones and spiritual products recommended by AstroSewa astrologers, delivered to you.',
  alternates: { canonical: '/remedies' },
};

export default function RemediesPage() {
  return <RemedyCategories />;
}
