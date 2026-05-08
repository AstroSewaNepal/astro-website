import type { Metadata } from 'next';

import KundaliResultSection from '@/components/pages/free-kundali/kundali-result-section';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Kundali Result',
  description: 'View your generated free kundali result.',
  alternates: {
    canonical: '/free-kundali/result',
  },
};

export default function FreeKundaliResultPage() {
  return (
    <main className="space-y-10 md:space-y-[100px]">
      <KundaliResultSection />
      <Services />
      <DownloadApp />
    </main>
  );
}
