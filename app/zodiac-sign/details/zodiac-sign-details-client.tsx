'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ZodiacDetailLangSwitch } from '@/components/pages/zodiac-sign/zodiac-detail-lang-switch';
import Services from '@/components/pages/landing/services';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { ServiceTalkToAstrologer } from '@/components/images/services';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { fetchVedastroZodiacSignBySlug } from '@/lib/api/vedastro/zodiac-sign';
import { horoscopeDetailPageHref } from '@/lib/constants/horoscope-range-nav';
import { zodiacEnglishDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { ENGLISH_ZODIAC_COLOR } from '@/lib/zodiac-sign/english-zodiac-color';
import { parseZodiacSignParam } from '@/lib/zodiac-sign/parse-sign-param';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import type { VedastroZodiacSignRow } from '@/lib/types/vedastro';
import { unwrapResult } from '@/lib/utils/vedastro-result';

const cardBaseText = 'Your spark can move mountains, start bold today';
const calloutButtons = [{ label: 'Chat Now' }, { label: 'Download app' }];

function capitalizeSign(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function ZodiacSignDetailsClient() {
  const searchParams = useSearchParams();
  const slug = useMemo(() => parseZodiacSignParam(searchParams.get('sign')), [searchParams]);

  const [row, setRow] = useState<VedastroZodiacSignRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIndex = HOROSCOPE_SIGNS.indexOf(slug);
  const displayName = HOROSCOPE_DATA[ELanguage.ENGLISH][signIndex]?.name ?? capitalizeSign(slug);

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

  const title = row?.sign ?? displayName;
  const rangeLine = row?.date_range ?? '';
  const description = row?.intro ?? row?.card_summary ?? '';
  const compatChips = row?.compatibility?.length ? row.compatibility.join(', ') : '—';

  const traitBlocks = row
    ? [
        { label: 'Element', chips: [row.element] },
        { label: 'Ruling Planet', chips: [row.ruling_planet] },
        { label: 'Compatibility', chips: [compatChips] },
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

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-6 max-w-[1180px]">
          <ZodiacDetailLangSwitch signSlug={slug} className="mb-4" />

          <div className="flex items-center gap-3 overflow-x-auto pb-3">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const label = HOROSCOPE_DATA[ELanguage.ENGLISH][i]!.name;
              const active = s === slug;
              return (
                <Link
                  key={s}
                  href={zodiacEnglishDetailHref(s)}
                  className="flex min-w-[62px] flex-col items-center gap-1"
                >
                  <div
                    className={clsx(
                      'flex h-[52px] w-[52px] items-center justify-center rounded-full border bg-[#fcf7ef] p-1.5',
                      active ? 'border-[#f2b400] ring-2 ring-[#f2b400]/20' : 'border-[#d7c4b0]',
                    )}
                  >
                    <Image
                      src={ENGLISH_ZODIAC_COLOR[s]}
                      alt={label}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-mukta text-[10px] text-[#8a7463]">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                {title}
              </h1>
              <p className="mt-1 font-mukta text-[14px] text-[#8a7463]">
                {rangeLine ? `${rangeLine} | ` : null}
                Astronomy and Astrology
              </p>

              <div className="mt-4 max-w-[560px]">
                {loading ? (
                  <p className="font-mukta text-[14px] leading-8 text-[#4f463f]">Loading…</p>
                ) : loadError ? (
                  <p className="font-mukta text-[14px] leading-8 text-[#b42318]">{loadError}</p>
                ) : (
                  <p className="font-mukta text-[14px] leading-8 text-[#4f463f]">{description}</p>
                )}
              </div>

              {!loading && !loadError && traitBlocks.length > 0 ? (
                <div className="mt-6 rounded-[16px] border border-[#ead7c7] bg-[#fffaf2] p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {traitBlocks.map(card => (
                      <div key={card.label}>
                        <p className="font-mukta text-[12px] text-[#9a7d66]">{card.label}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {'chips' in card && card.chips ? (
                            card.chips.map(chip => (
                              <span
                                key={chip}
                                className="rounded-full border border-[#e3c49c] bg-[#f7efd9] px-3 py-1 font-mukta text-[12px] text-[#6f2618]"
                              >
                                {chip}
                              </span>
                            ))
                          ) : (
                            <span className="font-mukta text-[13px] leading-6 text-[#4f463f]">
                              {'value' in card ? card.value : null}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center lg:items-end">
              <div className="flex h-[260px] w-[260px] items-center justify-center rounded-full sm:h-[290px] sm:w-[290px]">
                <Image
                  src={ENGLISH_ZODIAC_COLOR[slug]}
                  alt={displayName}
                  className="h-[190px] w-[190px] object-contain"
                />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={horoscopeDetailPageHref(slug, 'today', ELanguage.ENGLISH)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6f2618] px-4 py-2 font-mukta text-[12px] font-semibold text-[#fff7ec] hover:bg-[#581e13]"
                >
                  Find {displayName} horoscope
                  <ArrowRight className="h-3 w-3 text-[#fff7ec]" />
                </Link>
              </div>
              <div className="px-4 py-1.5 bg-amber-950 rounded-[32px] inline-flex justify-start items-center gap-2.5">
                <div className="justify-start text-orange-100 text-xl font-normal font-['Mukta'] leading-8">
                  Find Cancer Horoscope
                </div>
                <ArrowRight className="h-6 w-6 text-orange-100" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1180px]">
          <h2 className="font-sahitya text-[24px] font-bold text-[#6b2417] sm:text-[28px]">
            Read Horoscope For Other Zodiac Sign
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const card = HOROSCOPE_DATA[ELanguage.ENGLISH][i]!;
              return (
                <Link
                  key={s}
                  href={zodiacEnglishDetailHref(s)}
                  className="block rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
                >
                  <article>
                    <div className="flex items-center gap-2">
                      <Image
                        src={card.image}
                        alt={card.name}
                        className="h-[46px] w-[46px] object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                            {card.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-[#ef8a20]">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <StartIcon
                                key={`${card.name}-${index}`}
                                className="h-3 w-3 text-[#ef8a20]"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                          {cardBaseText}
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
