import type { Metadata } from 'next';

import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import NepaliCalendarPageContent from '@/components/pages/calendar/nepali';

export const metadata: Metadata = {
  title: 'Nepali Calendar',
  description: 'Nepali calendar information page',
};

export default function NepaliCalendarPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-10 md:space-y-[100px]">
      <NepaliCalendarPageContent />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
