import type { Metadata } from 'next';

import PanchangCalendarPageContent from '@/components/pages/calendar/panchang';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Panchang Calendar',
  description: 'Panchang information page',
};

export default function PanchangCalendarPage() {
  return (
    <main className="min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-10 md:space-y-[100px]">
      <PanchangCalendarPageContent />
      <Services />
      <DownloadApp />
    </main>
  );
}
