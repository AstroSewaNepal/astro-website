'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import LandingFAQ from '@/components/pages/landing/faq';
import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import {
  NepaliAquariusLight,
  NepaliAriesLight,
  NepaliCancerLight,
  NepaliCapricornLight,
  NepaliGeminiLight,
  NepaliLeoLight,
  NepaliLibraLight,
  NepaliPiscesLight,
  NepaliSagittariusLight,
  NepaliScorpioLight,
  NepaliTaurusLight,
  NepaliVirgoLight,
} from '@/components/images/zodiac/nepali';
import { ELanguage } from '@/components/enums/language.enum';
import { fetchVedastroZodiacSignBySlug } from '@/lib/api/vedastro/zodiac-sign';
import { zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { HOROSCOPE_SIGNS, isHoroscopeSign, type HoroscopeSign } from '@/lib/types/horoscope';
import type { VedastroZodiacSignRow } from '@/lib/types/vedastro';
import { unwrapResult } from '@/lib/utils/vedastro-result';

import LandingPageCSS from '../../landing-page.module.css';

const SIGN_NEPALI_LIGHT: Record<HoroscopeSign, typeof NepaliAriesLight> = {
  aries: NepaliAriesLight,
  taurus: NepaliTaurusLight,
  gemini: NepaliGeminiLight,
  cancer: NepaliCancerLight,
  leo: NepaliLeoLight,
  virgo: NepaliVirgoLight,
  libra: NepaliLibraLight,
  scorpio: NepaliScorpioLight,
  sagittarius: NepaliSagittariusLight,
  capricorn: NepaliCapricornLight,
  aquarius: NepaliAquariusLight,
  pisces: NepaliPiscesLight,
};

const cardText = 'Your spark can move mountains, start bold today';

function parseSignParam(raw: string | null): HoroscopeSign {
  const s = raw?.trim().toLowerCase() ?? '';
  if (s && isHoroscopeSign(s)) {
    return s;
  }
  return 'aries';
}

export function ZodiacSignDetailNepaliClient() {
  const searchParams = useSearchParams();
  const slug = useMemo(
    () => parseSignParam(searchParams.get('sign')),
    [searchParams],
  );

  const [language, setLanguage] = useState<'english' | 'nepali'>('english');
  const [row, setRow] = useState<VedastroZodiacSignRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIndex = HOROSCOPE_SIGNS.indexOf(slug);
  const nepaliName = HOROSCOPE_DATA[ELanguage.NEPALI][signIndex]?.name ?? slug;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        const envelope = await fetchVedastroZodiacSignBySlug(slug);
        const data = unwrapResult(envelope);
        if (!cancelled) {
          setRow(data);
        }
      } catch (e) {
        if (!cancelled) {
          setRow(null);
          setLoadError(e instanceof Error ? e.message : 'Could not load zodiac sign.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const traits = row
    ? [
        { label: 'तत्व', value: row.element },
        { label: 'राशिको ग्रह', value: row.ruling_planet },
        {
          label: 'सामञ्जस्यपूर्ण राशि',
          value: row.compatibility?.length ? row.compatibility.join(', ') : '—',
        },
        {
          label: 'बलियो पक्ष',
          value: row.strengths?.length ? row.strengths.join(', ') : '—',
        },
        {
          label: 'चुनौतीपूर्ण पक्ष',
          value: row.weaknesses?.length ? row.weaknesses.join(', ') : '—',
        },
        { label: 'व्यक्तित्व', value: row.personality_traits || '—' },
      ]
    : [];

  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-6 max-w-[1180px]">
          <p className="font-mukta text-[11px] text-[#7a6658]">
            Home &gt; Zodiac Sign - Nepali &gt; Zodiac Sign Detail
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const nepaliLabel = HOROSCOPE_DATA[ELanguage.NEPALI][i]!.name;
              const active = s === slug;
              return (
                <Link
                  key={s}
                  href={zodiacNepaliDetailHref(s)}
                  className="flex min-w-[56px] flex-col items-center gap-1"
                >
                  <div
                    className={clsx(
                      'flex h-[48px] w-[48px] items-center justify-center rounded-full border bg-[#fcf7ef] p-1',
                      active ? 'border-[#f2b400] ring-2 ring-[#f2b400]/20' : 'border-[#d7c4b0]',
                    )}
                  >
                    <Image
                      src={SIGN_NEPALI_LIGHT[s]}
                      alt={nepaliLabel}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="max-w-[56px] truncate text-center font-mukta text-[9px] text-[#8a7463]">
                    {nepaliLabel}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                {nepaliName}
              </h1>
              <p className="mt-1 font-mukta text-[14px] text-[#8a7463]">
                {row?.sign ? `${row.sign} · ` : null}
                {row?.date_range ?? ''}
              </p>

              <div className="mt-3 max-w-[860px]">
                {loading ? (
                  <p className="font-mukta text-[13px] leading-7 text-[#4f463f]">लोड हुँदैछ…</p>
                ) : loadError ? (
                  <p className="font-mukta text-[13px] leading-7 text-[#b42318]">{loadError}</p>
                ) : (
                  <p className="font-mukta text-[13px] leading-7 text-[#4f463f]">
                    {row?.intro ?? row?.card_summary ?? ''}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[10px] bg-[#f4ead2] p-5">
              <Image
                src={SIGN_NEPALI_LIGHT[slug]}
                alt={nepaliName}
                className="mx-auto h-[80px] w-[80px] object-contain"
              />
            </div>
          </div>

          {!loading && !loadError && traits.length > 0 ? (
            <div className="mt-8 overflow-x-auto rounded-[8px] border border-[#ebe0d4]">
              <table className="w-full min-w-[700px] border-collapse">
                <tbody>
                  {traits.map(tr => (
                    <tr key={tr.label} className="border-b border-[#ebe0d4] last:border-b-0">
                      <td className="w-[36%] px-4 py-3 font-mukta text-[13px] text-[#7c6556]">
                        {tr.label}
                      </td>
                      <td className="px-4 py-3 font-mukta text-[13px] text-[#4f463f]">{tr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLanguage('english')}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === 'english'
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('nepali')}
              className={clsx(
                'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
                language === 'nepali'
                  ? 'border-[#6f2618] bg-[#6f2618] text-white'
                  : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
              )}
            >
              Nepali
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const item = {
                name: HOROSCOPE_DATA[ELanguage.ENGLISH][i]!.name,
                image: HOROSCOPE_DATA[ELanguage.ENGLISH][i]!.image,
              };
              return (
                <Link
                  key={s}
                  href={zodiacNepaliDetailHref(s)}
                  className="block rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
                >
                  <article>
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="h-[46px] w-[46px] object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-[#ef8a20]">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <StartIcon
                                key={`${item.name}-${index}`}
                                className="h-3 w-3 text-[#ef8a20]"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                          {cardText}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                          Read More
                          <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          <div className="mt-16">
            <LandingFAQ />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
