'use client';

import { useState } from 'react';

import clsx from 'clsx';
import Image from 'next/image';

import Footer from '@/components/pages/landing/footer';
import AstroSewaLogo from '@/components/logo';
import NavigationMenu from '@/components/common/navbar/navigationMenu';
import Services from '@/components/pages/landing/services';
import ChevronDownIcon from '@/components/icons/chevron-down';
import UserLineIcon from '@/components/icons/user/user-line';
import LanguageEarthIcon from '@/components/icons/language/earth';
import TransparentBellIcon from '@/components/icons/bell';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { ServiceTalkToAstrologer } from '@/components/images/services';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import {
  EnglishAriesColor,
  EnglishTaurusColor,
  EnglishCancerColor,
  EnglishGeminiColor,
  EnglishLeoColor,
  EnglishVirgoColor,
  EnglishLibraColor,
  EnglishScorpioColor,
  EnglishSagittariusColor,
  EnglishCapricornColor,
  EnglishAquariusColor,
  EnglishPiscesColor,
} from '@/components/images/zodiac/english';

import LandingPageCSS from '../../landing-page.module.css';

const topNav = [
  { title: 'Horoscope', hasChildren: true },
  { title: 'Zodiac Signs', active: true, hasChildren: true },
  { title: 'Kundali', hasChildren: true },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', hasChildren: true },
  { title: 'Calculator', hasChildren: true },
  { title: 'About Us' },
  { title: 'Blog' },
  { title: 'Calendar' },
];

const signStrip = [
  { name: 'Aries', image: EnglishAriesColor, active: true },
  { name: 'Cancer', image: EnglishCancerColor },
  { name: 'Taurus', image: EnglishTaurusColor },
  { name: 'Gemini', image: EnglishGeminiColor },
  { name: 'Leo', image: EnglishLeoColor },
  { name: 'Virgo', image: EnglishVirgoColor },
  { name: 'Libra', image: EnglishLibraColor },
  { name: 'Scorpio', image: EnglishScorpioColor },
  { name: 'Sagittarius', image: EnglishSagittariusColor },
  { name: 'Capricorn', image: EnglishCapricornColor },
  { name: 'Aquarius', image: EnglishAquariusColor },
  { name: 'Pisces', image: EnglishPiscesColor },
];

const zodiacDetails = {
  title: 'Aries',
  range: '(Mar 21 - Apr 19)',
  subtitle: 'Astronomy and Astrology',
  description:
    'Aries (March 21 - April 19) – The first sign of the zodiac, Aries is ruled by Mars and symbolizes energy, courage, and new beginnings. People born under Aries are natural leaders, passionate, adventurous, and full of enthusiasm for life. They thrive on challenges and love to take initiative, though their fiery nature can sometimes make them impulsive. Aries brings boldness, motivation, and a spark of determination wherever they go.',
};

const traitCards = [
  { label: 'Element', chips: ['Air'] },
  { label: 'Ruling Planet', chips: ['Mercury'] },
  { label: 'Compatibility', chips: ['Libra, Aquarius'] },
  {
    label: 'Strengths',
    value: 'Adaptable, curious, communicative, quick-witted, versatile',
  },
  {
    label: 'Weaknesses',
    value: 'Inconsistent, indecisive, anxious, superficial, restless',
  },
  {
    label: 'Personality Traits',
    value:
      'Geminis are known for their dual nature, often displaying two different sides to their personality. They are intellectual, expressive, and enjoy variety and change. Geminis are excellent communicators and love to engage in conversations and social activities. However, they can also be indecisive and easily bored if not mentally stimulated.',
  },
];

const cardBaseText = 'Your spark can move mountains, start bold today';
const calloutButtons = [{ label: 'Chat Now' }, { label: 'Download app' }];

