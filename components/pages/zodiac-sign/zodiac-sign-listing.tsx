'use client';

import { useState } from 'react';
import clsx from 'clsx';

import LandingFAQ from '@/components/pages/landing/faq';
import QNASComponent from '@/components/common/qnas-component';
import { CompatibilityHoroscopeSection } from '@/app/compatibility/[slug]/compatibility-horoscope-section';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { zodiacEnglishDetailHref, zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { zodiacListingCopy } from '@/lib/zodiac-sign/listing-copy';
import { englishZodiacColorOrdered } from '@/lib/zodiac-sign/english-zodiac';

export type ZodiacListingMode = 'hub-en' | 'hub-ne';

type Props = {
  mode: ZodiacListingMode;
};

export function ZodiacSignListing({ mode }: Props) {
  const defaultLang = mode === 'hub-ne' ? ELanguage.NEPALI : ELanguage.ENGLISH;
  const [horoscopeCardLang, setHoroscopeCardLang] = useState<ELanguage>(defaultLang);
  const t = zodiacListingCopy[horoscopeCardLang];
  const cards = HOROSCOPE_DATA[horoscopeCardLang];
  const zodiacCards = englishZodiacColorOrdered().map(({ slug, image }, i) => ({
    key: slug,
    name: cards[i]?.name ?? '',
    image: cards[i]?.imageColor ?? image,
    imageLight: cards[i]?.image,
    summary: cards[i]?.detail ?? t.cardBlurb,
    stars: cards[i]?.numberOfStars ?? 3,
    href: mode === 'hub-en' ? zodiacEnglishDetailHref(slug) : zodiacNepaliDetailHref(slug),
  }));

  return (
    <main className="container mx-auto min-h-screen overflow-hidden">
      <div className="relative isolate">
        <div className="mx-auto px-6 lg:px-0 py-3">
          <section className="mx-auto mt-4 px-2 sm:mt-6 sm:px-3 lg:mt-8 lg:px-4">
            {mode === 'hub-ne' ? (
              <p className="font-mukta text-[11px] text-[#7a6658]">
                Home &gt; Zodiac Sign &gt; Zodiac Sign-Nepali
              </p>
            ) : null}

            <div className="mx-auto max-w-5xl text-center">
              <h1 className="font-tiro-devanagari font-normal text-[24px] leading-[1.1] text-[#6b2417] text-center mb-6 sm:text-[56px] sm:leading-[1.05] sm:mb-10">
                Zodiac Signs: Explore All 12 Signs and Their Meanings
              </h1>
              <p className="mx-auto max-w-[760px] text-base leading-7 text-[#5f5248] sm:text-[16px] sm:leading-8 lg:text-[18px] lg:leading-9">
                Explore Your Sign Select your zodiac sign below to discover personality traits,
                strengths, compatibility, and today&apos;s horoscope reading.
              </p>
            </div>

            {mode === 'hub-ne' ? (
              <div className="mt-4 space-y-4 font-mukta text-[14px] leading-8 text-[#4f463f]">
                <p>{t.nepaliHubIntro1}</p>
                <p>{t.nepaliHubIntro2}</p>
              </div>
            ) : null}

            <CompatibilityHoroscopeSection
              cards={zodiacCards}
              listError={null}
              uiLanguage={horoscopeCardLang}
              readMoreLabel={t.readMore}
              emptyLabel="No zodiac signs available."
              errorFallbackSuffix=""
              horoscopeCardLang={horoscopeCardLang}
              onLanguageChange={setHoroscopeCardLang}
            />

            <section className="mx-auto mt-8 px-2 sm:mt-10 sm:px-3 lg:mt-12 lg:px-4">
              <h2
                className={clsx(
                  'font-sahitya text-[#6b2417] text-left',
                  'text-[22px] sm:text-[26px] font-bold lg:text-[32px]',
                )}
              >
                {t.whatIsTitle}
              </h2>

              <div className="mx-auto mt-3 space-y-4 text-left font-mukta text-[15px] leading-8 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[16px] sm:leading-8 lg:mt-5">
                <p>{t.whatIsLead}</p>
                {t.whatIsMore ? <p>{t.whatIsMore}</p> : null}
              </div>
            </section>

            <section className="mx-auto mt-6 px-2 sm:mt-8 sm:px-3 lg:mt-10 lg:px-4">
              <h2
                className={clsx(
                  'font-sahitya text-[#6b2417] text-left',
                  'text-[22px] sm:text-[26px] font-bold lg:text-[32px]',
                )}
              >
                {t.whyTitle}
              </h2>

              <div className="mx-auto mt-3 space-y-4 text-left font-mukta text-[15px] leading-8 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[16px] sm:leading-8 lg:mt-5">
                <p>{t.whyBody}</p>
                {t.whyMore ? <p>{t.whyMore}</p> : null}
              </div>
            </section>

            {mode === 'hub-ne' ? (
              <div className="mt-10">
                <h2 className="font-sahitya text-[26px] font-bold text-[#6b2417]">
                  {t.nepaliHubSectionTitle}
                </h2>
                <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
                  {t.nepaliHubSectionBody}
                </p>
              </div>
            ) : null}
          </section>

          {mode !== 'hub-ne' ? (
            <section className="container mx-auto px-6 lg:px-0 pb-6 md:pb-[50px] mt-16">
              <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
                <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
                  Frequently Asked Questions
                </h2>
                <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
                  Find quick answers to common questions about sun signs, moon signs, and how Vedic
                  astrology differs from Western astrology.
                </p>
              </div>
              <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
                <QNASComponent
                  question="What Is the Difference Between a Sun Sign and a Moon Sign?"
                  answer="Your sun sign is the zodiac sign the Sun was in at the moment of your birth. It reflects your outer identity, ego, and how you present yourself to the world. Your moon sign (Rashi in Vedic astrology) is the zodiac sign the Moon was in at your birth. It reflects your inner emotional world, your instincts, and how you feel and react on a deeper level. In Vedic astrology, the moon sign is considered more important than the sun sign for personality analysis and prediction."
                  isDefaultOpen
                />
                <QNASComponent
                  question="How Do I Find My Vedic Moon Sign?"
                  answer="You can find your Vedic moon sign (Rashi) using the free Rashi Calculator on AstroSewa. You will need your birth date, time, and place. Your Vedic moon sign may be different from your Western sun sign because Vedic astrology uses the sidereal zodiac, which is aligned with the actual positions of the stars, rather than the tropical zodiac used in Western astrology."
                />
                <QNASComponent
                  question="Are Zodiac Signs the Same in Vedic and Western Astrology?"
                  answer="The twelve zodiac signs exist in both systems but they are calculated differently. Western astrology uses the tropical zodiac, fixed to the seasons. Vedic astrology uses the sidereal zodiac, aligned with the actual star positions in the sky. Because of a slow shift in Earth's axis over thousands of years, the two systems are now about 23 to 24 degrees apart. This means most people's Vedic sign is one sign behind their Western sign."
                />
              </div>
            </section>
          ) : null}

          {mode === 'hub-ne' ? (
            <div className="mx-auto mt-16 max-w-[1180px]">
              <LandingFAQ />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
