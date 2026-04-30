'use client';

import { useState } from 'react';

import clsx from 'clsx';
import Image from 'next/image';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import {
  EnglishAquariusColor,
  EnglishAriesColor,
  EnglishCancerColor,
  EnglishCapricornColor,
  EnglishGeminiColor,
  EnglishLeoColor,
  EnglishLibraColor,
  EnglishPiscesColor,
  EnglishSagittariusColor,
  EnglishScorpioColor,
  EnglishTaurusColor,
  EnglishVirgoColor,
} from '@/components/images/zodiac/english';

import LandingPageCSS from '../landing-page.module.css';

const zodiacCards = [
  { name: 'Aries', image: EnglishAriesColor },
  { name: 'Taurus', image: EnglishTaurusColor },
  { name: 'Cancer', image: EnglishCancerColor },
  { name: 'Gemini', image: EnglishGeminiColor },
  { name: 'Leo', image: EnglishLeoColor },
  { name: 'Virgo', image: EnglishVirgoColor },
  { name: 'Libra', image: EnglishLibraColor },
  { name: 'Scorpio', image: EnglishScorpioColor },
  { name: 'Sagittarius', image: EnglishSagittariusColor },
  { name: 'Aquarius', image: EnglishAquariusColor },
  { name: 'Pisces', image: EnglishPiscesColor },
  { name: 'Capricorn', image: EnglishCapricornColor },
];

const shortCardText = 'Your spark can move mountains, start bold today';
const zodiacIntro =
  "A zodiac sign is determined by the position of the Sun at the time of your birth. The zodiac is divided into 12 signs, each reflecting unique personality traits, strengths, and characteristics. Your zodiac sign acts like your cosmic identity — it reveals how you express yourself, interact with others, and approach life's journey.";

const zodiacDetails =
  'Zodiac signs are the twelve divisions of the celestial sky, each representing unique traits, energies, and life paths. Based on the position of the Sun at the time of your birth, your zodiac sign acts as a cosmic guide that shapes your personality, behavior, and the way you connect with others. From fiery Aries to dreamy Pisces, every sign carries distinct qualities that influence emotions, strengths, challenges, and compatibility.';

const whyZodiacImportant =
  'Zodiac signs are important because they help you understand your personality and relationships on a deeper level. They uncover your natural strengths, challenges, and compatibility with others, offering insights into your personal growth and life path.';

export default function ZodiacSignsPage() {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);
  const bottomCards = HOROSCOPE_DATA[ELanguage.ENGLISH];

  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-8 max-w-[1180px]">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                Zodiac Sign
              </h1>
              <p className="mt-2 font-mukta text-[18px] text-[#111111]">Find your Zodiac Sign</p>
            </div>

            <div className="flex justify-start lg:justify-end">
              <div className="text-right font-sahitya text-[20px] font-bold text-[#6b2417] sm:text-[24px]">
                Zodiac Insight
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#d8c2ae] bg-[#f7eedf]/95 p-5 sm:p-6">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              What is Zodiac Sign?
            </h2>
            <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">{zodiacIntro}</p>

            <div className="mt-6 flex flex-wrap gap-3">
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

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {zodiacCards.map(item => (
                <article
                  key={item.name}
                  className="rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="h-[46px] w-[46px] object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-[#ef8a20]">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <StartIcon
                              key={`${item.name}-${index}`}
                              className="h-3 w-3 text-[#ef8a20]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                        {shortCardText}
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

            <p className="mt-6 font-mukta text-[14px] leading-8 text-[#4f463f]">{zodiacDetails}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              Why Zodiac Signs Important?
            </h2>
            <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
              {whyZodiacImportant}
            </p>
          </div>
        </section>

        <TalkToOurAstrologer className="mx-auto mt-12 max-w-[1180px]" />

        <div className="mx-auto mt-12 max-w-[1180px]">
          <div className="rounded-[18px] border border-[#ead7c7] bg-[#f8efe3] p-5">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              Read Horoscope For Other Zodiac Signs
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {bottomCards.map(card => (
                <article
                  key={card.name}
                  className="rounded-[16px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={card.image}
                      alt={card.name}
                      className="h-[44px] w-[44px] object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                          {card.name}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <StartIcon
                              key={`${card.name}-${index}`}
                              className="h-3 w-3 text-[#ef8a20]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                        {shortCardText}
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
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1180px]">
          <Services />
        </div>
      </div>

      <Footer />
    </main>
  );
}
