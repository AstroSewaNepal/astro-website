'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import NavigationMenu, { type NavigationMenuItem } from '@/components/common/navbar/navigationMenu';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import Services from '@/components/pages/landing/services';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Footer from '@/components/pages/landing/footer';

import LandingPageCSS from '../landing-page.module.css';
const NAV_ITEMS: NavigationMenuItem[] = [
  { title: 'Horoscope', active: true, hasChildren: true },
  { title: 'Zodiac Signs', hasChildren: true },
  { title: 'Kundali', hasChildren: true },
  { title: 'Compatibility', hasChildren: false },
  { title: 'Puja Bidhi', hasChildren: true },
  { title: 'Calculator', hasChildren: true },
  { title: 'About Us', hasChildren: false },
  { title: 'Blog', hasChildren: false },
  { title: 'Calendar', hasChildren: false },
];

const HERO_COPY = {
  [ELanguage.ENGLISH]: {
    title: "Today's Astrology Horoscope",
    intro:
      'See your horoscope for today with a calm, traditional presentation that keeps the zodiac at the center of the page.',
  },
  [ELanguage.NEPALI]: {
    title: 'आजको ज्योतिषीय राशिफल',
    intro:
      'आजको राशिफललाई नेपाली भाषामा स्पष्ट र सजिलो शैलीमा हेर्नुहोस्, जहाँ प्रत्येक राशि छुट्टै रूपमा प्रस्तुत गरिएको छ।',
  },
} as const;

const DESCRIPTION =
  'Your spark can move mountains, start bold today. Read the guidance below and follow the signals that feel grounded, practical, and useful for the day ahead.';

export default function HoroscopePage() {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);

  const cards = HOROSCOPE_DATA[language];
  const copy = HERO_COPY[language];

  return (
    <main className={clsx('min-h-screen overflow-hidden', LandingPageCSS.background)}>
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(255,255,255,0)_65%)]" />
        <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <NavigationMenu items={NAV_ITEMS} />

          <section className="mt-4 rounded-[30px] border border-[#d9c3ad] bg-[rgba(249,242,233,0.88)] px-3 py-4 shadow-[0_18px_60px_rgba(92,56,23,0.12)] backdrop-blur-[2px] sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="font-sahitya text-[34px] leading-none text-[#6b2417] sm:text-[44px] lg:text-[62px]">
                {copy.title}
              </h1>

              <div className="mt-5 flex items-center justify-center gap-2 text-[#ef8a20]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <StartIcon key={`title-star-${index}`} className="h-4 w-4 text-[#ef8a20]" />
                ))}
              </div>

              <p className="mx-auto mt-4 max-w-3xl font-mukta text-[14px] leading-7 text-[#6b5a4e] sm:text-[16px]">
                {copy.intro}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage(ELanguage.ENGLISH)}
                  className={clsx(
                    'rounded-full border px-6 py-2.5 font-mukta text-[15px] transition-colors',
                    language === ELanguage.ENGLISH
                      ? 'border-[#6f2618] bg-[#6f2618] text-white'
                      : 'border-[#b48f74] bg-transparent text-[#6f2618] hover:bg-white/50',
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage(ELanguage.NEPALI)}
                  className={clsx(
                    'rounded-full border px-6 py-2.5 font-mukta text-[15px] transition-colors',
                    language === ELanguage.NEPALI
                      ? 'border-[#6f2618] bg-[#6f2618] text-white'
                      : 'border-[#b48f74] bg-transparent text-[#6f2618] hover:bg-white/50',
                  )}
                >
                  Nepali
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              {cards.map(card => (
                <article
                  key={card.name}
                  className="rounded-[26px] border border-[#c8ad93] bg-[#fbf6ee]/90 px-4 py-3 shadow-[0_6px_20px_rgba(97,21,8,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-[22px] border border-[#dfcebc] bg-[#f4eadf]">
                      <Image
                        src={card.image}
                        alt={card.name}
                        className="h-[60px] w-[60px] object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <h2 className="truncate font-mukta text-[15px] font-bold leading-6 text-[#742718] sm:text-[16px]">
                          {card.name}
                        </h2>
                        <div className="flex items-center gap-0.5 text-[#ef8a20]">
                          {Array.from({ length: 3 }).map((_, starIndex) => (
                            <StartIcon
                              key={`${card.name}-star-${starIndex}`}
                              className="h-3.5 w-3.5 text-[#ef8a20]"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-1 line-clamp-2 font-mukta text-[11px] leading-[1.35] text-[#706258]">
                        {DESCRIPTION}
                      </p>

                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[12px] font-semibold text-[#7b3b27]"
                      >
                        <span>Read More</span>
                        <ArrowRight className="h-3 w-3 text-[#7b3b27]" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="mx-auto mt-10 max-w-[1180px] px-1 sm:px-2 lg:mt-12">
            <h2 className="font-sahitya text-[26px] font-bold leading-tight text-[#6b2417] sm:text-[28px] lg:text-[30px]">
              What is Horoscope?
            </h2>

            <div className="mt-4 space-y-5 font-mukta text-[15px] leading-8 text-[#5f5248] sm:text-[16px]">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </section>

          <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

          <div className="mx-auto mt-14 max-w-[1180px]">
            <Services />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
