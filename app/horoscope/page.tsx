'use client';

import { Suspense } from 'react';
import clsx from 'clsx';

import { HoroscopeHeroSignsSection } from '@/components/pages/horoscope';
import Services from '@/components/pages/landing/services';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Clarity from '@/components/pages/landing/clarity';
import DownloadApp from '@/components/pages/landing/download-app';
import { useHoroscopeLocale } from '@/lib/i18n';

function HoroscopePageContent() {
  const { dict } = useHoroscopeLocale();

  return (
    <main className="container mx-auto min-h-screen overflow-hidden">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 sm:h-72" />
        <div className="mx-auto px-3">
          <HoroscopeHeroSignsSection />

          <section className={clsx('mx-auto mt-8 px-2 sm:mt-10 sm:px-3 lg:mt-12 lg:px-4')}>
            <h2
              className={clsx(
                'font-tiro-devanagari leading-tight text-[#611508] text-left',
                'text-[22px] sm:text-[26px] font-bold lg:text-[32px]',
              )}
            >
              {dict.section.whatIsTitle}
            </h2>

            <div className="mx-auto mt-3 space-y-4 text-left font-mukta text-[20px] leading-7 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[15px] sm:leading-8 lg:mt-5 lg:text-[16px] lg:leading-8">
              <p>{dict.section.whatIsP1}</p>
              <p>{dict.section.whatIsP2}</p>
            </div>
          </section>

          <section className={clsx('mx-auto mt-8 px-2 sm:mt-10 sm:px-3 lg:mt-10 lg:px-4')}>
            <h2
              className={clsx(
                'font-tiro-devanagari font-bold leading-tight text-[#611508] text-left',
                'text-[22px] sm:text-[26px] lg:text-[32px]',
              )}
            >
              {dict.section.whyTitle}
            </h2>
            <div className="mx-auto mt-3 space-y-4 text-left font-mukta text-[20px] leading-7 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[15px] sm:leading-8 lg:mt-5 lg:text-[16px] lg:leading-8">
              <p>{dict.section.whyP1}</p>
              <p>{dict.section.whyP2}</p>
            </div>
          </section>

          <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
          <Clarity />
        </div>
      </div>

      <Services />
      <DownloadApp />
    </main>
  );
}

function HoroscopePageFallback() {
  const { dict } = useHoroscopeLocale();
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="mx-auto px-4 py-16 text-center font-mukta text-[14px] text-[#6b5a4e] sm:py-20 sm:text-[15px]">
        {dict.list.loading}
      </div>
    </main>
  );
}

export default function HoroscopePage() {
  return (
    <Suspense fallback={<HoroscopePageFallback />}>
      <HoroscopePageContent />
    </Suspense>
  );
}
