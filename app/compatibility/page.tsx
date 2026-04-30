import clsx from 'clsx';
import Image from 'next/image';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import { EnglishCancerColor, EnglishTaurusColor } from '@/components/images/zodiac/english';

import LandingPageCSS from '../landing-page.module.css';

const introText =
  "You may not always click effortlessly with everyone, but when you're with that special someone, life feels brighter, calmer, and more meaningful. Throughout your journey, you'll meet many wonderful people - friends, mentors, and companions - but only one will truly be your life partner. Choosing the right person is important, because they should make you feel cherished, supported, and at peace, never lonely or uncared for. Do you ever feel your heart skip a beat when you meet someone? That spark could be a sign of destiny. Discover what the universe has in store for your love life by exploring your zodiac sign compatibility with Astro Sewa.";

const outroText =
  "Zodiac sign compatibility goes beyond just love matches - it uncovers deeper insights into how you and your partner connect emotionally, romantically, and even physically. By exploring both your signs, you can gain clarity on your love and sexual compatibility, helping to build a stronger foundation of trust, passion, and mutual understanding for a long-lasting relationship. With Astro Sewa, love compatibility doesn't just show you where your relationship stands today - it also offers a glimpse into its future. It highlights the strength of your bond, what keeps it thriving, and whether you're entering a phase of harmony or possible challenges. By simply checking the compatibility of your zodiac signs, you can understand how your connection is likely to grow and evolve. And if your signs align beautifully, consider it a cosmic green light for smooth and joyful times ahead.";

export default function CompatibilityPage() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-8 max-w-[1180px]">
          <h1 className="font-sahitya text-[36px] font-bold leading-none text-[#6b2417] sm:text-[44px]">
            Compatibility
          </h1>
          <p className="mt-2 font-mukta text-[22px] text-[#111111]">
            Check your love compatibility
          </p>
          <hr className="mt-5 border-[#dcc7b6]" />

          <p className="mt-8 font-mukta text-[14px] leading-8 text-[#4f463f]">{introText}</p>

          <div className="mt-8 rounded-[18px] border border-[#d2bba5] bg-[#f2ecd8] p-6 sm:p-8">
            <h2 className="text-center font-sahitya text-[36px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
              Find Your Compatible Partner?
            </h2>
            <p className="mt-2 text-center font-mukta text-[18px] text-[#1a1a1a]">
              Choose your and your partner&apos;s zodiac sign
              <br />
              to check compatibility
            </p>

            <div className="mx-auto mt-8 grid max-w-[560px] grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="text-center">
                <p className="font-mukta text-[14px] text-[#9a7d66]">Your Sign</p>
                <p className="mt-1 font-mukta text-[20px] font-bold text-[#6f2618]">CANCER</p>
                <div className="mx-auto mt-3 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#f2c100]">
                  <Image
                    src={EnglishCancerColor}
                    alt="Cancer"
                    className="h-[90px] w-[90px] object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-5 font-mukta text-[12px] text-[#151515]">
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="yourGender" defaultChecked className="h-3 w-3" />
                    Man
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="yourGender" className="h-3 w-3" />
                    Woman
                  </label>
                </div>
              </div>

              <div className="text-center">
                <p className="font-mukta text-[14px] text-[#9a7d66]">Partner&apos;s Sign</p>
                <p className="mt-1 font-mukta text-[20px] font-bold text-[#6f2618]">TAURUS</p>
                <div className="mx-auto mt-3 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#f2c100]">
                  <Image
                    src={EnglishTaurusColor}
                    alt="Taurus"
                    className="h-[90px] w-[90px] object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-5 font-mukta text-[12px] text-[#151515]">
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="partnerGender" defaultChecked className="h-3 w-3" />
                    Man
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="partnerGender" className="h-3 w-3" />
                    Woman
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button className="rounded-full bg-[#6f2618] px-8 py-2 font-mukta text-[14px] font-semibold text-[#fff7ec] hover:bg-[#581e13]">
                Find Now
              </button>
            </div>
          </div>

          <p className="mt-8 font-mukta text-[14px] leading-8 text-[#4f463f]">{outroText}</p>
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
