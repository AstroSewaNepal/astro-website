'use client';

import { useState } from 'react';
import clsx from 'clsx';


import LandingFAQ from '@/components/pages/landing/faq';
import { CompatibilityHoroscopeSection } from '@/app/compatibility/compatibilityMatch/compatibility-horoscope-section';
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
    summary: t.cardBlurb,
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
              <h1 className="font-tiro-devanagari font-normal text-[24px] leading-[47.83px] text-[#6b2417] text-center mb-6 sm:text-[56px] sm:mb-10">
                {t.heroSub}
              </h1>
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
