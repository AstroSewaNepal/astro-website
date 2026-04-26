'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import Services from '@/components/pages/landing/services';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Footer from '@/components/pages/landing/footer';
import { fetchVedastroHoroscopeList } from '@/lib/api/vedastro/horoscope';
import {
  horoscopeDetailPageHref,
  parseHoroscopeRangeFromUrl,
} from '@/lib/constants/horoscope-range-nav';
import type { HoroscopeSummaryRow, VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

import LandingPageCSS from '../landing-page.module.css';

type HoroscopeCardMeta = {
  en: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number];
  np: (typeof HOROSCOPE_DATA)[ELanguage.NEPALI][number];
};

function buildHoroscopeMetaBySlug(): Record<string, HoroscopeCardMeta> {
  const en = HOROSCOPE_DATA[ELanguage.ENGLISH];
  const np = HOROSCOPE_DATA[ELanguage.NEPALI];
  const out: Record<string, HoroscopeCardMeta> = {};
  en.forEach((c, i) => {
    out[c.name.toLowerCase()] = { en: c, np: np[i]! };
  });
  return out;
}

const META_BY_SLUG = buildHoroscopeMetaBySlug();

function starCountFromRating(rating: number): number {
  if (!Number.isFinite(rating) || rating <= 0) {
    return 3;
  }
  return Math.min(5, Math.max(1, Math.round(rating)));
}
const RANGE_HERO_COPY: Record<
  VedastroHoroscopeRangeType,
  Record<ELanguage, { title: string; intro: string }>
> = {
  today: {
    [ELanguage.ENGLISH]: {
      title: "Today's Astrology Horoscope",
      intro:
        'See your horoscope for today with a calm, traditional presentation that keeps the zodiac at the center of the page.',
    },
    [ELanguage.NEPALI]: {
      title: 'आजको ज्योतिषीय राशिफल',
      intro:
        'आजको राशिफललाई नेपाली भाषामा स्पष्ट र सजिलो शैलीमा हेर्नुहोस्, जहाँ प्रत्येक राशि छुट्टै रूपमा प्रस्तुत गरिएको छ।',
    },
  },
  yesterday: {
    [ELanguage.ENGLISH]: {
      title: "Yesterday's Astrology Horoscope",
      intro: 'Review yesterday’s sign-by-sign guidance and see how the themes still resonate.',
    },
    [ELanguage.NEPALI]: {
      title: 'हिजोको ज्योतिषीय राशिफल',
      intro: 'हिजोको राशिफल पुनः हेर्नुहोस् र दैनिक संकेतहरूलाई बुझ्नुहोस्।',
    },
  },
  tomorrow: {
    [ELanguage.ENGLISH]: {
      title: "Tomorrow's Astrology Horoscope",
      intro: 'Preview tomorrow’s summaries for every sign so you can plan with a little foresight.',
    },
    [ELanguage.NEPALI]: {
      title: 'भोलिको ज्योतिषीय राशिफल',
      intro: 'भोलिको दिनका लागि राशिअनुसार संक्षिप्त मार्गदर्शन हेर्नुहोस्।',
    },
  },
  week: {
    [ELanguage.ENGLISH]: {
      title: 'Weekly Astrology Horoscope',
      intro: 'Browse the week’s horoscope blurbs for each zodiac sign in one calm grid.',
    },
    [ELanguage.NEPALI]: {
      title: 'साप्ताहिक ज्योतिषीय राशिफल',
      intro: 'यस साताको राशिफल सबै राशिहरूका लागि एकै ठाउँमा।',
    },
  },
  month: {
    [ELanguage.ENGLISH]: {
      title: 'Monthly Astrology Horoscope',
      intro: 'Month-level outlooks for all twelve signs, easy to scan and compare.',
    },
    [ELanguage.NEPALI]: {
      title: 'मासिक ज्योतिषीय राशिफल',
      intro: 'यस महिनाको संक्षिप्त राशिफल सबै राशिहरूका लागि।',
    },
  },
  year: {
    [ELanguage.ENGLISH]: {
      title: 'Yearly Astrology Horoscope',
      intro: 'Year-ahead summaries by sign — a wide lens on the themes ahead.',
    },
    [ELanguage.NEPALI]: {
      title: 'वार्षिक ज्योतिषीय राशिफल',
      intro: 'वर्षभरिको दिशा र संकेतहरू राशिअनुसार संक्षेपमा।',
    },
  },
};

