'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useHoroscopeLocale } from '@/lib/i18n/horoscope/horoscope-locale-context';
import { interpolate, readCardDisplayLanguage } from '@/lib/i18n/horoscope';
import Footer from '@/components/pages/landing/footer';
import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
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
import { fetchVedastroHoroscopeDetail } from '@/lib/api/vedastro/horoscope';
import {
  horoscopeDetailPageHref,
  horoscopeListPageHref,
  parseHoroscopeRangeFromUrl,
} from '@/lib/constants/horoscope-range-nav';
import { HOROSCOPE_SIGNS, isHoroscopeSign, type HoroscopeSign } from '@/lib/types/horoscope';
import type { HoroscopeDetailData } from '@/lib/types/vedastro';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

import LandingPageCSS from '../../landing-page.module.css';

const SIGN_COLOR_IMAGE: Record<HoroscopeSign, typeof EnglishAriesColor> = {
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
    return HOROSCOPE_SIGNS.filter(s => s !== validSign).map(s => ({
      slug: s,
      name: capitalizeSign(s),
      image: SIGN_COLOR_IMAGE[s],
    }));
  }, [validSign]);

  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        {!validSign ? (
          <section className="mt-7 rounded-[20px] border border-[#dcccbc] bg-[#f9f2e8]/95 px-4 py-10 text-center sm:px-6">
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
                  className="flex flex-col items-center gap-1 rounded-xl border border-[#d7c3b1] bg-[#fdf8f1] p-2 transition-colors hover:border-[#f4a11a]"
                >
                  <Image
                    src={SIGN_COLOR_IMAGE[slug]}
                    alt={capitalizeSign(slug)}
                    className="h-12 w-12 object-contain"
                  />
                  <span className="font-mukta text-[11px] text-[#6f2618]">
                    {capitalizeSign(slug)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-7 rounded-[20px] border border-[#dcccbc] bg-[#f9f2e8]/95 px-4 py-5 sm:px-6 lg:px-8">
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
                    className="group flex flex-col items-center gap-1"
                  >
                    <div
                      className={clsx(
                        'flex h-[52px] w-[52px] items-center justify-center rounded-full border bg-[#fcf7ef] p-1.5 transition-colors',
                        selected
                          ? 'border-[#f4a11a] ring-2 ring-[#f4a11a]/25'
                          : 'border-[#ccb39f] group-hover:border-[#f4a11a]/70',
                      )}
                    >
                      <Image
                        src={SIGN_COLOR_IMAGE[slug]}
                        alt={capitalizeSign(slug)}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-mukta text-[10px] text-[#8a7463]">
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

                <div className="mt-8">
                  <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
                    {interpolate(dict.details.compatibility, { sign: capitalizeSign(validSign) })}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {compatibilitySigns.map(item => (
                      <Link
                        key={item.slug}
                        href={horoscopeDetailPageHref(item.slug, rangeType, uiLanguage)}
                        className="rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] px-2 py-2 transition-colors hover:border-[#f4a11a]/80"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Image
                            src={SIGN_COLOR_IMAGE[validSign]}
                            alt={capitalizeSign(validSign)}
                            className="h-[42px] w-[42px] object-contain"
                          />
                          <span className="text-[14px] text-[#ff1a78]">❤</span>
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="h-[42px] w-[42px] object-contain"
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between px-1">
                          <span className="font-mukta text-[10px] text-[#846e5f]">
                            {capitalizeSign(validSign)}
                          </span>
                          <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-9">
                  <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">
                    {dict.details.readOtherSigns}
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {bottomCards.map(card => {
                      const slug = card.name.toLowerCase();
                      return (
                        <Link
                          key={card.name}
                          href={horoscopeDetailPageHref(slug, rangeType, uiLanguage)}
                          className="block rounded-[16px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-transform hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={card.image}
                              alt={card.name}
                              className="h-[44px] w-[44px] object-contain"
                            />
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

      <Footer />
    </main>
  );
}
