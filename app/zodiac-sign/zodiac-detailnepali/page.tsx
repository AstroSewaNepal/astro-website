'use client';

import { useState } from 'react';

import clsx from 'clsx';
import Image from 'next/image';

import AstroSewaLogo from '@/components/logo';
import NavigationMenu from '@/components/common/navbar/navigationMenu';
import LandingFAQ from '@/components/pages/landing/faq';
import Footer from '@/components/pages/landing/footer';
import ChevronDownIcon from '@/components/icons/chevron-down';
import UserLineIcon from '@/components/icons/user/user-line';
import LanguageEarthIcon from '@/components/icons/language/earth';
import TransparentBellIcon from '@/components/icons/bell';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import {
  EnglishAriesLight,
  EnglishTaurusLight,
  EnglishCancerLight,
  EnglishGeminiLight,
  EnglishLeoLight,
  EnglishVirgoLight,
  EnglishLibraLight,
  EnglishScorpioLight,
  EnglishSagittariusLight,
  EnglishAquariusLight,
  EnglishPiscesLight,
  EnglishCapricornLight,
} from '@/components/images/zodiac/english';

import LandingPageCSS from '../../landing-page.module.css';

const topNav = [
  { title: 'Horoscope', active: true, hasChildren: true },
  { title: 'Zodiac Signs', hasChildren: true },
  { title: 'Kundali', hasChildren: true },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', hasChildren: true },
  { title: 'Calculator', hasChildren: true },
  { title: 'About Us' },
  { title: 'Blog' },
  { title: 'Calendar' },
];

const zodiacCards = [
  { name: 'Aries', image: EnglishAriesLight },
  { name: 'Taurus', image: EnglishTaurusLight },
  { name: 'Cancer', image: EnglishCancerLight },
  { name: 'Gemini', image: EnglishGeminiLight },
  { name: 'Leo', image: EnglishLeoLight },
  { name: 'Virgo', image: EnglishVirgoLight },
  { name: 'Libra', image: EnglishLibraLight },
  { name: 'Scorpio', image: EnglishScorpioLight },
  { name: 'Sagittarius', image: EnglishSagittariusLight },
  { name: 'Aquarius', image: EnglishAquariusLight },
  { name: 'Pisces', image: EnglishPiscesLight },
  { name: 'Capricorn', image: EnglishCapricornLight },
];

const traits = [
  { label: 'तत्व', value: 'अग्नि' },
  { label: 'राशिको ग्रह', value: 'मंगल ग्रह' },
  { label: 'सामञ्जस्यपूर्ण राशि', value: 'सिंह, धनु राशिहरु' },
  { label: 'नकारात्मक पक्ष', value: 'अहंकारी, चिढिने स्वभाव' },
  { label: 'मित्र राशि', value: 'सिंह, धनु' },
  { label: 'व्यक्तित्व विशेषता', value: 'ऊर्जावान, साहसी, अग्रसर नेता' },
];

const cardText = 'Your spark can move mountains, start bold today';

export default function ZodiacDetailNepaliPage() {
  const [language, setLanguage] = useState<'english' | 'nepali'>('english');

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
          <p className="font-mukta text-[11px] text-[#7a6658]">
            Home &gt; Zodiac Sign - Nepali &gt; Zodiac Sign Detail
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                मेष
              </h1>
              <p className="mt-1 font-mukta text-[14px] text-[#8a7463]">मेष - रेसन ए</p>

              <p className="mt-3 max-w-[860px] font-mukta text-[13px] leading-7 text-[#4f463f]">
                यो पृष्ठमा मेष राशिको बारेमा नेपालीमा विस्तृत जानकारी राखिएको छ। मेष राशिका जातकहरू
                ऊर्जावान, साहसी र नेतृत्वशील स्वभावका हुन्छन्। चुनौतीलाई अवसरमा बदल्ने क्षमता यी
                व्यक्तिहरूमा बढी देखिन्छ। सकारात्मक पक्षसँगै कहिलेकाहीं अधैर्य वा आवेग पनि देखिन
                सक्छ, त्यसैले सन्तुलनमा ध्यान दिनु राम्रो मानिन्छ।
              </p>
            </div>

            <div className="rounded-[10px] bg-[#f4ead2] p-5">
              <Image
                src={EnglishAriesLight}
                alt="Mesha"
                className="mx-auto h-[80px] w-[80px] object-contain"
              />
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[8px] border border-[#ebe0d4]">
            <table className="w-full min-w-[700px] border-collapse">
              <tbody>
                {traits.map(row => (
                  <tr key={row.label} className="border-b border-[#ebe0d4] last:border-b-0">
                    <td className="w-[36%] px-4 py-3 font-mukta text-[13px] text-[#7c6556]">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 font-mukta text-[13px] text-[#4f463f]">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLanguage('english')}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === 'english'
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('nepali')}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === 'nepali'
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              Nepali
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                      {cardText}
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

          <div className="mt-16">
            <LandingFAQ />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