function HoroscopePageContent() {
  const searchParams = useSearchParams();
  const selectedRange = parseHoroscopeRangeFromUrl(searchParams.get('type'));

  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);
  const [rows, setRows] = useState<HoroscopeSummaryRow[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setListLoading(true);
      setListError(null);
      setRows(null);
      fetchVedastroHoroscopeList({ type: selectedRange })
        .then(envelope => {
          if (cancelled) {
            return;
          }
          setRows(envelope.data?.data ?? []);
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            setListError(e instanceof Error ? e.message : 'Could not load horoscopes.');
            setRows([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setListLoading(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRange]);

  type DisplayCard = {
    key: string;
    name: string;
    image: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number]['image'];
    summary: string;
    stars: number;
  };

  const cards = useMemo((): DisplayCard[] | 'loading' => {
    const staticFallback = HOROSCOPE_DATA[language];
    if (listLoading && rows === null) {
      return 'loading';
    }
    if (listError && (!rows || rows.length === 0)) {
      return staticFallback.map(c => ({
        key: c.name.toLowerCase(),
        name: c.name,
        image: c.image,
        summary: c.detail,
        stars: c.numberOfStars,
      }));
    }
    if (!rows?.length) {
      return [];
    }
    return rows.map(row => {
      const slug = row.slug.toLowerCase();
      const meta = META_BY_SLUG[slug];
      const fallbackImage = staticFallback[0]!.image;
      const name =
        meta == null ? row.sign : language === ELanguage.ENGLISH ? meta.en.name : meta.np.name;
      const image =
        meta == null
          ? fallbackImage
          : language === ELanguage.ENGLISH
            ? meta.en.image
            : meta.np.image;
      return {
        key: slug,
        name,
        image,
        summary: row.summary,
        stars: starCountFromRating(row.rating),
      };
    });
  }, [language, listError, listLoading, rows]);

  const copy = RANGE_HERO_COPY[selectedRange][language];

  return (
    <main className={clsx('min-h-screen overflow-hidden', LandingPageCSS.background)}>
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(255,255,255,0)_65%)]" />
        <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <section className="mt-4 rounded-[30px] border border-[#d9c3ad] bg-[rgba(249,242,233,0.88)] px-3 py-4 shadow-[0_18px_60px_rgba(92,56,23,0.12)] backdrop-blur-[2px] sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="font-sahitya text-[34px] leading-none text-[#6b2417] sm:text-[44px] lg:text-[62px]">
                {copy.title}
              </h1>

              <div className="mt-5 flex items-center justify-center gap-2 text-[#ef8a20]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <StartIcon key={`title-star-${index}`} className="h-4 w-4 text-[#ef8a20]" />
                ))}
              </div>

              <p className="mx-auto mt-4 max-w-3xl font-mukta text-[14px] leading-7 text-[#6b5a4e] sm:text-[16px]">
                {copy.intro}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage(ELanguage.ENGLISH)}
                  className={clsx(
                    'rounded-full border px-6 py-2.5 font-mukta text-[15px] transition-colors',
                    language === ELanguage.ENGLISH
                      ? 'border-[#6f2618] bg-[#6f2618] text-white'
                      : 'border-[#b48f74] bg-transparent text-[#6f2618] hover:bg-white/50',
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage(ELanguage.NEPALI)}
                  className={clsx(
                    'rounded-full border px-6 py-2.5 font-mukta text-[15px] transition-colors',
                    language === ELanguage.NEPALI
                      ? 'border-[#6f2618] bg-[#6f2618] text-white'
                      : 'border-[#b48f74] bg-transparent text-[#6f2618] hover:bg-white/50',
                  )}
                >
                  Nepali
                </button>
              </div>
            </div>

            {listError && (!rows || rows.length === 0) ? (
              <p className="mt-4 text-center font-mukta text-[13px] text-[#a94442]" role="alert">
                {listError} Showing sample cards.
              </p>
            ) : null}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              {cards === 'loading' ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`horoscope-skeleton-${selectedRange}-${i}`}
                    className="h-[120px] animate-pulse rounded-[26px] border border-[#c8ad93]/50 bg-[#f4eadf]/60"
                  />
                ))
              ) : cards.length === 0 ? (
                <p className="col-span-full text-center font-mukta text-[15px] text-[#6b5a4e]">
                  No horoscope summaries are available for this period.
                </p>
              ) : (
                cards.map(card => (
                  <Link
                    key={`${selectedRange}-${card.key}`}
                    href={horoscopeDetailPageHref(card.key, selectedRange)}
                    className="block rounded-[26px] border border-[#c8ad93] bg-[#fbf6ee]/90 px-4 py-3 shadow-[0_6px_20px_rgba(97,21,8,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-[22px] border border-[#dfcebc] bg-[#f4eadf]">
                        <Image
                          src={card.image}
                          alt={card.name}
                          className="h-[60px] w-[60px] object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-mukta text-[15px] font-bold leading-6 text-[#742718] sm:text-[16px]">
                            {card.name}
                          </p>
                          <div className="flex items-center gap-0.5 text-[#ef8a20]">
                            {Array.from({ length: card.stars }).map((_, starIndex) => (
                              <StartIcon
                                key={`${card.key}-star-${starIndex}`}
                                className="h-3.5 w-3.5 text-[#ef8a20]"
                              />
                            ))}
                          </div>
                        </div>

                        <p className="mt-1 line-clamp-2 font-mukta text-[11px] leading-[1.35] text-[#706258]">
                          {card.summary}
                        </p>

                        <span className="mt-2 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[12px] font-semibold text-[#7b3b27]">
                          Read More
                          <ArrowRight className="h-3 w-3 text-[#7b3b27]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
          <section className="mx-auto mt-10 max-w-[1180px] px-1 sm:px-2 lg:mt-12">
            <h2 className="font-sahitya text-[26px] font-bold leading-tight text-[#6b2417] sm:text-[28px] lg:text-[30px]">
              What is Horoscope?
            </h2>

            <div className="mt-4 space-y-5 font-mukta text-[15px] leading-8 text-[#5f5248] sm:text-[16px]">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </section>

          <TalkToOurAstrologer className="mx-auto mt-14 max-w-[1180px]" />

          <div className="mx-auto mt-14 max-w-[1180px]">
            <Services />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function HoroscopePageFallback() {
  return (
    <main className={clsx('min-h-screen overflow-hidden', LandingPageCSS.background)}>
      <div className="mx-auto max-w-[1240px] px-4 py-20 text-center font-mukta text-[15px] text-[#6b5a4e]">
        Loading horoscopes…
      </div>
      <Footer />
    </main>
  );
}

export default function HoroscopePage() {
  return (
    <Suspense fallback={<HoroscopePageFallback />}>
      <HoroscopePageContent />
    </Suspense>
  );
}
