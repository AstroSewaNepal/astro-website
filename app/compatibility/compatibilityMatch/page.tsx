import clsx from 'clsx';
import Image from 'next/image';

import Footer from '@/components/pages/landing/footer';
import AstroSewaLogo from '@/components/logo';
import NavigationMenu from '@/components/common/navbar/navigationMenu';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import ChevronDownIcon from '@/components/icons/chevron-down';
import UserLineIcon from '@/components/icons/user/user-line';
import LanguageEarthIcon from '@/components/icons/language/earth';
import TransparentBellIcon from '@/components/icons/bell';
import { ServiceTalkToAstrologer } from '@/components/images/services';
import {
  EnglishCancerColor,
  EnglishAriesColor,
  EnglishGeminiColor,
  EnglishLeoColor,
  EnglishVirgoColor,
  EnglishLibraColor,
  EnglishScorpioColor,
  EnglishSagittariusColor,
  EnglishCapricornColor,
  EnglishAquariusColor,
  EnglishPiscesColor,
  EnglishTaurusColor,
} from '@/components/images/zodiac/english';

import LandingPageCSS from '../../landing-page.module.css';

const topNav = [
  { title: 'Horoscope', hasChildren: true },
  { title: 'Zodiac Signs', hasChildren: true },
  { title: 'Kundali', hasChildren: true },
  { title: 'Compatibility', active: true },
  { title: 'Puja Bidhi', hasChildren: true },
  { title: 'Calculator', hasChildren: true },
  { title: 'About Us' },
  { title: 'Blog' },
  { title: 'Calendar' },
];

const compatibilityTabs = ['Love', 'Sex', 'Friendship', 'Communication', 'Strength', 'Weakness'];

const otherSignPairs = [
  { sign: 'Leo', image: EnglishLeoColor },
  { sign: 'Taurus', image: EnglishTaurusColor },
  { sign: 'Gemini', image: EnglishGeminiColor },
  { sign: 'Aries', image: EnglishAriesColor },
  { sign: 'Virgo', image: EnglishVirgoColor },
  { sign: 'Libra', image: EnglishLibraColor },
  { sign: 'Scorpio', image: EnglishScorpioColor },
  { sign: 'Sagittarius', image: EnglishSagittariusColor },
  { sign: 'Capricorn', image: EnglishCapricornColor },
  { sign: 'Aquarius', image: EnglishAquariusColor },
  { sign: 'Pisces', image: EnglishPiscesColor },
  { sign: 'Cancer', image: EnglishCancerColor },
];

const introText =
  'When Taurus and Cancer are zodiac close together in a love compatibility, they depict an amazing flow of love because of sharing deep karmic ties. There is immediate deep, sincere and harmonious vibration, more open to another, sometimes emotional in the Taurus-Cancer love match. The former will love to material life, while the latter will long to intimacy and emotional nourishment. In a single sentence they create a perfect balance of stability and emotional support, which makes them one of the most compatible pairings.';

const calloutTitle = "Do you want to know more about Cancer and Taurus? We've got your answers.";

const calloutButtons = [{ label: 'Start the chat' }, { label: 'Start call now' }];

