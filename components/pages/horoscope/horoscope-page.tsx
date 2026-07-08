'use client';

import { Suspense } from 'react';
import clsx from 'clsx';

import { HoroscopeHeroSignsSection } from '@/components/pages/horoscope';
import Services from '@/components/pages/landing/services';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Clarity from '@/components/pages/landing/clarity';
import DownloadApp from '@/components/pages/landing/download-app';
import QNASComponent from '@/components/common/qnas-component';
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

          <section className={clsx('container mx-auto px-6 lg:px-0 border-b border-b-[#79787A] pb-6 md:pb-[50px] mt-10 sm:mt-12 lg:mt-14')}>
            <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
              <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
                Frequently Asked Questions
              </h2>
              <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
                Find quick answers to common questions about daily and weekly horoscope readings so you can use AstroSewa with confidence.
              </p>
            </div>
            <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
              <QNASComponent
                question="What Is the Difference Between a Daily and a Weekly Horoscope?"
                answer="A daily horoscope focuses on the planetary positions and transits happening that specific day. It is most useful for spotting short-term opportunities, energy levels, and anything to be mindful of in your immediate environment. A weekly horoscope looks at the broader planetary picture for the week and is better for planning ahead, understanding themes, and preparing for larger shifts. AstroSewa offers both daily and weekly horoscopes for all 12 signs."
                isDefaultOpen
              />
              <QNASComponent
                question="Should I Read My Sun Sign or Moon Sign Horoscope?"
                answer="In Western astrology, horoscopes are written for sun signs. In Vedic astrology, the moon sign (Rashi) is considered more important for understanding your inner world and emotional responses. If you know your Vedic Rashi, reading the horoscope for your moon sign will generally feel more accurate and personal than reading for your sun sign. If you do not know your Rashi, you can find it using the free Rashi Calculator on AstroSewa."
              />
            </div>
          </section>

          <TalkToOurAstrologer
            title="Want a Reading Specific to You?"
            description="A daily horoscope gives you the general planetary weather for your sign. A personal consultation looks at how that energy interacts with your specific birth chart, including your Rashi, Dasha period, and Lagna. If you are going through an important or uncertain time, our verified astrologers can give you a reading built around your life and not just your sign."
            descriptionClassName="max-w-full"
            className="mx-auto mt-10 max-w-[1180px] sm:mt-14"
          />
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

export default function HoroscopeClientPage() {
  return (
    <Suspense fallback={<HoroscopePageFallback />}>
      <HoroscopePageContent />
    </Suspense>
  );
}
