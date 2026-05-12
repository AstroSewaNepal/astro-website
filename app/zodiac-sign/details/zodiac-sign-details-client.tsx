'use client';

import { useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ZodiacDetailLangSwitch } from '@/components/pages/zodiac-sign/zodiac-detail-lang-switch';
import { ZodiacSignMiniCard } from '@/components/pages/zodiac-sign/zodiac-sign-mini-card';
import { ZodiacSignStripNav } from '@/components/pages/zodiac-sign/zodiac-sign-strip-nav';
import { useZodiacSignDetails } from '@/components/pages/zodiac-sign/use-zodiac-sign-details';
import Services from '@/components/pages/landing/services';
import { CompatibilitySignsGrid } from '@/components/ui/compatibility-signs-grid';
import ArrowRight from '@/components/icons/arrow-right';
import { ServiceTalkToAstrologer } from '@/components/images/services';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { horoscopeDetailPageHref } from '@/lib/constants/horoscope-range-nav';
import { compatibilityMatchHref } from '@/lib/constants/compatibility-nav';
import { parseUiLangParam } from '@/lib/i18n';
import { zodiacDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { ENGLISH_ZODIAC_COLOR, ENGLISH_ZODIAC_LIGHT } from '@/lib/zodiac-sign/english-zodiac';
import { NEPALI_ZODIAC_COLOR, NEPALI_ZODIAC_LIGHT } from '@/lib/zodiac-sign/nepali-zodiac';
import { parseZodiacSignParam } from '@/lib/zodiac-sign/parse-sign-param';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';

const cardBaseText = 'Your spark can move mountains, start bold today';
const calloutButtons = [{ label: 'Chat Now' }, { label: 'Download app' }];

function capitalizeSign(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function highlightFirstMatch(text: string, needle: string): ReactNode {
  if (!text || !needle) {
    return text;
  }
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const index = lowerText.indexOf(lowerNeedle);
  if (index < 0) {
    return text;
  }
  const before = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const after = text.slice(index + needle.length);
  return (
    <>
      {before}
      <span className="font-medium text-[#611508] underline">{match}</span>
      {after}
    </>
  );
}

export function ZodiacSignDetailsClient() {
  const searchParams = useSearchParams();
  const slug = useMemo(() => parseZodiacSignParam(searchParams.get('sign')), [searchParams]);
  const contentLanguage = useMemo(
    () => parseUiLangParam(searchParams.get('content_lang')) ?? ELanguage.ENGLISH,
    [searchParams],
  );
  const headerLanguage = useMemo(
    () => parseUiLangParam(searchParams.get('lang')) ?? ELanguage.ENGLISH,
    [searchParams],
  );
  const { row, loadError, loading } = useZodiacSignDetails(slug);
  const isNepali = contentLanguage === ELanguage.NEPALI;

  const signIndex = HOROSCOPE_SIGNS.indexOf(slug);
  const displayName = HOROSCOPE_DATA[contentLanguage][signIndex]?.name ?? capitalizeSign(slug);
  const signColorMap = isNepali ? NEPALI_ZODIAC_COLOR : ENGLISH_ZODIAC_COLOR;
  const signLightMap = isNepali ? NEPALI_ZODIAC_LIGHT : ENGLISH_ZODIAC_LIGHT;
  const hrefForSign = (sign: (typeof HOROSCOPE_SIGNS)[number]) =>
    zodiacDetailHref(sign, contentLanguage, headerLanguage);

  const title = isNepali ? displayName : (row?.sign ?? displayName);
  const rangeLine = row?.date_range ?? '';
  const description = row?.intro ?? row?.card_summary ?? '';
  const compatChips = row?.compatibility?.length ? row.compatibility.join(', ') : '—';

  const summaryTraits = row
    ? [
        { label: 'Element', value: row.element },
        { label: 'Ruling Planet', value: row.ruling_planet },
        { label: 'Compatibility', value: compatChips },
      ]
    : [];

  const detailTraits = row
    ? [
        {
          label: 'Strengths',
          value: row.strengths?.length ? row.strengths.join(', ') : '—',
        },
        {
          label: 'Weaknesses',
          value: row.weaknesses?.length ? row.weaknesses.join(', ') : '—',
        },
        { label: 'Personality Traits', value: row.personality_traits || '—' },
      ]
    : [];

  const compatibilityItems = useMemo(
    () =>
      HOROSCOPE_SIGNS.map(sign => ({
        slug: sign,
        name:
          HOROSCOPE_DATA[contentLanguage][HOROSCOPE_SIGNS.indexOf(sign)]?.name ??
          capitalizeSign(sign),
        image: signColorMap[sign],
        href: compatibilityMatchHref(slug, sign),
      })),
    [contentLanguage, signColorMap, slug],
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-6 max-w-[1180px]">
          <ZodiacDetailLangSwitch signSlug={slug} className="mb-4" />

          <ZodiacSignStripNav
            activeSign={slug}
            language={contentLanguage}
            imageBySign={signColorMap}
            lightImageBySign={signLightMap}
            hrefForSign={hrefForSign}
            showActiveDot
          />

          <div className="mt-4 border-y border-[#e4d4c6] py-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_308px] lg:items-center lg:gap-8">
              <div>
                <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#611508] sm:text-[36px] sm:leading-[48px]">
                  {title}
                </h1>
                <p className="mt-1 font-mukta text-[16px] text-[#101010] sm:text-[18px] sm:leading-[30px]">
                  {rangeLine ? `(${rangeLine})` : null}
                </p>
                <p className="font-mukta text-[20px] font-medium text-[#be7b71] sm:text-[24px] sm:leading-[30px]">
                  Astronomy and Astrology
                </p>

                <div className="mt-4 max-w-[1120px]">
                  {loading ? (
                    <p className="font-mukta text-[16px] leading-8 text-[#383838] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                      Loading…
                    </p>
                  ) : loadError ? (
                    <p className="font-mukta text-[16px] leading-8 text-[#b42318] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                      {loadError}
                    </p>
                  ) : (
                    <p className="font-mukta text-[16px] leading-8 text-[#383838] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                      {highlightFirstMatch(description, displayName)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end">
                <div className="flex h-[260px] w-[260px] items-center justify-center rounded-full sm:h-[290px] sm:w-[290px] lg:h-[297px] lg:w-[308px]">
                  <Image
                    src={signColorMap[slug]}
                    alt={displayName}
                    className="h-[190px] w-[190px] object-contain sm:h-[220px] sm:w-[220px] lg:h-[297px] lg:w-[308px]"
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href={horoscopeDetailPageHref(slug, 'today', ELanguage.ENGLISH)}
                    className="inline-flex items-center gap-2 rounded-[32px] bg-[#611508] px-4 py-1.5 font-mukta text-[16px] text-[#f8f3df] transition-colors hover:bg-[#4f1208] sm:text-[20px] sm:leading-8 lg:text-[22px] lg:leading-8"
                  >
                    Find {displayName} horoscope
                    <ArrowRight className="h-6 w-6 text-[#f8f3df]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {!loading && !loadError && (summaryTraits.length > 0 || detailTraits.length > 0) ? (
            <section className="mt-8 rounded-[20px] border-y border-[#e4d4c6] py-8">
              <div className="grid gap-8 md:grid-cols-3 md:gap-10 lg:w-[659px] lg:gap-0 lg:justify-between">
                {summaryTraits.map(item => (
                  <div key={item.label}>
                    <h3 className="font-sahitya text-[22px] font-bold leading-8 text-[#611508]">
                      {item.label}
                    </h3>
                    <p className="mt-2 border-l-[3px] border-[#be7b71] pl-4 font-mukta text-[20px] font-semibold leading-7 text-[#383838]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-8">
                {detailTraits.map(item => (
                  <div key={item.label}>
                    <h3 className="font-sahitya text-[22px] font-bold leading-8 text-[#611508]">
                      {item.label}
                    </h3>
                    {item.label === 'Personality Traits' ? (
                      <p className="mt-2 w-full border-l-[3px] border-[#be7b71] pl-4 font-mukta text-[22px] font-semibold leading-8 text-[#383838]">
                        {item.value}
                      </p>
                    ) : (
                      <p className="mt-2 border-l-[3px] border-[#be7b71] pl-4 font-mukta text-[20px] font-semibold leading-7 text-[#383838]">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <CompatibilitySignsGrid
                className="mt-10"
                title={
                  isNepali ? `${displayName} राशि अनुकूलता` : `${displayName} Sign Compatibility`
                }
                currentSignLabel={displayName}
                currentSignImage={signColorMap[slug]}
                items={compatibilityItems}
                variant="figma"
              />
            </section>
          ) : null}
        </section>

        <section className="mx-auto mt-10 max-w-[1180px]">
          <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
            Read Horoscope For Other Zodiac Sign
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const card = HOROSCOPE_DATA[contentLanguage][i]!;
              return (
                <ZodiacSignMiniCard
                  key={s}
                  href={zodiacDetailHref(s, contentLanguage, headerLanguage)}
                  image={card.image}
                  imageColor={card.imageColor}
                  name={card.name}
                  blurb={card.detail || cardBaseText}
                  readMoreLabel={isNepali ? 'थप पढ्नुहोस्' : 'Read More'}
                  active={s === slug}
                />
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px]">
          <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
            Why Zodiac Signs Important?
          </h2>
          <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
            Zodiac signs are important because they help you understand your personality and
            relationships on a deeper level. They uncover your natural strengths, challenges, and
            compatibility with others, offering insights into your personal growth and life path.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px] rounded-[24px] bg-[#6f2618] px-6 py-6 text-[#fff7ec] shadow-[0_18px_50px_rgba(111,38,24,0.18)] sm:px-8 lg:px-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-sahitya text-[34px] leading-tight text-[#fff7ec] sm:text-[42px]">
                Find clarity today.
              </h2>
              <p className="mt-2 max-w-[540px] font-mukta text-[16px] leading-7 text-[#f8eadb] sm:text-[18px]">
                Discover Insights Through Vedic Astrology.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {calloutButtons.map(button => (
                  <button
                    key={button.label}
                    type="button"
                    className={clsx(
                      'rounded-full border px-4 py-2 font-mukta text-[12px] font-semibold transition-colors',
                      button.label === 'Chat Now'
                        ? 'border-[#f8eadb] bg-transparent text-[#fff7ec] hover:bg-white/10'
                        : 'border-[#f8eadb] bg-[#f8eadb] text-[#6f2618] hover:bg-white',
                    )}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src={ServiceTalkToAstrologer}
                alt="Astrology chart illustration"
                className="h-[150px] w-auto object-contain sm:h-[190px] lg:h-[210px]"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-[1180px]">
          <Services />
        </div>
      </div>
    </main>
  );
}
