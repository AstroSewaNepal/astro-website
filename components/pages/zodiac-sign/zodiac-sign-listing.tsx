'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import LandingFAQ from '@/components/pages/landing/faq';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { zodiacEnglishDetailHref, zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { zodiacListingCopy } from '@/lib/zodiac-sign/listing-copy';
import { englishZodiacColorOrdered } from '@/lib/zodiac-sign/english-zodiac-color';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';

import LandingPageCSS from '@/app/landing-page.module.css';
import { useZodiacListingLanguage } from './use-zodiac-listing-language';
import { ZodiacLangPillToggle } from './zodiac-lang-pill-toggle';

export type ZodiacListingMode = 'hub-en' | 'hub-ne';

type Props = {
  mode: ZodiacListingMode;
};

export function ZodiacSignListing({ mode }: Props) {
  const defaultLang = mode === 'hub-ne' ? ELanguage.NEPALI : ELanguage.ENGLISH;
  const [language, setLanguage] = useZodiacListingLanguage(defaultLang);
  const t = zodiacListingCopy[language];
  const cards = HOROSCOPE_DATA[language];
  const colorRow = englishZodiacColorOrdered();

  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-8 max-w-[1180px]">
          {mode === 'hub-ne' ? (
            <p className="font-mukta text-[11px] text-[#7a6658]">
              Home &gt; Zodiac Sign &gt; Zodiac Sign-Nepali
            </p>
          ) : null}

          <div
            className={clsx(
              'grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start',
              mode === 'hub-ne' && 'mt-2',
            )}
          >
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                {mode === 'hub-ne' && language === ELanguage.NEPALI
                  ? `${t.heroTitle} (राशी चिन्ह)`
                  : t.heroTitle}
              </h1>
              <p className="mt-2 font-mukta text-[18px] text-[#111111]">{t.heroSub}</p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="text-right font-sahitya text-[20px] font-bold text-[#6b2417] sm:text-[24px]">
                {t.insightAside}
              </div>
            </div>
          </div>

          {mode === 'hub-ne' ? (
            <div className="mt-6 space-y-4 font-mukta text-[14px] leading-8 text-[#4f463f]">
              <p>{t.nepaliHubIntro1}</p>
              <p>{t.nepaliHubIntro2}</p>
            </div>
          ) : null}

          <div
            className={clsx(
              'rounded-[18px] border border-[#d8c2ae] bg-[#f7eedf]/95 p-5 sm:p-6',
              mode === 'hub-en' ? 'mt-6' : 'mt-6',
            )}
          >
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              {t.whatIsTitle}
            </h2>
            {mode === 'hub-en' ? (
              <>
                <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
                  {t.whatIsLead}
                </p>
                <ZodiacLangPillToggle language={language} onChange={setLanguage} className="mt-6" />
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {colorRow.map(({ slug, image }, i) => {
                    const name = cards[i]!.name;
                    return (
                      <Link
                        key={slug}
                        href={zodiacEnglishDetailHref(slug)}
                        className="block rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
                      >
                        <article className="flex items-center gap-2">
                          <Image
                            src={image}
                            alt={name}
                            className="h-[46px] w-[46px] object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                                {name}
                              </h3>
                              <div className="flex items-center gap-0.5 text-[#ef8a20]">
                                {Array.from({ length: 3 }).map((_, index) => (
                                  <StartIcon
                                    key={`${slug}-${index}`}
                                    className="h-3 w-3 text-[#ef8a20]"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                              {t.cardBlurb}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                              {t.readMore}
                              <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                            </span>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
                <p className="mt-6 font-mukta text-[14px] leading-8 text-[#4f463f]">
                  {t.whatIsMore}
                </p>
              </>
            ) : (
              <>
                <ZodiacLangPillToggle language={language} onChange={setLanguage} className="mt-6" />
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {colorRow.map(({ slug, image }, i) => {
                    const name = cards[i]!.name;
                    return (
                      <Link
                        key={slug}
                        href={zodiacNepaliDetailHref(slug)}
                        className="block rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
                      >
                        <article className="flex items-center gap-2">
                          <Image
                            src={image}
                            alt={name}
                            className="h-[46px] w-[46px] object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                              {name}
                            </h3>
                            <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                              {t.cardBlurb}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                              {t.readMore}
                              <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                            </span>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
              {t.whyTitle}
            </h2>
            <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">{t.whyBody}</p>
          </div>

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

        {mode === 'hub-en' ? (
          <TalkToOurAstrologer className="mx-auto mt-12 max-w-[1180px]" />
        ) : null}

        {mode === 'hub-en' ? (
          <div className="mx-auto mt-12 max-w-[1180px]">
            <div className="rounded-[18px] border border-[#ead7c7] bg-[#f8efe3] p-5">
              <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
                {t.otherSignsTitle}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {HOROSCOPE_SIGNS.map((slug, i) => {
                  const card = cards[i]!;
                  return (
                    <Link
                      key={slug}
                      href={zodiacEnglishDetailHref(slug)}
                      className="block rounded-[16px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
                    >
                      <article className="flex items-center gap-2">
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
                            {t.cardBlurb}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                            {t.readMore}
                            <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-16 max-w-[1180px]">
            <LandingFAQ />
          </div>
        )}

        {mode === 'hub-en' ? (
          <div className="mx-auto mt-12 max-w-[1180px]">
            <Services />
          </div>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
