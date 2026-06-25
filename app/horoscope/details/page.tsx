'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import { HoroscopeHeroSignsSection } from '@/components/pages/horoscope';
import { ZodiacSignExploreSection } from '@/components/pages/zodiac-sign/zodiac-sign-explore-section';
import { ELanguage } from '@/components/enums/language.enum';
import {
  HoroscopeDetailsRangeTabs,
  HoroscopeDetailsSectionPills,
  HoroscopeDetailsZodiacNav,
} from '@/components/pages/horoscope/horoscope-details-swipers';
import {
  capitalizeSign,
  SIGN_COLOR_IMAGE,
  SIGN_LIGHT_IMAGE,
} from '@/components/pages/horoscope/horoscope-details-sign-assets';
import { CompatibilitySignsGrid } from '@/components/ui/compatibility-signs-grid';
import { fetchVedastroHoroscopeDetail } from '@/lib/api/vedastro/horoscope';
import { compatibilityMatchHref } from '@/lib/constants/compatibility-nav';
import {
  horoscopeDetailPageHref,
  horoscopeListPageHref,
  parseHoroscopeRangeFromUrl,
} from '@/lib/constants/horoscope-range-nav';
import { interpolate, useHoroscopeLocale } from '@/lib/i18n';
import { HOROSCOPE_SIGNS, isHoroscopeSign, type HoroscopeSign } from '@/lib/types/horoscope';
import type { HoroscopeDetailData } from '@/lib/types/vedastro';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';
import { ArrowRight } from 'lucide-react';
import { zodiacDetailHref } from '@/lib/constants/zodiac-sign-nav';

const RANGE_TAB_TYPES = [
  'yesterday',
  'today',
  'tomorrow',
  'week',
  'month',
  'year',
] as const satisfies readonly VedastroHoroscopeRangeType[];

type HoroscopeBodyKey = 'general' | 'love' | 'career' | 'health';

const SECTION_PILL_IDS: HoroscopeBodyKey[] = ['general', 'love', 'career', 'health'];

function HoroscopeDetailsFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mukta text-[#6b5a4e]">
      Loading…
    </div>
  );
}

