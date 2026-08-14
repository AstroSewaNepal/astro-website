'use client';

import { useMemo, type ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ZodiacSignStripNav } from '@/components/pages/zodiac-sign/zodiac-sign-strip-nav';
import { ZodiacSignExploreSection } from '@/components/pages/zodiac-sign/zodiac-sign-explore-section';
import { useZodiacSignDetails } from '@/components/pages/zodiac-sign/use-zodiac-sign-details';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import { CompatibilitySignsGrid } from '@/components/ui/compatibility-signs-grid';
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
import { ArrowRight } from 'lucide-react';
import { HoroscopeHeroSignsSection } from '@/components/pages/horoscope/index';

function capitalizeSign(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function formatZodiacDateRange(raw: string | { from?: string; to?: string }): string {
  if (!raw) return '';

  if (typeof raw === 'object') {
    const from = raw.from || '';
    const to = raw.to || '';
    if (from && to) return `${from} - ${to}`;
    return from || to;
  }

  const formatPart = (part: string) => {
    const trimmed = part.trim();
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (slashMatch) {
      const month = Number(slashMatch[1]) - 1;
      const day = Number(slashMatch[2]);
      const date = new Date(2000, month, day);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    return trimmed;
  };
  if (raw.includes('-')) {
    const [start, end] = raw.split('-');
    return `${formatPart(start ?? '')} - ${formatPart(end ?? '')}`;
  }
  return formatPart(raw);
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
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSign = typeof params?.sign === 'string' ? params.sign : searchParams.get('sign');
  const slug = useMemo(() => parseZodiacSignParam(rawSign), [rawSign]);
  const contentLanguage = useMemo(
    () => parseUiLangParam(searchParams.get('content_lang')) ?? ELanguage.ENGLISH,
    [searchParams],
  );
  const headerLanguage = useMemo(
    () => parseUiLangParam(searchParams.get('lang')) ?? ELanguage.ENGLISH,
    [searchParams],
  );
  const router = useRouter();
  const pathname = usePathname();
  const { row, loadError, loading } = useZodiacSignDetails(slug);
  const isNepali = contentLanguage === ELanguage.NEPALI;

  const handleContentLanguageChange = (lang: ELanguage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('content_lang', lang);
    router.push(`${pathname}?${params.toString()}`);
  };

  const signIndex = HOROSCOPE_SIGNS.indexOf(slug);
  const displayName = HOROSCOPE_DATA[contentLanguage][signIndex]?.name ?? capitalizeSign(slug);
  const signColorMap = isNepali ? NEPALI_ZODIAC_COLOR : ENGLISH_ZODIAC_COLOR;
  const signLightMap = isNepali ? NEPALI_ZODIAC_LIGHT : ENGLISH_ZODIAC_LIGHT;
  const hrefForSign = (sign: (typeof HOROSCOPE_SIGNS)[number]) =>
    zodiacDetailHref(sign, contentLanguage, headerLanguage);

  const title = isNepali ? displayName : (row?.sign ?? displayName);
  const rangeLine = row?.date_range ? formatZodiacDateRange(row.date_range) : '';
  const subtitle =
    row?.element && row?.ruling_planet
      ? `${row.element} sign · Ruled by ${row.ruling_planet}`
      : row?.element
        ? `${row.element} sign`
        : row?.ruling_planet
          ? `Ruled by ${row.ruling_planet}`
          : '';
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
        imageLight: signLightMap[sign],
        href: compatibilityMatchHref(slug, sign),
      })),
    [contentLanguage, signColorMap, signLightMap, slug],
  );

  return (
    <main className="container mx-auto min-h-screen overflow-hidden">
      <div className="min-w-0 px-3 py-4 sm:px-4">
        <section className="mx-auto mt-6 min-w-0">
          <ZodiacSignStripNav
            activeSign={slug}
            language={contentLanguage}
            imageBySign={signColorMap}
            lightImageBySign={signLightMap}
            hrefForSign={hrefForSign}
            showActiveDot
            large
          />

          <div className="mt-8 lg:mt-10 border-t border-[#be7b71] pt-8">
            <div className="mt-6 flex min-w-0 flex-col gap-6 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-4 lg:opacity-100">
              <div className="min-w-0 order-2 lg:order-none sm:mt-6">
                <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#611508] sm:text-[36px] sm:leading-[48px]">
                  {title}
                </h1>
                <p className="mt-1 font-mukta text-[16px] text-[#101010] sm:text-[18px] sm:leading-[30px]">
                  {rangeLine ? `(${rangeLine})` : null}
                </p>
                {subtitle ? (
                  <p className="font-mukta text-[18px] font-medium text-[#be7b71] sm:text-[22px] sm:leading-[30px]">
                    {subtitle}
                  </p>
                ) : null}

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

                {/* Find Horoscope Link for Mobile */}
                <div className="mt-6 flex lg:hidden items-center justify-center">
                  <Link
                    href={horoscopeDetailPageHref(slug, 'today', ELanguage.ENGLISH)}
                    className="inline-flex w-full sm:w-[366px] h-[44px] items-center justify-center gap-[10px] whitespace-nowrap rounded-[32px] bg-[#611508] px-[16px] py-[6px] opacity-100 font-mukta text-[16px] font-normal leading-[32px] tracking-[0%] text-[#f8f3df] transition-colors hover:bg-[#4f1208] sm:text-[18px]"
                  >
                    Find {displayName} horoscope
                    <ArrowRight className="h-6 w-6 shrink-0 text-[#f8f3df]" />
                  </Link>
                </div>
              </div>

              <div
                className="hidden lg:block order-1 shrink-0 lg:order-none lg:justify-self-end mb-6"
                style={{ width: '308.29px' }}
              >
                <Image
                  src={signColorMap[slug]}
                  alt={displayName}
                  className="mb-4 h-[297px] w-[308px] object-contain"
                />
                <Link
                  href={horoscopeDetailPageHref(slug, 'today', ELanguage.ENGLISH)}
                  className="inline-flex w-[366px] h-[44px] items-center justify-center gap-[10px] whitespace-nowrap rounded-[32px] bg-[#611508] px-[16px] py-[6px] opacity-100 font-mukta text-[16px] font-normal leading-[32px] tracking-[0%] text-[#f8f3df] transition-colors hover:bg-[#4f1208] sm:text-[18px] lg:-translate-x-10"
                >
                  Find {displayName} horoscope
                  <ArrowRight className="h-6 w-6 shrink-0 text-[#f8f3df]" />
                </Link>
              </div>
            </div>
          </div>

          {!loading && !loadError && (summaryTraits.length > 0 || detailTraits.length > 0) ? (
            <section className="mt-8 border-t border-[#be7b71] py-8">
              <div className="flex flex-wrap gap-8 md:gap-12 lg:gap-16">
                {summaryTraits.map(item => (
                  <div key={item.label}>
                    <h3 className="font-sahitya text-[22px] font-bold leading-8 text-[#611508]">
                      {item.label}
                    </h3>
                    <p className="mt-2 border-l-[3px] border-[#be7b71] pl-4 font-mukta text-[18px] font-normal leading-7 text-[#383838]">
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
                    <p className="mt-2 border-l-[3px] border-[#be7b71] pl-4 font-mukta text-[18px] font-normal leading-7 text-[#383838]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="mt-10 border-t border-[#be7b71]" />

              <CompatibilitySignsGrid
                className="mt-10"
                title={
                  isNepali ? `${displayName} राशि अनुकूलता` : `${displayName} Sign Compatibility`
                }
                currentSignLabel={displayName}
                currentSignImage={signColorMap[slug]}
                currentSignImageLight={signLightMap[slug]}
                items={compatibilityItems}
                variant="figma"
              />
            </section>
          ) : null}
        </section>

        <div className="mt-10 min-w-0">
          <div className="hidden md:block">
            <h3 className="font-mukta text-center text-[18px] font-semibold text-[#6f2618] md:font-sahitya md:font-bold md:text-[36px] md:leading-[48px] md:tracking-[0%] md:text-center">
              {isNepali ? 'अन्य राशिहरू अन्वेषण गर्नुहोस्' : 'Explore Other Zodiac Signs'}
            </h3>
            <HoroscopeHeroSignsSection
              hideTitle
              highlightSign={slug}
              sectionClassName="mt-4 min-w-0 max-w-full bg-transparent py-0"
              swiperKeySuffix="zodiac-details-read-other"
              dataQaId="zodiac-details-other-signs-grid"
              linkTo="zodiac-sign"
            />
          </div>
          <div className="md:hidden">
            <ZodiacSignExploreSection
              title={isNepali ? 'अन्य राशिहरू अन्वेषण गर्नुहोस्' : 'Explore Other Zodiac Signs'}
              contentLanguage={contentLanguage}
              headerLanguage={headerLanguage}
              signSlug={slug}
              isNepali={isNepali}
              onContentLanguageChange={handleContentLanguageChange}
            />
          </div>
        </div>

        <div className="mt-16 md:mt-24 lg:mt-32 w-full">
          <Clarity />
        </div>

        <TalkToOurAstrologer className="mt-10 min-w-0" />
      </div>

      <Services />
      <DownloadApp className="mx-auto mt-14 max-w-[1180px]" />
    </main>
  );
}
