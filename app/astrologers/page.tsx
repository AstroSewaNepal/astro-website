import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AstroConnectList } from '@/components/astrologers/astro-connect-list';

export const metadata: Metadata = {
  title: 'Talk to Astrologer',
  description:
    'Find a verified AstroSewa astrologer by expertise, language and rating, and book a chat or call consultation.',
  alternates: { canonical: '/astrologers' },
};

export default function AstrologersPage() {
  return (
    // useSearchParams (the filters) needs a Suspense boundary.
    <Suspense fallback={null}>
      <AstroConnectList />
    </Suspense>
  );
}
