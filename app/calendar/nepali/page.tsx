import type { Metadata } from 'next';

import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import NepaliCalendarPageContent from '@/components/pages/calendar/nepali';

export const metadata: Metadata = {
  title: 'Nepali Calendar',
  description: 'Nepali calendar information page',
};

export default function NepaliCalendarPage() {
  return (
    <main className="space-y-10 md:space-y-[100px]">
      <NepaliCalendarPageContent />
      <Services />
      <DownloadApp />
    </main>
  );
}
