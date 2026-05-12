'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import { CompatibilitySignsGrid } from '@/components/ui/compatibility-signs-grid';
import * as EnglishZodiacImage from '@/components/images/zodiac/english';
import { fetchVedastroHoroscopeDetail } from '@/lib/api/vedastro/horoscope';
import { compatibilityMatchHref } from '@/lib/constants/compatibility-nav';
import {
  horoscopeDetailPageHref,
  horoscopeListPageHref,
  parseHoroscopeRangeFromUrl,
} from '@/lib/constants/horoscope-range-nav';
import { interpolate, readCardDisplayLanguage, useHoroscopeLocale } from '@/lib/i18n';
import { HOROSCOPE_SIGNS, isHoroscopeSign, type HoroscopeSign } from '@/lib/types/horoscope';
import type { HoroscopeDetailData } from '@/lib/types/vedastro';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

const SIGN_COLOR_IMAGE: Record<HoroscopeSign, typeof EnglishZodiacImage.EnglishAriesColor> = {
  aries: EnglishZodiacImage.EnglishAriesColor,
  taurus: EnglishZodiacImage.EnglishTaurusColor,
  gemini: EnglishZodiacImage.EnglishGeminiColor,
  cancer: EnglishZodiacImage.EnglishCancerColor,
  leo: EnglishZodiacImage.EnglishLeoColor,
  virgo: EnglishZodiacImage.EnglishVirgoColor,
  libra: EnglishZodiacImage.EnglishLibraColor,
  scorpio: EnglishZodiacImage.EnglishScorpioColor,
  sagittarius: EnglishZodiacImage.EnglishSagittariusColor,
  capricorn: EnglishZodiacImage.EnglishCapricornColor,
  aquarius: EnglishZodiacImage.EnglishAquariusColor,
  pisces: EnglishZodiacImage.EnglishPiscesColor,
};
const SIGN_LIGHT_IMAGE: Record<HoroscopeSign, typeof EnglishZodiacImage.EnglishAriesLight> = {
  aries: EnglishZodiacImage.EnglishAriesLight,
  taurus: EnglishZodiacImage.EnglishTaurusLight,
  gemini: EnglishZodiacImage.EnglishGeminiLight,
  cancer: EnglishZodiacImage.EnglishCancerLight,
  leo: EnglishZodiacImage.EnglishLeoLight,
  virgo: EnglishZodiacImage.EnglishVirgoLight,
  libra: EnglishZodiacImage.EnglishLibraLight,
  scorpio: EnglishZodiacImage.EnglishScorpioLight,
  sagittarius: EnglishZodiacImage.EnglishSagittariusLight,
  capricorn: EnglishZodiacImage.EnglishCapricornLight,
  aquarius: EnglishZodiacImage.EnglishAquariusLight,
  pisces: EnglishZodiacImage.EnglishPiscesLight,
};

const RANGE_TAB_TYPES = [
  'yesterday',
  'today',
  'week',
  'tomorrow',
  'month',
  'year',
] as const satisfies readonly VedastroHoroscopeRangeType[];

type HoroscopeBodyKey = 'general' | 'love' | 'career' | 'health';

const SECTION_PILL_IDS: HoroscopeBodyKey[] = ['general', 'love', 'career', 'health'];