export default function CompatibilityMatchPage() {
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

        <section className="mx-auto mt-8 max-w-[1180px]">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[36px] font-bold leading-none text-[#6b2417] sm:text-[46px]">
                Zodiac Compatibility
              </h1>
              <p className="mt-2 font-mukta text-[20px] text-[#111111]">
                Love, Sex, Friendship &amp; More
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b99d] bg-[#f8efdf] px-3 py-2">
                  <span className="font-mukta text-[11px] uppercase text-[#6f2618]">Cancer</span>
                  <div className="flex items-center gap-1">
                    <Image
                      src={EnglishCancerColor}
                      alt="Cancer"
                      className="h-9 w-9 object-contain"
                    />
                    <Image
                      src={EnglishCancerColor}
                      alt="Cancer"
                      className="h-9 w-9 object-contain"
                    />
                  </div>
                  <span className="font-mukta text-[11px] uppercase text-[#6f2618]">Taurus</span>
                </div>
              </div>
            </div>

            <div className="lg:pt-2">
              <div className="text-right font-sahitya text-[34px] font-bold text-[#6b2417] sm:text-[48px]">
                95%Matched
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-[#d9b49a] bg-[#f8eedb]/95 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  {compatibilityTabs.map((tab, index) => (
                    <button
                      key={tab}
                      className={clsx(
                        'rounded-sm border px-3 py-1.5 font-mukta text-[11px] uppercase tracking-wide',
                        index === 0
                          ? 'border-[#6f2618] bg-[#6f2618] text-white'
                          : 'border-[#e2cbb6] bg-[#f7efe1] text-[#6f2618]',
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <h2 className="mt-5 font-mukta text-[18px] font-semibold text-[#6f2618]">
                  Love Compatibility
                </h2>
                <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">{introText}</p>
              </div>

              <div className="rounded-[18px] border border-[#e0c7af] bg-[#fbf4e8] p-4 sm:p-5">
                <h3 className="text-center font-sahitya text-[22px] font-bold text-[#6b2417]">
                  Find Your Compatible Partner?
                </h3>
                <p className="mt-1 text-center font-mukta text-[13px] leading-6 text-[#3f3832]">
                  Choose your and your partner&apos;s zodiac sign
                  <br />
                  to check compatibility
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="font-mukta text-[11px] text-[#9a7d66]">Your Sign</p>
                    <p className="mt-1 font-mukta text-[16px] font-bold text-[#6f2618]">CANCER</p>
                    <div className="mx-auto mt-2 flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#f2c100]">
                      <Image
                        src={EnglishCancerColor}
                        alt="Cancer"
                        className="h-[66px] w-[66px] object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="font-mukta text-[11px] text-[#9a7d66]">Partner&apos;s Sign</p>
                    <p className="mt-1 font-mukta text-[16px] font-bold text-[#6f2618]">TAURUS</p>
                    <div className="mx-auto mt-2 flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#f2c100]">
                      <Image
                        src={EnglishTaurusColor}
                        alt="Taurus"
                        className="h-[66px] w-[66px] object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button className="rounded-full bg-[#6f2618] px-6 py-2 font-mukta text-[13px] font-semibold text-[#fff7ec] hover:bg-[#581e13]">
                    Find Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mukta text-[14px] leading-8 text-[#4f463f]">
            Zodiac sign compatibility goes beyond just love matches — it uncovers deeper insights
            into how you and your partner connect emotionally, romantically, and even physically. By
            exploring both your signs, you can gain clarity on your love and sexual compatibility,
            helping to build a stronger foundation of trust, passion, and mutual understanding for a
            long-lasting relationship.
          </p>

          <div className="mt-10">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              Compatibility With Other Signs
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {otherSignPairs.map((item, index) => (
                <article
                  key={item.sign}
                  className={clsx(
                    'rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]',
                    index === 0 && 'ring-1 ring-[#d2b18b]',
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      src={EnglishCancerColor}
                      alt="Cancer"
                      className="h-[40px] w-[40px] object-contain"
                    />
                    <span className="text-[14px] text-[#ff1a78]">❤</span>
                    <Image
                      src={item.image}
                      alt={item.sign}
                      className="h-[40px] w-[40px] object-contain"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between px-1 font-mukta text-[10px] text-[#846e5f]">
                    <span>Cancer</span>
                    <span>{item.sign}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[18px] border border-[#e0c090] bg-[#ead08a] p-5 sm:p-6">
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <h3 className="font-sahitya text-[28px] font-bold text-[#6b2417] sm:text-[32px]">
                  Do you want to know more about Cancer and Taurus?
                </h3>
                <p className="mt-2 font-mukta text-[16px] text-[#4d3522]">
                  We&apos;ve got your answers.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {calloutButtons.map(button => (
                    <button
                      key={button.label}
                      className="rounded-full border border-[#6f2618] bg-[#fff6ea] px-4 py-2 font-mukta text-[12px] font-semibold text-[#6f2618] hover:bg-white"
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Image
                  src={ServiceTalkToAstrologer}
                  alt="Astrologer illustration"
                  className="h-[150px] w-auto object-contain sm:h-[190px]"
                />
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Services />
          </div>

          <div className="mt-10 rounded-[18px] border-t border-[#d8c4b1] pt-8">
            <DownloadApp />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
