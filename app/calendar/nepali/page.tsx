import type { Metadata } from 'next';

import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import NepaliCalendarPageContent from '@/components/pages/calendar/nepali';

export const metadata: Metadata = {
  title: 'Nepali Calendar 2083 BS | AstroSewa',
  description:
    'Browse the Nepali Calendar 2083 BS with Bikram Sambat dates, Gregorian equivalents, and Nepali festivals. Your go-to Nepali patro online.',
  keywords: [
    'Nepali Calendar 2083 BS | AstroSewa',
    'Bikram Sambat calendar',
    'Nepali patro',
    'BS calendar online',
    'Nepali festival dates',
    'Nepali calendar 2083 BS',
  ],
};



export default function NepaliCalendarPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="px-6 lg:px-0">

        <section className="w-full">
          <NepaliCalendarPageContent />
        </section>

        
        <section className="w-full pt-6 md:pt-10">

          <Clarity />
          <br />

        </section>

        <section className="w-full pt-6 md:pt-10">
          <TalkToOurAstrologer className="mx-auto max-w-[1180px]" />
          <br />
        </section>

        <section className="w-full pt-6 md:pt-10">
          <Services />
        </section>
        <section className="w-full pt-6 md:pt-10 ">
          <hr className="border-t border-[#79787A] opacity-70" />
          <DownloadApp />
        </section>
      </div>
    </main>
  );
}