function capitalizeSign(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function HoroscopeDetailsClient() {
  const { dict, uiLanguage } = useHoroscopeLocale();
  const signLanguage = readCardDisplayLanguage();

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
      fetchVedastroHoroscopeDetail(validSign, { type: rangeType })
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
  }, [validSign, rangeType]);

  const bottomCards = HOROSCOPE_DATA[signLanguage];

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
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        {!validSign ? (
          <section className="mt-7 rounded-[20px] border border-[#dcccbc]  px-4 py-10 text-center sm:px-6">
            <h1 className="font-sahitya text-[28px] text-[#6f2618]">
              {signInvalid ? dict.details.unknownSign : dict.details.chooseSign}
            </h1>
            <p className="mx-auto mt-3 max-w-lg font-mukta text-[15px] leading-7 text-[#5e4f45]">
              {signInvalid ? dict.details.invalidSignHelp : dict.details.pickFromListHelp}
            </p>
            <Link
              href={horoscopeListPageHref('today', uiLanguage)}
              className="mt-6 inline-block rounded-full bg-[#6f2618] px-6 py-2.5 font-mukta text-[14px] text-white"
            >
              {dict.details.backToList}
            </Link>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {HOROSCOPE_SIGNS.map(slug => (
                <Link
                  key={slug}
                  href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d5d3d0]"
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#d5d3d0] bg-[#f2f0ee] p-1.5 transition-[border-color,background-color,box-shadow] duration-200 group-hover:border-[#c9a88a] group-hover:bg-[#faf8f6] group-hover:shadow-sm">
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
          <section className="mt-7 rounded-[20px] border border-[#dcccbc] px-4 py-5 sm:px-6 lg:px-8">
            <h1 className="font-sahitya text-[30px] leading-none text-[#6f2618] sm:text-[44px]">
              {dict.details.rangeHeading[rangeType]}
            </h1>
            <p className="mt-1 font-mukta text-sm text-[#7a6a5e]">
              {dict.details.rangeSub[rangeType]}
            </p>

            {error ? (
              <p className="mt-6 font-mukta text-[14px] text-[#a94442]" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
              {HOROSCOPE_SIGNS.map(slug => {
                const selected = slug === validSign;
                return (
                  <Link
                    key={slug}
                    href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
                    className="group flex flex-col items-center gap-1 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4a11a]/80"
                  >
                    <div
                      className={clsx(
                        'flex h-[52px] w-[52px] items-center justify-center rounded-full border p-1.5 transition-[border-color,box-shadow,background-color] duration-200',
                        selected
                          ? 'border-[#c9a063] bg-[#faf6f0] ring-2 ring-[#e8c47a]/35'
                          : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#c9a88a] group-hover:bg-[#faf8f6] group-hover:shadow-sm',
                      )}
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={SIGN_LIGHT_IMAGE[slug]}
                          alt={capitalizeSign(slug)}
                          className={clsx(
                            'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                            selected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
                          )}
                        />

                        <Image
                          src={SIGN_COLOR_IMAGE[slug]}
                          alt={capitalizeSign(slug)}
                          className={clsx(
                            'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          )}
                        />
                      </div>
                    </div>

                    <span
                      className={clsx(
                        'text-center font-tiro-devanagari text-[11px] font-normal leading-tight transition-colors duration-200 sm:text-[12px]',
                        selected ? 'text-[#611508]' : 'text-[#9a6b5c] group-hover:text-[#691709]',
                      )}
                    >
                      {capitalizeSign(slug)}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-2 border-b border-[#e1d3c6] pb-4">
              {rangeTabs.map(tab => (
                <Link
                  key={tab.type}
                  href={horoscopeDetailPageHref(validSign, tab.type, uiLanguage)}
                  className={clsx(
                    'rounded-sm px-3 py-2 font-mukta text-[10px] uppercase tracking-wide',
                    tab.type === rangeType
                      ? 'bg-[#6f2618] text-white'
                      : 'bg-[#efe1d3] text-[#6d4d3f] hover:bg-[#e9d6c3]',
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {loading ? (
              <div className="mt-8 h-40 animate-pulse rounded-xl bg-[#efe1d3]/60" />
            ) : detail ? (
              <>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
                  <div>
                    <h2 className="font-mukta text-[20px] font-semibold text-[#6f2618]">
                      {capitalizeSign(validSign)} ({detail.basic.date_range})
                    </h2>
                    <p className="mt-1 font-mukta text-[12px] text-[#8a7463]">
                      {detail.basic.element} · {dict.details.astro.ruledBy}{' '}
                      {detail.basic.ruling_planet}
                    </p>
                    <p className="mt-1 font-mukta text-[12px] text-[#8a7463]">
                      {detail.horoscope.start_date} — {detail.horoscope.end_date} ·{' '}
                      {detail.horoscope.type}
                    </p>
                    <p className="mt-2 font-mukta text-[12px] leading-relaxed text-[#6b5a4e]">
                      {dict.details.astro.moonIn} {detail.astro_signals.moon_sign}
                      {detail.astro_signals.mercury_retrograde
                        ? ` · ${dict.details.astro.mercuryRetrograde}`
                        : ''}{' '}
                      · {dict.details.astro.energy} {detail.astro_signals.energy_score}/10 ·{' '}
                      {dict.details.astro.intensity}: {detail.astro_signals.emotional_intensity}
                    </p>
                    <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">
                      {detail.horoscope.general}
                    </p>
                  </div>
                  <div className="mx-auto w-[170px] lg:mx-0 lg:justify-self-end">
                    <Image
                      src={SIGN_COLOR_IMAGE[validSign]}
                      alt={capitalizeSign(validSign)}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
                    {interpolate(dict.details.moreFor, { sign: capitalizeSign(validSign) })}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sectionPills.map(pill => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() =>
                          setActiveSectionByView({ key: activeViewKey, section: pill.id })
                        }
                        className={clsx(
                          'rounded-full border px-3 py-1.5 font-mukta text-[10px] uppercase tracking-wide',
                          activeSection === pill.id
                            ? 'border-[#6f2618] bg-[#6f2618] text-white'
                            : 'border-[#d4b7a3] bg-[#f8eee3] text-[#6f2618] hover:bg-[#f2e1d0]',
                        )}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  <h4 className="mt-6 font-mukta text-[13px] font-semibold uppercase text-[#6f2618]">
                    {sectionPills.find(p => p.id === activeSection)?.label}
                  </h4>
                  <p className="mt-2 font-mukta text-[14px] leading-7 text-[#5e4f45]">
                    {sectionBody}
                  </p>
                </div>

                <CompatibilitySignsGrid
                  className="mt-8"
                  title={interpolate(dict.details.compatibility, {
                    sign: capitalizeSign(validSign),
                  })}
                  currentSignLabel={capitalizeSign(validSign)}
                  currentSignImage={SIGN_COLOR_IMAGE[validSign]}
                  variant="figma"
                  items={compatibilitySigns.map(item => ({
                    ...item,
                    href: compatibilityMatchHref(validSign, item.slug),
                  }))}
                />

                <div className="mt-9">
                  <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
                    {dict.details.readOtherSigns}
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {bottomCards.map((card, idx) => {
                      const slug = HOROSCOPE_SIGNS[idx] ?? card.name.toLowerCase();
                      const selected = slug === validSign;
                      return (
                        <Link
                          key={card.name}
                          href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
                          className={clsx(
                            'group block rounded-[16px] border px-3 py-2 transition-transform hover:-translate-y-0.5',
                            selected
                              ? 'border-[#c9a063] ring-2 ring-[#e8c47a]/35'
                              : 'border-[#cfb8a5]',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative h-[44px] w-[44px] shrink-0">
                              <Image
                                src={card.image}
                                alt={card.name}
                                className={clsx(
                                  'h-[44px] w-[44px] object-contain transition-opacity duration-300',
                                  selected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
                                )}
                              />
                              <Image
                                src={card.imageColor ?? card.image}
                                alt={card.name}
                                className={clsx(
                                  'absolute inset-0 h-[44px] w-[44px] object-contain transition-opacity duration-300',
                                  selected
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                                )}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <h4 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                                  {card.name}
                                </h4>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 3 }).map((_, idx) => (
                                    <StartIcon
                                      key={`${card.name}-${idx}`}
                                      className="h-3 w-3 text-[#ef8a20]"
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                                {card.detail}
                              </p>
                              <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                                {dict.list.readMore}
                                <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        {validSign && detail ? (
          <section className="mx-auto mt-8 max-w-[1180px] px-1 sm:px-2">
            <div>
              <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
                {interpolate(dict.details.combinedHeading, {
                  range: dict.details.rangeHeading[rangeType],
                  sign: capitalizeSign(validSign),
                })}
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">
                {detail.horoscope.general}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
                {interpolate(dict.details.traitsTitle, { sign: capitalizeSign(validSign) })}
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-7 text-[#5e4f45]">
                {detail.personality.traits}
              </p>
              {detail.personality.strengths.length > 0 ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 font-mukta text-[14px] text-[#5e4f45]">
                  {detail.personality.strengths.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : null}
              {detail.personality.weaknesses.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 font-mukta text-[14px] text-[#5e4f45]">
                  {detail.personality.weaknesses.map(w => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ) : null}

        <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

        <div className="mx-auto mt-14 max-w-[1180px]">
          <Services />
        </div>
      </div>
    </main>
  );
}