function HoroscopeDetailsContent() {
  const { dict, uiLanguage } = useHoroscopeLocale();

  const rangeTabs = RANGE_TAB_TYPES.map(type => ({
    type,
    label: dict.details.tabs[type],
  }));

  const sectionPills = SECTION_PILL_IDS.map(id => ({
    id,
    label: dict.details.sections[id],
  }));

  const searchParams = useSearchParams();
  const rawSign = searchParams.get('sign');
  const trimmedSign = rawSign?.trim() ?? '';
  const signSlug = trimmedSign.toLowerCase();
  const validSign: HoroscopeSign | null =
    trimmedSign && isHoroscopeSign(signSlug) ? signSlug : null;
  const signInvalid = Boolean(trimmedSign) && validSign === null;
  const rangeType = parseHoroscopeRangeFromUrl(searchParams.get('type'));

  const [detail, setDetail] = useState<HoroscopeDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionByView, setActiveSectionByView] = useState<{
    key: string;
    section: HoroscopeBodyKey;
  }>({ key: '', section: 'general' });
  const activeViewKey = `${validSign ?? 'none'}:${rangeType}`;
  const activeSection =
    activeSectionByView.key === activeViewKey ? activeSectionByView.section : 'general';

  useEffect(() => {
    if (!validSign) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setLoading(true);
      setError(null);
      setDetail(null);
      fetchVedastroHoroscopeDetail(
        validSign,
        { type: rangeType },
        { headers: { 'Accept-Language': uiLanguage === ELanguage.NEPALI ? 'ne' : 'en' } },
      )
        .then(envelope => {
          if (cancelled) {
            return;
          }
          setDetail(envelope.data ?? null);
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'Could not load horoscope.');
            setDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [validSign, rangeType, uiLanguage]);

  const sectionBody = useMemo(() => {
    if (!detail) {
      return '';
    }
    return detail.horoscope[activeSection];
  }, [detail, activeSection]);

  const compatibilitySigns = useMemo(() => {
    if (!validSign) {
      return [];
    }
    return HOROSCOPE_SIGNS.map(s => ({
      slug: s,
      name: capitalizeSign(s),
      image: SIGN_COLOR_IMAGE[s],
    }));
  }, [validSign]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto min-w-0 px-3 pb-16 pt-2 sm:px-4 overflow-x-hidden">
        {!validSign ? (
          <section className="mt-7 px-2 py-10 text-center sm:px-6">
            <h1 className="font-sahitya text-[26px] text-[#6f2618] sm:text-[28px]">
              {signInvalid ? dict.details.unknownSign : dict.details.chooseSign}
            </h1>
            <p className="mx-auto mt-3 max-w-lg font-mukta text-[14px] leading-7 text-[#5e4f45] sm:text-[15px]">
              {signInvalid ? dict.details.invalidSignHelp : dict.details.pickFromListHelp}
            </p>
            <Link
              href={horoscopeListPageHref('today', uiLanguage)}
              className="mt-6 inline-block rounded-full bg-[#6f2618] px-6 py-2.5 font-mukta text-[14px] text-white"
            >
              {dict.details.backToList}
            </Link>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-[10px] sm:grid-cols-4 md:grid-cols-6">
              {HOROSCOPE_SIGNS.map(slug => (
                <Link
                  key={slug}
                  href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
                  className="group flex flex-col items-center gap-[10px] rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d5d3d0]"
                >
                  <div className="flex h-[98.305px] w-[100px] items-center justify-center rounded-[60px] border-2 border-[#d5d3d0] bg-[#f2f0ee] p-[4px] opacity-100 transition-[border-color,background-color,box-shadow] duration-200 group-hover:border-[#c9a88a] group-hover:bg-[#faf8f6] group-hover:shadow-sm">
                    <Image
                      src={SIGN_COLOR_IMAGE[slug]}
                      alt={capitalizeSign(slug)}
                      className="h-full w-full object-contain grayscale contrast-[0.95] brightness-[0.98] transition-[filter,opacity,transform] duration-200 ease-out group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 group-hover:scale-[1.03] group-focus-visible:grayscale-0"
                    />
                  </div>
                  <span className="text-center font-tiro-devanagari text-[11px] font-normal leading-tight text-[#9a6b5c] transition-colors duration-200 group-hover:text-[#691709] sm:text-[12px]">
                    {capitalizeSign(slug)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-2 min-w-0 py-2 sm:py-3">
            <div className="flex flex-col">
              <div className="order-1 md:order-3">
                <HoroscopeDetailsRangeTabs
                  validSign={validSign}
                  rangeType={rangeType}
                  uiLanguage={uiLanguage}
                  rangeTabs={rangeTabs}
                />
              </div>

              <div className="order-2 md:order-1">
                <h1 className="font-sahitya font-bold tracking-[0px] text-[#6f2618] text-[28px] leading-[34px] sm:text-[38px] sm:leading-[42px] md:text-[48px] md:leading-[48px]">
                  {dict.details.rangeHeading[rangeType]}
                </h1>
                {detail?.horoscope?.start_date ? (
                  <h2 className="mt-2 font-sahitya text-[22px] font-bold leading-[30px] text-[#D47F2C] sm:text-[26px] sm:leading-[34px]">
                    {['today', 'tomorrow', 'yesterday'].includes(
                      detail.horoscope.type?.toLowerCase(),
                    )
                      ? new Date(detail.horoscope.start_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : `${new Date(detail.horoscope.start_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })} - ${new Date(detail.horoscope.end_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}`}
                  </h2>
                ) : (
                  <p className="mt-2 font-mukta font-medium text-[24px] leading-[30px] tracking-[0px] text-[#D47F2C]">
                    {dict.details.rangeSub[rangeType]}
                  </p>
                )}
                {error ? (
                  <p className="mt-6 font-mukta text-[14px] text-[#a94442]" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="order-3 md:order-2">
                <HoroscopeDetailsZodiacNav
                  validSign={validSign}
                  rangeType={rangeType}
                  uiLanguage={uiLanguage}
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-8 h-40 animate-pulse rounded-xl bg-[#efe1d3]/60" />
            ) : detail ? (
              <>
                <div className="mt-6 flex min-w-0 flex-col gap-6 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-4 lg:h-[272px] lg:opacity-100">
                  <div className="min-w-0 order-2 lg:order-none sm:mt-6">
                    <h2 className="font-sahitya font-bold text-[24px] leading-[32px] tracking-[0%] text-primary whitespace-nowrap sm:text-[28px] sm:leading-[38px]">
                      {capitalizeSign(validSign)}{' '}
                      <span className="inline font-sahitya font-bold text-[24px] leading-[32px] tracking-[0%] text-primary sm:text-[28px] sm:leading-[38px]">
                        (
                        {['today', 'tomorrow', 'yesterday'].includes(
                          detail.horoscope.type?.toLowerCase(),
                        )
                          ? new Date(detail.horoscope.start_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : `${new Date(detail.horoscope.start_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })} - ${new Date(detail.horoscope.end_date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}`}
                        )
                      </span>
                    </h2>
                    <p className="mt-3 font-mukta text-[16px] font-normal leading-[28px] tracking-[0%] text-[#5e4f45] sm:text-[18px] sm:leading-[30px]">
                      {detail.horoscope.general}
                    </p>
                  </div>
                  <div
                    className="hidden md:block order-1 shrink-0 lg:order-none lg:justify-self-end mb-6"
                    style={{ width: '308.29px', height: '297.18px', opacity: 1 }}
                  >
                    <Image
                      src={SIGN_COLOR_IMAGE[validSign]}
                      alt={capitalizeSign(validSign)}
                      className="mb-4 h-full w-full object-contain"
                      sizes="(max-width: 1024px) 160px, 170px"
                      priority={false}
                    />
                    <Link
                      href={zodiacDetailHref(validSign, uiLanguage, uiLanguage)}
                      className="inline-flex w-[366px] h-[44px] items-center justify-center gap-[10px] whitespace-nowrap rounded-[32px] bg-[#611508] px-[16px] py-[6px] opacity-100 font-mukta text-[16px] font-normal leading-[32px] tracking-[0%] text-[#f8f3df] transition-colors hover:bg-[#4f1208] sm:text-[18px] lg:-translate-x-10"
                    >
                      Know More About {capitalizeSign(validSign)} Zodiac
                      <ArrowRight className="h-6 w-6 shrink-0 text-[#f8f3df]" />
                    </Link>
                  </div>
                </div>

                <div className="mt-8 min-w-0 lg:mt-6">
                  <h3 className="font-mukta text-[17px] font-semibold text-[#6f2618] sm:text-[18px]">
                    {interpolate(dict.details.moreFor, { sign: capitalizeSign(validSign) })}
                  </h3>
                  <HoroscopeDetailsSectionPills
                    sectionPills={sectionPills}
                    activeSection={activeSection}
                    onSelect={id => setActiveSectionByView({ key: activeViewKey, section: id })}
                  />

                  <h4 className="mt-5 font-mukta text-[16px] font-bold uppercase text-[#6f2618] sm:mt-6 sm:text-[18px]">
                    {sectionPills.find(p => p.id === activeSection)?.label}
                  </h4>
                  <p className="mt-2 font-mukta text-[15px] leading-7 text-[#5e4f45] sm:text-[16px] sm:leading-8 md:text-[18px] md:leading-7">
                    {sectionBody}
                  </p>
                </div>

                <h3 className="mt-6 font-mukta text-[17px] font-semibold text-[#6f2618] sm:text-[18px] text-center sm:text-left">
                  {interpolate(dict.details.compatibility, { sign: capitalizeSign(validSign) })}
                </h3>
                <CompatibilitySignsGrid
                  className="mt-6"
                  title={''}
                  currentSignLabel={capitalizeSign(validSign)}
                  currentSignImage={SIGN_COLOR_IMAGE[validSign]}
                  currentSignImageLight={SIGN_LIGHT_IMAGE[validSign]}
                  variant="figma"
                  items={compatibilitySigns.map(item => ({
                    ...item,
                    imageLight: SIGN_LIGHT_IMAGE[item.slug],
                    href: compatibilityMatchHref(validSign, item.slug),
                  }))}
                />

                <div className="mt-9 min-w-0">
                  <h3 className="hidden md:block font-mukta text-center text-[18px] font-semibold text-[#6f2618] md:text-left">
                    {dict.details.readOtherSigns}
                  </h3>
                  <div className="hidden md:block">
                    <HoroscopeHeroSignsSection
                      hideTitle
                      highlightSign={validSign}
                      sectionClassName="mt-4 min-w-0 max-w-full bg-transparent py-0"
                      swiperKeySuffix="details-read-other"
                      dataQaId="horoscope-details-other-signs-grid"
                    />
                  </div>
                  <div className="md:hidden">
                    <h2 className="px-1 text-center font-sahitya text-[20px] font-bold leading-[28px] text-[#6b2417] text-balance sm:text-left sm:text-[24px] sm:leading-[34px] lg:text-[28px]">
                      {dict.details.readOtherSigns}
                    </h2>
                    <ZodiacSignExploreSection
                      title={''}
                      className="mt-4"
                      contentLanguage={uiLanguage as ELanguage}
                      headerLanguage={uiLanguage as ELanguage}
                      signSlug={(validSign ?? HOROSCOPE_SIGNS[0]) as HoroscopeSign}
                      isNepali={uiLanguage === ELanguage.NEPALI}
                      onContentLanguageChange={() => {}}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />
      </div>

      <Services />
      <DownloadApp className="mx-auto mt-14 max-w-[1180px]" />
    </main>
  );
}

export default function HoroscopeDetailsPage() {
  return (
    <Suspense fallback={<HoroscopeDetailsFallback />}>
      <HoroscopeDetailsContent />
    </Suspense>
  );
}