export default function ZodiacDetailsPage() {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);
  const otherZodiacCards = HOROSCOPE_DATA[language];

  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 py-3">
          <AstroSewaLogo className="h-[38px] w-[132px] text-[#611508] sm:h-[46px] sm:w-[162px]" />

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-full border border-[#8f6f5d] bg-[#f9f2e8] px-2.5 py-1 text-[11px] text-[#6f2618]">
              <LanguageEarthIcon />
              EN
              <ChevronDownIcon className="h-3 w-3 text-[#6f2618]" />
            </button>
            <button className="inline-flex items-center gap-1 rounded-full bg-[#6f2618] px-3 py-1.5 text-[11px] text-[#fff7ed]">
              <UserLineIcon className="h-3 w-3" />
              Sign in
            </button>
            <button className="rounded-full bg-[#6f2618] p-1.5 text-white">
              <TransparentBellIcon />
            </button>
          </div>
        </header>

        <NavigationMenu items={topNav} className="mt-2" />

        <section className="mx-auto mt-6 max-w-[1180px]">
          <div className="flex items-center gap-3 overflow-x-auto pb-3">
            {signStrip.map(item => (
              <button key={item.name} className="flex min-w-[62px] flex-col items-center gap-1">
                <div
                  className={clsx(
                    'flex h-[52px] w-[52px] items-center justify-center rounded-full border bg-[#fcf7ef] p-1.5',
                    item.active ? 'border-[#f2b400] ring-2 ring-[#f2b400]/20' : 'border-[#d7c4b0]',
                  )}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-mukta text-[10px] text-[#8a7463]">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                {zodiacDetails.title}
              </h1>
              <p className="mt-1 font-mukta text-[14px] text-[#8a7463]">
                {zodiacDetails.range} | {zodiacDetails.subtitle}
              </p>

              <div className="mt-4 max-w-[560px]">
                <p className="font-mukta text-[14px] leading-8 text-[#4f463f]">
                  {zodiacDetails.description}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#6f2618] px-4 py-2 font-mukta text-[12px] font-semibold text-[#fff7ec] hover:bg-[#581e13]">
                  View Aries Horoscope
                  <ArrowRight className="h-3 w-3 text-[#fff7ec]" />
                </button>
              </div>

              <div className="mt-6 rounded-[16px] border border-[#ead7c7] bg-[#fffaf2] p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {traitCards.map(card => (
                    <div key={card.label}>
                      <p className="font-mukta text-[12px] text-[#9a7d66]">{card.label}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {card.chips ? (
                          card.chips.map(chip => (
                            <span
                              key={chip}
                              className="rounded-full border border-[#e3c49c] bg-[#f7efd9] px-3 py-1 font-mukta text-[12px] text-[#6f2618]"
                            >
                              {chip}
                            </span>
                          ))
                        ) : (
                          <span className="font-mukta text-[13px] leading-6 text-[#4f463f]">
                            {card.value}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end">
              <div className="flex h-[260px] w-[260px] items-center justify-center rounded-full bg-[#1d2c7c] shadow-[0_10px_30px_rgba(29,44,124,0.18)] sm:h-[290px] sm:w-[290px]">
                <Image
                  src={EnglishAriesColor}
                  alt="Aries"
                  className="h-[190px] w-[190px] object-contain"
                />
              </div>
              <p className="mt-2 font-mukta text-[12px] text-[#7a5e4f]">Aries Zodiac Sign</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px]">
          <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
            Read Horoscope For Other Zodiac Sign
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLanguage(ELanguage.ENGLISH)}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === ELanguage.ENGLISH
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage(ELanguage.NEPALI)}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === ELanguage.NEPALI
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              Nepali
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {otherZodiacCards.map(card => (
              <article
                key={card.name}
                className="rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={card.image}
                    alt={card.name}
                    className="h-[46px] w-[46px] object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                        {card.name}
                      </h3>
                      <div className="flex items-center gap-0.5 text-[#ef8a20]">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <StartIcon
                            key={`${card.name}-${index}`}
                            className="h-3 w-3 text-[#ef8a20]"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                      {cardBaseText}
                    </p>
                    <button className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                      Read More
                      <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px]">
          <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
            Why Zodiac Signs Important?
          </h2>
          <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
            Zodiac signs are important because they help you understand your personality and
            relationships on a deeper level. They uncover your natural strengths, challenges, and
            compatibility with others, offering insights into your personal growth and life path.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px] rounded-[24px] bg-[#6f2618] px-6 py-6 text-[#fff7ec] shadow-[0_18px_50px_rgba(111,38,24,0.18)] sm:px-8 lg:px-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-sahitya text-[34px] leading-tight text-[#fff7ec] sm:text-[42px]">
                Find clarity today.
              </h2>
              <p className="mt-2 max-w-[540px] font-mukta text-[16px] leading-7 text-[#f8eadb] sm:text-[18px]">
                Discover Insights Through Vedic Astrology.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {calloutButtons.map(button => (
                  <button
                    key={button.label}
                    className={clsx(
                      'rounded-full border px-4 py-2 font-mukta text-[12px] font-semibold transition-colors',
                      button.label === 'Chat Now'
                        ? 'border-[#f8eadb] bg-transparent text-[#fff7ec] hover:bg-white/10'
                        : 'border-[#f8eadb] bg-[#f8eadb] text-[#6f2618] hover:bg-white',
                    )}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src={ServiceTalkToAstrologer}
                alt="Astrology chart illustration"
                className="h-[150px] w-auto object-contain sm:h-[190px] lg:h-[210px]"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-[1180px]">
          <Services />
        </div>
      </div>

      <Footer />
    </main>
  );
}
