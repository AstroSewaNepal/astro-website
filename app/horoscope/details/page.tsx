import clsx from 'clsx';
import Image from 'next/image';

import Footer from '@/components/pages/landing/footer';
import AstroSewaLogo from '@/components/logo';
import NavigationMenu from '@/components/common/navbar/navigationMenu';
import ChevronDownIcon from '@/components/icons/chevron-down';
import UserLineIcon from '@/components/icons/user/user-line';
import LanguageEarthIcon from '@/components/icons/language/earth';
import TransparentBellIcon from '@/components/icons/bell';
import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
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

import LandingPageCSS from '../../landing-page.module.css';

const topNav = [
  { title: 'Horoscope', active: true },
  { title: 'Zodiac Signs' },
  { title: 'Kundali' },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi' },
  { title: 'Calculator' },
  { title: 'About Us' },
  { title: 'Blog' },
  { title: 'Calendar' },
];

const zodiacStrip = [
  { name: 'Cancer', image: EnglishCancerColor, selected: true },
  { name: 'Aries', image: EnglishAriesColor },
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

const dateTabs = ['Yesterday', 'Today', 'Weekly', 'Tomorrow', 'Monthly', '2025'];
const detailPills = [
  'Love & Relationships',
  'Personal Life',
  'Career & Finance',
  'Health & Wellness',
  'Emotions & Mind',
  'Lucky Insights',
  'Travel & Fun',
];

const compatibilitySigns = [
  { name: 'Aries', image: EnglishAriesColor },
  { name: 'Taurus', image: EnglishTaurusColor },
  { name: 'Gemini', image: EnglishGeminiColor },
  { name: 'Cancer', image: EnglishCancerColor },
  { name: 'Leo', image: EnglishLeoColor },
  { name: 'Virgo', image: EnglishVirgoColor },
  { name: 'Libra', image: EnglishLibraColor },
  { name: 'Scorpio', image: EnglishScorpioColor },
  { name: 'Sagittarius', image: EnglishSagittariusColor },
  { name: 'Capricorn', image: EnglishCapricornColor },
  { name: 'Aquarius', image: EnglishAquariusColor },
  { name: 'Pisces', image: EnglishPiscesColor },
];

const detailText =
  'You will perhaps find today a little dry for your taste. The celestial energy means that you have every chance of spending the day in deep conversation, rather than enjoying the finer and subtler qualities of feeling and the delicacies of love. The most you can hope for is to try and persuade your loved one to watch a romantic movie on the grounds that you can review it - second hand is better than nothing at all.';

const extendedText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export default function HoroscopeDetailsPage() {
  const bottomCards = HOROSCOPE_DATA[ELanguage.ENGLISH];

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

        <section className="mt-7 rounded-[20px] border border-[#dcccbc] bg-[#f9f2e8]/95 px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="font-sahitya text-[30px] leading-none text-[#6f2618] sm:text-[44px]">
            Today&apos;s Horoscope
          </h1>
          <p className="mt-1 font-mukta text-sm text-[#7a6a5e]">
            Check your today&apos;s horoscope
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {zodiacStrip.map(item => (
              <button key={item.name} className="group flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    'flex h-[52px] w-[52px] items-center justify-center rounded-full border bg-[#fcf7ef] p-1.5 transition-colors',
                    item.selected
                      ? 'border-[#f4a11a] ring-2 ring-[#f4a11a]/25'
                      : 'border-[#ccb39f] group-hover:border-[#f4a11a]/70',
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

          <div className="mt-7 flex flex-wrap gap-2 border-b border-[#e1d3c6] pb-4">
            {dateTabs.map(tab => (
              <button
                key={tab}
                className={clsx(
                  'rounded-sm px-3 py-2 font-mukta text-[10px] uppercase tracking-wide',
                  tab === 'Today'
                    ? 'bg-[#6f2618] text-white'
                    : 'bg-[#efe1d3] text-[#6d4d3f] hover:bg-[#e9d6c3]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
            <div>
              <h2 className="font-mukta text-[20px] font-semibold text-[#6f2618]">
                Cancer (August 21 - 2025)
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">{detailText}</p>
            </div>
            <div className="mx-auto w-[170px] lg:mx-0 lg:justify-self-end">
              <Image
                src={EnglishCancerColor}
                alt="Cancer"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
              More Horoscopes For Cancer
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {detailPills.map((pill, index) => (
                <button
                  key={pill}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 font-mukta text-[10px] uppercase tracking-wide',
                    index === 0
                      ? 'border-[#6f2618] bg-[#6f2618] text-white'
                      : 'border-[#d4b7a3] bg-[#f8eee3] text-[#6f2618] hover:bg-[#f2e1d0]',
                  )}
                >
                  {pill}
                </button>
              ))}
            </div>

            <h4 className="mt-6 font-mukta text-[13px] font-semibold uppercase text-[#6f2618]">
              Love & Relationships
            </h4>
            <p className="mt-2 font-mukta text-[14px] leading-7 text-[#5e4f45]">{detailText}</p>
          </div>

          <div className="mt-8">
            <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
              Cancer Sign Compatibility
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {compatibilitySigns.map(item => (
                <article
                  key={item.name}
                  className="rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] px-2 py-2"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src={EnglishCancerColor}
                      alt="Cancer"
                      className="h-[42px] w-[42px] object-contain"
                    />
                    <span className="text-[14px] text-[#ff1a78]">❤</span>
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="h-[42px] w-[42px] object-contain"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between px-1">
                    <span className="font-mukta text-[10px] text-[#846e5f]">Cancer</span>
                    <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-9">
            <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
              Read Horoscope For Other Zodiac Signs
            </h3>

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
                        <h4 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                          {card.name}
                        </h4>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <StartIcon
                              key={`${card.name}-${idx}`}
                              className="h-3 w-3 text-[#ef8a20]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                        Your spark can move mountains, start bold today
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
        </section>

        <section className="mx-auto mt-8 max-w-[1180px] px-1 sm:px-2">
          <div>
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              Today&apos;s Cancer Horoscope
            </h2>
            <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">{extendedText}</p>
            <p className="mt-4 font-mukta text-[14px] leading-7 text-[#5e4f45]">{extendedText}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              Characteristic of Cancer
            </h2>
            <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">{extendedText}</p>
            <p className="mt-4 font-mukta text-[14px] leading-7 text-[#5e4f45]">{extendedText}</p>
          </div>
        </section>

        <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

        <div className="mx-auto mt-14 max-w-[1180px]">
          <Services />
        </div>
      </div>

      <Footer />
    </main>
  );
}
