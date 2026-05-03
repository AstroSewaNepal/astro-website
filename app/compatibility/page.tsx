'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import ChevronDownIcon from '@/components/icons/chevron-down';
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
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-8 max-w-[1180px]">
          <h1 className="font-mukta text-[36px] font-bold leading-none text-[#6b2417] sm:text-[44px]">
            {copy.title}
          </h1>
          <p className="mt-2 font-mukta text-[22px] text-[#111111]">{copy.subtitle}</p>
          <hr className="mt-5 border-[#dcc7b6]" />

          <p className="mt-8 font-mukta text-[14px] leading-8 text-[#4f463f]">{copy.intro}</p>

          <div className="mt-8 rounded-[20px] border border-[#BE7B71] bg-[#F8F3DF] px-4 py-11 sm:px-8 sm:py-11">
            <h2 className="text-center font-mukta text-[28px] font-bold leading-[38px] text-[#611508] sm:text-[42px] sm:leading-none">
              {copy.cardTitle}
            </h2>
            <p className="mt-1 text-center font-mukta text-base font-normal leading-6 text-[#141414] sm:text-xl">
              {copy.cardSubtitle}
            </p>

            <div className="mx-auto mt-6 grid grid-cols-2 gap-6 sm:mt-8 sm:max-w-[560px] sm:gap-10">
              {/* Your Sign */}
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#BE7B71] bg-[#F8F3DF] p-7 sm:h-40 sm:w-40 sm:p-10">
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
                  <div className="relative w-full">
                    <select
                      value={yourSign}
                      onChange={e => setYourSign(e.target.value as HoroscopeSign)}
                      className="w-full appearance-none rounded-[32px] border border-[#BE7B71] bg-white px-3 py-1.5 pr-8 font-mukta text-sm font-medium uppercase leading-7 text-[#611508] sm:px-4 sm:pr-10 sm:text-xl"
                    >
                      {signOptions.map(s => (
                        <option key={s} value={s}>
                          {copy.signLabels[s]}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#611508] sm:right-4 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 font-mukta text-sm font-medium leading-5 text-[#141414] sm:gap-6 sm:text-xl">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="yourGender"
                      className="sr-only"
                      checked={yourGender === 'male'}
                      onChange={() => setYourGender('male')}
                    />
                    {yourGender === 'male' ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle
                          cx="4.877"
                          cy="4.877"
                          r="4.377"
                          stroke="black"
                          strokeOpacity="0.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
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
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle
                          cx="4.877"
                          cy="4.877"
                          r="4.377"
                          stroke="black"
                          strokeOpacity="0.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.femaleLabel}
                  </label>
                </div>
              </div>

              {/* Partner's Sign */}
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#BE7B71] bg-[#F8F3DF] p-7 sm:h-40 sm:w-40 sm:p-10">
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
                  <div className="relative w-full">
                    <select
                      value={partnerSign}
                      onChange={e => setPartnerSign(e.target.value as HoroscopeSign)}
                      className="w-full appearance-none rounded-[32px] border border-[#BE7B71] bg-white px-3 py-1.5 pr-8 font-mukta text-sm font-medium uppercase leading-7 text-[#611508] sm:px-4 sm:pr-10 sm:text-xl"
                    >
                      {signOptions.map(s => (
                        <option key={s} value={s}>
                          {copy.signLabels[s]}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#611508] sm:right-4 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 font-mukta text-sm font-medium leading-5 text-[#141414] sm:gap-6 sm:text-xl">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="partnerGender"
                      className="sr-only"
                      checked={partnerGender === 'male'}
                      onChange={() => setPartnerGender('male')}
                    />
                    {partnerGender === 'male' ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle
                          cx="4.877"
                          cy="4.877"
                          r="4.377"
                          stroke="black"
                          strokeOpacity="0.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
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
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
                        <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
                        <circle
                          cx="4.877"
                          cy="4.877"
                          r="4.377"
                          stroke="black"
                          strokeOpacity="0.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
                      </svg>
                    )}
                    {copy.femaleLabel}
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 items-center justify-center text-center sm:flex">
              <button
                onClick={findNow}
                className="inline-flex w-3/4 items-center justify-center gap-2 rounded-[24px] bg-[#611508] px-8 py-2 font-mukta text-base font-semibold leading-7 text-[#F8F3DF] disabled:opacity-60"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M19.3 14.9C19.7 14.2 20 13.4 20 12.5C20 10 18 8 15.5 8C13 8 11 10 11 12.5C11 15 13 17 15.5 17C16.4 17 17.2 16.7 17.9 16.3L20.8 19.2L22.2 17.8L19.3 14.9ZM15.5 15C14.1 15 13 13.9 13 12.5C13 11.1 14.1 10 15.5 10C16.9 10 18 11.1 18 12.5C18 13.9 16.9 15 15.5 15ZM14.7 18.9C14.3 19.3 13.9 19.6 13.5 20L12 21.3L10.5 20C5.4 15.4 2 12.3 2 8.5C2 5.4 4.4 3 7.5 3C9.2 3 10.9 3.8 12 5.1C13.1 3.8 14.8 3 16.5 3C19.6 3 22 5.4 22 8.5C22 9.2 21.9 9.8 21.7 10.5C20.8 7.9 18.4 6 15.5 6C11.9 6 9 8.9 9 12.5C9 15.8 11.5 18.5 14.7 18.9Z"
                    fill="#F8F3DF"
                  />
                </svg>
                <span>{copy.findNow}</span>
              </button>
            </div>
          </div>

          <p className="mt-8 font-mukta text-[14px] leading-8 text-[#4f463f]">{copy.outro}</p>
        </section>

        <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

        <div className="mx-auto mt-14 max-w-[1180px]">
          <Services />
        </div>
      </div>
    </main>
  );
}
