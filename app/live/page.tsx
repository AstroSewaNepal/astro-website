import type { Metadata } from 'next';

import { LiveFeed } from '@/components/live/live-feed';

export const metadata: Metadata = {
  title: 'Live Astrologers',
  description: 'Watch AstroSewa astrologers live, chat with them and take a paid live call.',
  alternates: { canonical: '/live' },
};

export default function LivePage() {
  return <LiveFeed />;
}
