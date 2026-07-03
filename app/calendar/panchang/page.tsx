import type { Metadata } from 'next';

import PanchangCalendarPageContent from '@/components/pages/calendar/panchang';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Panchang Calendar | AstroSewa',
  description:
    "Check today's Panchang: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, and sunrise for your city. Updated daily. Plan your day now.",
  keywords: [
    'Panchang calendar',
    'Panchang today',
    'Tithi today',
    'auspicious time today',
    'Hindu calendar timings',
    'Nakshatra today',
  ],
};

export default function PanchangCalendarPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-10 md:space-y-[100px]">
      <PanchangCalendarPageContent />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
