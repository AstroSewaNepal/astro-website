'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import { ChevronLeftIcon } from '@/components/images/icons';
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
import {
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
  useHoroscopeLocale,
} from '@/lib/i18n';
import type { HoroscopeSummaryRow, VedastroHoroscopeRangeType } from '@/lib/types/vedastro';

import LandingPageCSS from '../landing-page.module.css';

import 'swiper/css';
import 'swiper/css/pagination';

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

type DisplayCard = {
  key: string;
  name: string;
  image: (typeof HOROSCOPE_DATA)[ELanguage.ENGLISH][number]['image'];
  summary: string;
  stars: number;
};

type SignCardLayout = 'grid' | 'carousel';

function HoroscopeSignCardLink(props: {
  card: DisplayCard;
  selectedRange: VedastroHoroscopeRangeType;
  uiLanguage: ELanguage;
  readMoreLabel: string;
  layout: SignCardLayout;
}) {
  const { card, selectedRange, uiLanguage, readMoreLabel, layout } = props;
  /** Mobile carousel mock shows three stars; grid keeps API rating. */
  const starCount = layout === 'carousel' ? 3 : card.stars;
  const innerFlex =
    layout === 'grid'
      ? 'flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-4 md:text-left'
      : 'flex min-h-0 flex-row items-center gap-3 text-left';

  return (
    <Link
      href={horoscopeDetailPageHref(card.key, selectedRange, uiLanguage)}
      className={clsx(
        'group block h-full rounded-[20px] border px-4 py-4 transition-[transform,box-shadow,colors] duration-200 active:scale-[0.99] sm:px-4 sm:py-3 md:rounded-[24px] xl:rounded-[26px]',
        layout === 'carousel' &&
          clsx(
            'snap-start border-[#d4d4d8] bg-white py-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#c4c4c9] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:py-6',
            'min-[380px]:px-5',
          ),
        layout === 'grid' &&
          clsx(
            'border-[#5c4033]/25 bg-transparent hover:-translate-y-0.5 hover:border-[#5c4033]/45 hover:bg-white/20 hover:shadow-[0_6px_20px_rgba(97,21,8,0.06)]',
            /* Desktop grid (Figma): light cards with neutral border */
            'md:border-[#d4d4d8] md:bg-white md:shadow-[0_2px_12px_rgba(0,0,0,0.05)] md:hover:border-[#c4c4c9] md:hover:bg-white',
          ),
      )}
    >
      <div className={innerFlex}>
        <div
          className={clsx(
            'flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] border border-transparent bg-transparent',
            'sm:h-[76px] sm:w-[76px] sm:rounded-[20px]',
            'md:h-[78px] md:w-[78px] md:rounded-[22px]',
            layout === 'grid' && 'md:border-[#dfcebc]/40 md:bg-[#f4eadf]/40',
          )}
        >
          <Image
            src={card.image}
            alt={card.name}
            className="h-[54px] w-[54px] object-contain sm:h-[58px] sm:w-[58px] md:h-[60px] md:w-[60px]"
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className={clsx(
              'flex flex-wrap items-center gap-1.5',
              layout === 'grid' ? 'justify-center md:justify-start' : 'justify-start',
            )}
          >
            <p className="font-mukta text-[15px] font-bold leading-snug text-[#742718] sm:text-[16px]">
              {card.name}
            </p>
            <div className="flex items-center gap-0.5 text-[#ef8a20]">
              {Array.from({ length: starCount }).map((_, starIndex) => (
                <StartIcon
                  key={`${card.key}-star-${starIndex}`}
                  className="h-3 w-3 text-[#ef8a20] sm:h-3.5 sm:w-3.5"
                />
              ))}
            </div>
          </div>

          <p
            className={clsx(
              'mt-1.5 line-clamp-3 font-mukta text-[11px] leading-[1.45] sm:line-clamp-2 sm:text-[11px] md:leading-[1.35]',
              layout === 'carousel'
                ? 'text-[#6b6560] line-clamp-3 sm:line-clamp-3 sm:text-[12px]'
                : 'text-[#706258]',
            )}
          >
            {card.summary}
          </p>

          <span
            className={clsx(
              'mt-3 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[12px] font-semibold text-[#7b3b27]',
              layout === 'grid'
                ? 'justify-center self-center md:mt-2 md:justify-start md:self-start'
                : 'mt-2 self-start',
            )}
          >
            {readMoreLabel}
            <ArrowRight className="h-3 w-3 text-[#7b3b27]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function HoroscopePageContent() {
  const searchParams = useSearchParams();
  const selectedRange = parseHoroscopeRangeFromUrl(searchParams.get('type'));
  const { dict, uiLanguage } = useHoroscopeLocale();
  const copy = dict.range[selectedRange];

  /** Zodiac cards only — does not change header/footer/page chrome. */
  const [signLanguage, setSignLanguage] = useState<ELanguage>(() => readCardDisplayLanguage());

  const [rows, setRows] = useState<HoroscopeSummaryRow[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    persistCardDisplayLanguage(signLanguage);
  }, [signLanguage]);

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

  const swiperRef = useRef<SwiperType | null>(null);

  const cards = useMemo((): DisplayCard[] | 'loading' => {
    const staticFallback = HOROSCOPE_DATA[signLanguage];
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
        meta == null ? row.sign : signLanguage === ELanguage.ENGLISH ? meta.en.name : meta.np.name;
      const image =
        meta == null
          ? fallbackImage
          : signLanguage === ELanguage.ENGLISH
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
  }, [signLanguage, listError, listLoading, rows]);

  return (
    <main className={clsx('min-h-screen overflow-hidden', LandingPageCSS.background)}>
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(255,255,255,0.82),rgba(255,255,255,0)_58%)] sm:h-72" />
        <div className="mx-auto max-w-[1240px] px-3 pb-12 pt-2 sm:px-5 sm:pb-16 sm:pt-4 lg:px-8">
          {/* Hero: transparent panel (page bg). Mobile cards: white tiles per Figma; md+ grid: transparent tiles. */}
          <section
            className={clsx(
              'mt-2 bg-transparent px-2 py-4 sm:mt-4 sm:px-3 sm:py-5 md:px-4 md:py-6 lg:px-6 lg:py-8',
            )}
          >
            <div className="mx-auto max-w-5xl text-center">
              <h1
                className={clsx(
                  'w-full text-center font-tiro-devanagari font-normal tracking-normal',
                  /* Mobile (Figma): 24px / 47.83px, #691709 */
                  'text-[24px] leading-[47.83px] text-[#691709]',
                  /* Tablet scale */
                  'sm:text-[32px] sm:leading-snug',
                  'md:text-[44px] md:leading-[1.08] md:text-[#611508]',
                  /* Desktop (Figma): 56px; line-height proportional so 56px glyphs are not clipped */
                  'lg:text-[56px] lg:leading-[1.05]',
                )}
              >
                {copy.title}
              </h1>

              <p
                className={clsx(
                  'mx-auto mt-3 max-w-3xl font-mukta leading-relaxed text-[#6b5a4e]',
                  'text-[13px] sm:mt-3.5 sm:text-[14px] sm:leading-7',
                  'md:mt-4 md:max-w-[46rem] md:text-[15px]',
                  'lg:mt-5 lg:text-[16px]',
                )}
              >
                {copy.intro}
              </p>

              <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-2 sm:mt-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSignLanguage(ELanguage.ENGLISH)}
                  className={clsx(
                    'min-h-[44px] w-full rounded-full border px-5 py-2.5 font-mukta text-[15px] transition-colors sm:w-auto sm:min-h-0 sm:px-6',
                    signLanguage === ELanguage.ENGLISH
                      ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                      : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setSignLanguage(ELanguage.NEPALI)}
                  className={clsx(
                    'min-h-[44px] w-full rounded-full border px-5 py-2.5 font-mukta text-[15px] transition-colors sm:w-auto sm:min-h-0 sm:px-6',
                    signLanguage === ELanguage.NEPALI
                      ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                      : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
                  )}
                >
                  Nepali
                </button>
              </div>
            </div>

            {listError && (!rows || rows.length === 0) ? (
              <p
                className="mt-4 px-1 text-center font-mukta text-[12px] text-[#a94442] sm:text-[13px]"
                role="alert"
              >
                {listError} {dict.list.errorFallbackSuffix}
              </p>
            ) : null}

            {cards !== 'loading' && cards.length === 0 ? (
              <p className="mt-6 py-6 text-center font-mukta text-[14px] text-[#6b5a4e] sm:mt-8 sm:text-[15px]">
                {dict.list.empty}
              </p>
            ) : (
              <>
                {/* Mobile: carousel with peek, side arrows, pagination dots */}
                <div className="horoscope-hero-swiper-mob relative mt-6 sm:mt-8 md:hidden">
                  <button
                    type="button"
                    aria-label="Previous sign"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="absolute left-0 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 bg-white/95 shadow-sm transition-colors hover:bg-white"
                  >
                    <Image src={ChevronLeftIcon} alt="" className="h-2.5 w-2.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next sign"
                    onClick={() => swiperRef.current?.slideNext()}
                    className="absolute right-0 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#6b2417]/40 bg-white/95 shadow-sm transition-colors hover:bg-white"
                  >
                    <Image
                      src={ChevronLeftIcon}
                      alt=""
                      className="h-2.5 w-2.5 rotate-180 opacity-75"
                    />
                  </button>
                  <Swiper
                    key={`horoscope-mob-${selectedRange}-${signLanguage}-${cards === 'loading' ? 'loading' : cards.map(c => c.key).join(',')}`}
                    modules={[Pagination]}
                    slidesPerView={1.28}
                    spaceBetween={10}
                    centeredSlides
                    slidesOffsetBefore={4}
                    slidesOffsetAfter={4}
                    breakpoints={{
                      400: { slidesPerView: 1.38, spaceBetween: 11 },
                      480: { slidesPerView: 1.48, spaceBetween: 12 },
                    }}
                    className="horoscope-cards-swiper !overflow-visible px-10 pb-9"
                    pagination={{ clickable: true }}
                    onSwiper={swiper => {
                      swiperRef.current = swiper;
                    }}
                  >
                    {cards === 'loading'
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <SwiperSlide
                            key={`horoscope-skeleton-mob-${selectedRange}-${i}`}
                            className="!h-auto"
                          >
                            <div className="min-h-[140px] animate-pulse rounded-[20px] border border-[#d4d4d8] bg-neutral-100" />
                          </SwiperSlide>
                        ))
                      : cards.map(card => (
                          <SwiperSlide key={`mob-${selectedRange}-${card.key}`} className="!h-auto">
                            <HoroscopeSignCardLink
                              card={card}
                              selectedRange={selectedRange}
                              uiLanguage={uiLanguage}
                              readMoreLabel={dict.list.readMore}
                              layout="carousel"
                            />
                          </SwiperSlide>
                        ))}
                  </Swiper>
                </div>

                <div
                  className={clsx(
                    'mt-6 hidden grid-cols-1 gap-3 md:grid',
                    'sm:mt-8 sm:grid-cols-2 sm:gap-4',
                    'xl:grid-cols-4 xl:gap-5',
                  )}
                >
                  {cards === 'loading'
                    ? Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={`horoscope-skeleton-${selectedRange}-${i}`}
                          className="min-h-[120px] animate-pulse rounded-[20px] border border-[#5c4033]/25 bg-transparent md:border-[#d4d4d8] md:bg-neutral-100 md:min-h-[120px] md:rounded-[24px] xl:rounded-[26px]"
                        />
                      ))
                    : cards.map(card => (
                        <HoroscopeSignCardLink
                          key={`${selectedRange}-${card.key}`}
                          card={card}
                          selectedRange={selectedRange}
                          uiLanguage={uiLanguage}
                          readMoreLabel={dict.list.readMore}
                          layout="grid"
                        />
                      ))}
                </div>
              </>
            )}
          </section>

          <section
            className={clsx('mx-auto mt-8 max-w-[1180px] px-2 sm:mt-10 sm:px-3 lg:mt-12 lg:px-4')}
          >
            <h2
              className={clsx(
                'text-center font-tiro-devanagari font-normal leading-tight text-[#611508]',
                'text-[22px] sm:text-[26px] lg:text-[32px]',
              )}
            >
              {dict.section.whatIsTitle}
            </h2>

            <div className="mx-auto mt-3 max-w-3xl space-y-4 text-left font-mukta text-[14px] leading-7 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[15px] sm:leading-8 lg:mt-5 lg:text-[16px] lg:leading-8">
              <p>{dict.section.whatIsP1}</p>
              <p>{dict.section.whatIsP2}</p>
            </div>
          </section>

          <section
            className={clsx('mx-auto mt-8 max-w-[1180px] px-2 sm:mt-10 sm:px-3 lg:mt-10 lg:px-4')}
          >
            <h2
              className={clsx(
                'text-center font-tiro-devanagari font-normal leading-tight text-[#611508]',
                'text-[22px] sm:text-[26px] lg:text-[32px]',
              )}
            >
              {dict.section.whyTitle}
            </h2>
            <div className="mx-auto mt-3 max-w-3xl space-y-4 text-left font-mukta text-[14px] leading-7 text-[#5f5248] sm:mt-4 sm:space-y-5 sm:text-[15px] sm:leading-8 lg:mt-5 lg:text-[16px] lg:leading-8">
              <p>{dict.section.whyP1}</p>
              <p>{dict.section.whyP2}</p>
            </div>
          </section>

          <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />

          <div className="mx-auto mt-10 max-w-[1180px] sm:mt-14">
            <Services />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function HoroscopePageFallback() {
  const { dict } = useHoroscopeLocale();
  return (
    <main className={clsx('min-h-screen overflow-hidden', LandingPageCSS.background)}>
      <div className="mx-auto max-w-[1240px] px-4 py-16 text-center font-mukta text-[14px] text-[#6b5a4e] sm:py-20 sm:text-[15px]">
        {dict.list.loading}
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
