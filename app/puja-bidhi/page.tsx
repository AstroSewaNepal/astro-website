import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Puja Bidhi — Hindu Rituals & Worship Guides',
  description:
    'Discover detailed Puja Bidhi (worship procedures) for Hindu rituals and festivals. Step-by-step puja guides, mantras, and spiritual practices from Astro Sewa Nepal.',
  keywords: [
    'puja bidhi',
    'hindu puja procedure',
    'nepali puja',
    'worship guide Nepal',
    'puja mantra',
    'hindu rituals Nepal',
    'vedic puja',
  ],
  alternates: {
    canonical: '/puja-bidhi',
  },
  openGraph: {
    title: 'Puja Bidhi — Hindu Rituals & Worship Guides | Astro Sewa',
    description:
      "Step-by-step Hindu puja procedures, mantras, and ritual guides for Nepal's festivals and daily worship.",
  },
};

// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';

import DownloadApp from '@/components/pages/landing/download-app';
import PujaBidhiHeader from '@/components/pages/puja-bidhi/header';

const PujaBidhiPage = () => {
  return (
    <main className="min-h-screen space-y-[100px]">
      <div>
        <PujaBidhiHeader />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
    </main>
  );
};

export default PujaBidhiPage;
