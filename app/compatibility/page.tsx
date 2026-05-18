'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import ChevronDownIcon from '@/components/icons/chevron-down';
import FindNowIcon from '@/components/icons/findnow_love_icon.png';
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
import { horoscopeEn, useHoroscopeLocaleOptional } from '@/lib/i18n';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import type { HoroscopeSign } from '@/lib/types/horoscope';

const zodiacImageMap = {
  aries: EnglishAriesColor,
  taurus: EnglishTaurusColor,
  gemini: EnglishGeminiColor,
  cancer: EnglishCancerColor,
  leo: EnglishLeoColor,
  virgo: EnglishVirgoColor,
  libra: EnglishLibraColor,
  scorpio: EnglishScorpioColor,
  sagittarius: EnglishSagittariusColor,
  capricorn: EnglishCapricornColor,
  aquarius: EnglishAquariusColor,
  pisces: EnglishPiscesColor,
} as const;

export default function CompatibilityPage() {
  const router = useRouter();
  const horoscopeLocale = useHoroscopeLocaleOptional();
  const dict = horoscopeLocale?.dict ?? horoscopeEn;
  const copy = dict.compatibility;
  const signOptions = useMemo(() => HOROSCOPE_SIGNS, []);
  const [yourSign, setYourSign] = useState<HoroscopeSign>(signOptions[3] ?? 'cancer');
  const [partnerSign, setPartnerSign] = useState<HoroscopeSign>(signOptions[1] ?? 'taurus');
  const [yourGender, setYourGender] = useState<'male' | 'female'>('male');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('female');

  const findNow = useCallback(() => {
    const searchParams = new URLSearchParams({
      your_sign: yourSign,
      partner_sign: partnerSign,
      your_gender: yourGender,
      partner_gender: partnerGender,
    });

    router.push(`/compatibility/compatibilityMatch?${searchParams.toString()}`);
  }, [partnerGender, partnerSign, router, yourGender, yourSign]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-6 lg:px-0">
        <section>
          <div className="w-full">
            <h1 className="font-sahitya text-[22px] font-bold leading-[32px] tracking-[0%] text-[#6b2417] sm:text-[36px] sm:leading-[48px]">
              {copy.title}
            </h1>
            <p className="mt-2 font-mukta font-normal text-[14px] leading-[24px] tracking-[0%] text-[#111111] max-sm:!text-[14px] max-sm:!leading-[24px] sm:text-[22px] sm:leading-[30px]">
              {copy.subtitle}
            </p>

            <div className="mt-4">
              <p className="font-mukta text-[16px] leading-[28px] tracking-[0%] text-[#4f463f] sm:text-[24px] sm:leading-[34px]">
                You may not always click effortlessly with everyone, but when you're with that special someone, life feels brighter, calmer, and more meaningful. Throughout your journey, you'll meet many wonderful people — friends, mentors, and companions — but only one will truly be your life partner. Choosing the right person is important, because they should make you feel cherished, supported, and at peace, never lonely or uncared for.
                Do you ever feel your heart skip a beat when you meet someone? That spark could be a sign of destiny. Discover what the universe has in store for your love life by exploring your zodiac sign compatibility with Astro Sewa.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[20px] px-4 py-11 sm:border sm:border-[#BE7B71] sm:bg-[#F8F3DF] sm:px-8 sm:py-11">
            <h2 className="text-left sm:text-center font-mukta text-[24px] leading-[34px] font-bold tracking-[0%] text-[#611508] -ml-4 sm:ml-0 sm:font-sahitya sm:text-[28px] sm:leading-[38px] break-words">
              {copy.cardTitle}
            </h2>
            <p className="mt-1 text-left sm:text-center font-mukta text-[20px] leading-[26px] tracking-[0%] text-[#141414] -ml-4 sm:ml-0">
              <span className="block whitespace-nowrap">Choose your and your partner&apos;s zodiac sign</span>
              <span className="block">to check compatibility</span>
            </p>

            {/* ✅ FIX: reduced sm:max-w from [560px] to [380px] to close the gap between the two columns */}
            <div className="mx-auto mt-6 grid grid-cols-2 gap-x-12 gap-y-2 sm:mt-8 sm:max-w-[380px] sm:gap-x-0 sm:gap-y-2">
              {/* Your Sign */}
              <div className="flex flex-col items-center gap-[19.59px] sm:gap-4">
                <div className="flex h-[161.4238739013672px] w-[164.65234375px] items-center justify-center rounded-[102.91px] border border-[#BE7B71] bg-[#F8F3DF] p-[39.17px] sm:h-40 sm:w-40 sm:p-10">
                  <Image
                    src={zodiacImageMap[yourSign]}
                    alt={yourSign}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-1">
                  <p className="font-mukta text-sm font-medium text-[#BE7B71] sm:text-base">
                    {copy.yourSignLabel}
                  </p>
                  <div className="relative w-[172.65234375px]">
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <ChevronDownIcon className="h-3 w-3 text-[#611508] sm:h-4 sm:w-4" />
                    </span>
                    <select
                      value={yourSign}
                      onChange={e => setYourSign(e.target.value as HoroscopeSign)}
                      className="appearance-none w-full h-[40px] rounded-[32px] border border-[#BE7B71] bg-white px-4 text-center font-mukta text-[20px] font-medium uppercase leading-[28px] text-[#611508]"
                    >
                      {signOptions.map(s => (
                        <option key={s} value={s}>
                          {copy.signLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 font-mukta text-[20px] leading-[20px] font-medium text-[#141414] sm:gap-6 sm:text-xl sm:leading-5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="yourGender"
                      className="sr-only"
                      checked={yourGender === 'male'}
                      onChange={() => setYourGender('male')}
                    />
                    {yourGender === 'male' ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="black" strokeOpacity="0.2" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.maleLabel}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="yourGender"
                      className="sr-only"
                      checked={yourGender === 'female'}
                      onChange={() => setYourGender('female')}
                    />
                    {yourGender === 'female' ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="black" strokeOpacity="0.2" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.femaleLabel}
                  </label>
                </div>
              </div>

              {/* Partner's Sign */}
              <div className="flex flex-col items-center gap-[19.59px] sm:gap-4">
                <div className="flex h-[161.4238739013672px] w-[164.65234375px] items-center justify-center rounded-[102.91px] border border-[#BE7B71] bg-[#F8F3DF] p-[39.17px] sm:h-40 sm:w-40 sm:p-10">
                  <Image
                    src={zodiacImageMap[partnerSign]}
                    alt={partnerSign}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-1">
                  <p className="font-mukta text-sm font-medium text-[#BE7B71] sm:text-base">
                    {copy.partnerSignLabel}
                  </p>
                  <div className="relative w-[172.65234375px]">
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <ChevronDownIcon className="h-3 w-3 text-[#611508] sm:h-4 sm:w-4" />
                    </span>
                    <select
                      value={partnerSign}
                      onChange={e => setPartnerSign(e.target.value as HoroscopeSign)}
                      className="appearance-none w-full h-[40px] rounded-[32px] border border-[#BE7B71] bg-white px-4 text-center font-mukta text-[20px] font-medium uppercase leading-[28px] text-[#611508]"
                    >
                      {signOptions.map(s => (
                        <option key={s} value={s}>
                          {copy.signLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 font-mukta text-[20px] leading-[20px] font-medium text-[#141414] sm:gap-6 sm:text-xl sm:leading-5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="partnerGender"
                      className="sr-only"
                      checked={partnerGender === 'male'}
                      onChange={() => setPartnerGender('male')}
                    />
                    {partnerGender === 'male' ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="black" strokeOpacity="0.2" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.maleLabel}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="partnerGender"
                      className="sr-only"
                      checked={partnerGender === 'female'}
                      onChange={() => setPartnerGender('female')}
                    />
                    {partnerGender === 'female' ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="black" strokeOpacity="0.2" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.femaleLabel}
                  </label>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 flex justify-center sm:max-w-[560px]">
              <button
                onClick={findNow}
                className="inline-flex w-[369.302px] h-[44px] items-center justify-center gap-2 rounded-[24px] bg-[#611508] px-8 py-2 font-mukta text-base font-semibold leading-7 text-[#F8F3DF] disabled:opacity-60"
              >
                <span className="flex h-[18.3px] w-[20.2px] items-center justify-center">
                  <Image
                    src={FindNowIcon}
                    alt="Find now icon"
                    width={20}
                    height={18}
                    className="h-[18.3px] w-[20.2px] object-contain"
                  />
                </span>
                <span>{copy.findNow}</span>
              </button>
            </div>
          </div>

          <p className="mt-8 font-mukta font-normal text-[24px] leading-[34px] tracking-[0%] text-[#464646]">
            {copy.outro}
          </p>
        </section>

        <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

        <div className="mx-auto mt-14 max-w-[1180px]">
          <Services />
        </div>
      </div>
    </main>
  );
}