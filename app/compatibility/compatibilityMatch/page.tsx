'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';
import { ELanguage } from '@/components/enums/language.enum';

import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { ZodiacSignCardsGrid } from '@/components/ui/zodiac-sign-cards-grid';
import {
  EnglishCancerColor,
  EnglishCancerLight,
  EnglishAriesColor,
  EnglishAriesLight,
  EnglishGeminiColor,
  EnglishGeminiLight,
  EnglishLeoColor,
  EnglishLeoLight,
  EnglishVirgoColor,
  EnglishVirgoLight,
  EnglishLibraColor,
  EnglishLibraLight,
  EnglishScorpioColor,
  EnglishScorpioLight,
  EnglishSagittariusColor,
  EnglishSagittariusLight,
  EnglishCapricornColor,
  EnglishCapricornLight,
  EnglishAquariusColor,
  EnglishAquariusLight,
  EnglishPiscesColor,
  EnglishPiscesLight,
  EnglishTaurusColor,
  EnglishTaurusLight,
} from '@/components/images/zodiac/english';
import { fetchVedastroHoroscopeList } from '@/lib/api/vedastro/horoscope';
import { buildTodayHoroscopeDisplayCards } from '@/lib/horoscope/build-today-horoscope-display-cards';
import {
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
  useHoroscopeLocale,
} from '@/lib/i18n';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import type { HoroscopeSign } from '@/lib/types/horoscope';
import { postZodiacCompatibility } from '@/lib/api/compatibility';
import type { HoroscopeSummaryRow, ZodiacCompatibilityData } from '@/lib/types/vedastro';
import type { TodayHoroscopeDisplayCard } from '@/lib/horoscope/build-today-horoscope-display-cards';

const zodiacImageMap = {
  aries: { color: EnglishAriesColor, light: EnglishAriesLight },
  taurus: { color: EnglishTaurusColor, light: EnglishTaurusLight },
  gemini: { color: EnglishGeminiColor, light: EnglishGeminiLight },
  cancer: { color: EnglishCancerColor, light: EnglishCancerLight },
  leo: { color: EnglishLeoColor, light: EnglishLeoLight },
  virgo: { color: EnglishVirgoColor, light: EnglishVirgoLight },
  libra: { color: EnglishLibraColor, light: EnglishLibraLight },
  scorpio: { color: EnglishScorpioColor, light: EnglishScorpioLight },
  sagittarius: { color: EnglishSagittariusColor, light: EnglishSagittariusLight },
  capricorn: { color: EnglishCapricornColor, light: EnglishCapricornLight },
  aquarius: { color: EnglishAquariusColor, light: EnglishAquariusLight },
  pisces: { color: EnglishPiscesColor, light: EnglishPiscesLight },
} as const;

const signLabels: Record<HoroscopeSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
} as const;

const compatibilityTabs = [
  { key: 'love', label: 'Love' },
  { key: 'sex', label: 'Sex' },
  { key: 'friendship', label: 'Friendship' },
  { key: 'communication', label: 'Communication' },
  { key: 'strength', label: 'Strength' },
  { key: 'weakness', label: 'Weakness' },
] as const;

const compatibilitySignPairs = [
  { sign: 'Aries', image: EnglishAriesColor },
  { sign: 'Taurus', image: EnglishTaurusColor },
  { sign: 'Gemini', image: EnglishGeminiColor },
  { sign: 'Leo', image: EnglishLeoColor },
  { sign: 'Virgo', image: EnglishVirgoColor },
  { sign: 'Libra', image: EnglishLibraColor },
  { sign: 'Scorpio', image: EnglishScorpioColor },
  { sign: 'Sagittarius', image: EnglishSagittariusColor },
  { sign: 'Capricorn', image: EnglishCapricornColor },
  { sign: 'Aquarius', image: EnglishAquariusColor },
  { sign: 'Cancer', image: EnglishCancerColor },
  { sign: 'Pisces', image: EnglishPiscesColor },
];

function OtherSignPairCard({
  firstSign,
  secondSign,
  isActive,
  onClick,
}: {
  firstSign: HoroscopeSign;
  secondSign: HoroscopeSign;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={clsx(
        'flex h-full min-h-[140px] w-full cursor-pointer items-center justify-center gap-4 rounded-[20px] border border-[#464646] p-4 transition-colors hover:border-primary sm:min-h-0',
        isActive ? 'bg-secondary' : 'bg-white/60',
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src={zodiacImageMap[firstSign].color}
          alt={signLabels[firstSign]}
          width={100}
          height={96}
          className="h-20 w-20 object-contain lg:h-24 lg:w-24"
        />
        <span className="font-mukta text-[18px] font-normal leading-[28px] text-primary">
          {signLabels[firstSign]}
        </span>
      </div>

      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        className="flex-shrink-0"
        aria-hidden
      >
        <path
          d="M22.0013 39.1417L19.343 36.7217C9.9013 28.16 3.66797 22.495 3.66797 15.5833C3.66797 9.91833 8.10464 5.5 13.7513 5.5C16.9413 5.5 20.003 6.985 22.0013 9.31333C23.9996 6.985 27.0613 5.5 30.2513 5.5C35.898 5.5 40.3346 9.91833 40.3346 15.5833C40.3346 22.495 34.1013 28.16 24.6596 36.7217L22.0013 39.1417Z"
          fill="#862C23"
        />
      </svg>

      <div className="flex flex-col items-center gap-4">
        <Image
          src={isActive ? zodiacImageMap[secondSign].color : zodiacImageMap[secondSign].light}
          alt={signLabels[secondSign]}
          width={100}
          height={96}
          className="h-20 w-20 object-contain lg:h-24 lg:w-24"
        />
        <span className="font-mukta text-[18px] font-normal leading-[28px] text-primary">
          {signLabels[secondSign]}
        </span>
      </div>
    </div>
  );
}

type HoroscopeCardLayout = 'grid' | 'carousel';

function CompatibilityHoroscopeCardLink({
  card,
  uiLanguage,
  readMoreLabel,
  layout,
}: {
  card: TodayHoroscopeDisplayCard;
  uiLanguage: ELanguage;
  readMoreLabel: string;
  layout: HoroscopeCardLayout;
}) {
  const params = new URLSearchParams();
  params.set('sign', card.key);
  params.set('type', 'today');
  if (uiLanguage && uiLanguage !== ELanguage.ENGLISH) {
    params.set('lang', uiLanguage);
  }
  const href = `/horoscope/details?${params.toString()}`;

  const starCount = layout === 'carousel' ? 3 : card.stars;
  const innerFlex =
    layout === 'grid'
      ? 'flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-4 md:text-left'
      : 'flex min-h-0 flex-row items-center gap-3 text-left';

  return (
    <Link
      href={href}
      className={clsx(
        'group block h-full min-w-0 max-w-full rounded-[20px] border px-4 py-4 transition-[transform,box-shadow,colors] duration-200 active:scale-[0.99] sm:px-4 sm:py-3 md:rounded-[24px] xl:rounded-[26px]',
        layout === 'carousel' &&
          clsx(
            'w-full snap-start border-[#d4d4d8] bg-white py-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#c4c4c9] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:py-5',
            'min-[380px]:px-5 sm:py-6',
          ),
        layout === 'grid' &&
          clsx(
            'border-[#5c4033]/25 bg-transparent hover:-translate-y-0.5 hover:border-[#5c4033]/45 hover:bg-white/20 hover:shadow-[0_6px_20px_rgba(97,21,8,0.06)]',
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
                ? 'line-clamp-3 text-[#6b6560] sm:line-clamp-3 sm:text-[12px]'
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

function RadioDot({ selected }: { selected: boolean }) {
  return selected ? (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
      <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
    </svg>
  );
}

export default function CompatibilityMatchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dict, uiLanguage } = useHoroscopeLocale();
  const signOptions = useMemo(() => HOROSCOPE_SIGNS, []);
  const [yourSign, setYourSign] = useState<HoroscopeSign>('cancer');
  const [partnerSign, setPartnerSign] = useState<HoroscopeSign>('taurus');
  const [pillYourSign, setPillYourSign] = useState<HoroscopeSign>('cancer');
  const [pillPartnerSign, setPillPartnerSign] = useState<HoroscopeSign>('taurus');
  const [yourGender, setYourGender] = useState<'male' | 'female'>('male');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('female');
  const [activeTab, setActiveTab] = useState<(typeof compatibilityTabs)[number]['key']>('love');
  const [compatibilityData, setCompatibilityData] = useState<ZodiacCompatibilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otherSignsScrollRef = useRef<HTMLDivElement>(null);
  const [otherSignsSlideIndex, setOtherSignsSlideIndex] = useState(0);
  const lastHandledQueryRef = useRef<string | null>(null);

  const [horoscopeCardLang, setHoroscopeCardLang] = useState<ELanguage>(() =>
    readCardDisplayLanguage(),
  );
  const [horoscopeRows, setHoroscopeRows] = useState<HoroscopeSummaryRow[] | null>(null);
  const [horoscopeListError, setHoroscopeListError] = useState<string | null>(null);
  const [horoscopeListLoading, setHoroscopeListLoading] = useState(true);
  const [horoscopeListDate, setHoroscopeListDate] = useState<string | null>(null);

  useEffect(() => {
    persistCardDisplayLanguage(horoscopeCardLang);
  }, [horoscopeCardLang]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setHoroscopeListLoading(true);
      setHoroscopeListError(null);
      setHoroscopeRows(null);
      fetchVedastroHoroscopeList({ type: 'today' })
        .then(envelope => {
          if (cancelled) {
            return;
          }
          setHoroscopeRows(envelope.data?.data ?? []);
          setHoroscopeListDate(envelope.data?.date ?? envelope.data?.end_date ?? null);
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            setHoroscopeListError(e instanceof Error ? e.message : 'Could not load horoscopes.');
            setHoroscopeRows([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setHoroscopeListLoading(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const horoscopeSectionCards = useMemo(
    () =>
      buildTodayHoroscopeDisplayCards({
        rows: horoscopeRows,
        listLoading: horoscopeListLoading,
        listError: horoscopeListError,
        signLanguage: horoscopeCardLang,
        listDate: horoscopeListDate,
      }),
    [horoscopeRows, horoscopeListLoading, horoscopeListError, horoscopeCardLang, horoscopeListDate],
  );

  const isValidGender = useCallback((value: string | null): value is 'male' | 'female' => {
    return value === 'male' || value === 'female';
  }, []);

  const isValidSign = useCallback((value: string | null): value is HoroscopeSign => {
    return !!value && HOROSCOPE_SIGNS.includes(value as HoroscopeSign);
  }, []);

  const updateOtherSignsSlideFromScroll = useCallback(() => {
    const el = otherSignsScrollRef.current;
    if (!el || el.children.length === 0) return;
    const first = el.children[0] as HTMLElement;
    const gap = 16;
    const stride = first.offsetWidth + gap;
    if (stride <= 0) return;
    const idx = Math.round((el.scrollLeft + stride * 0.15) / stride);
    setOtherSignsSlideIndex(Math.min(compatibilitySignPairs.length - 1, Math.max(0, idx)));
  }, []);

  const scrollToOtherSignsSlide = useCallback((index: number) => {
    const el = otherSignsScrollRef.current;
    if (!el || el.children.length === 0) return;
    const first = el.children[0] as HTMLElement;
    const stride = first.offsetWidth + 16;
    el.scrollTo({ left: index * stride, behavior: 'smooth' });
  }, []);

  const fetchCompatibility = useCallback(
    async (
      overrides?: Partial<{
        yourSign: HoroscopeSign;
        partnerSign: HoroscopeSign;
        yourGender: 'male' | 'female';
        partnerGender: 'male' | 'female';
      }>,
    ) => {
      const payload = {
        your_sign: overrides?.yourSign ?? yourSign,
        your_gender: overrides?.yourGender ?? yourGender,
        partner_sign: overrides?.partnerSign ?? partnerSign,
        partner_gender: overrides?.partnerGender ?? partnerGender,
      };

      try {
        setLoading(true);
        setError(null);
        const response = await postZodiacCompatibility(payload);
        if (response.success && response.data) {
          setCompatibilityData(response.data);
          setPillYourSign(payload.your_sign);
          setPillPartnerSign(payload.partner_sign);
        } else {
          setError('Failed to fetch compatibility data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Compatibility API error:', err);
      } finally {
        setLoading(false);
      }
    },
    [yourSign, partnerSign, yourGender, partnerGender],
  );

  const currentQuery = searchParams.toString();

  const buildQueryString = useCallback(
    (values?: {
      yourSign: HoroscopeSign;
      partnerSign: HoroscopeSign;
      yourGender: 'male' | 'female';
      partnerGender: 'male' | 'female';
    }) => {
      const params = new URLSearchParams({
        your_sign: values?.yourSign ?? yourSign,
        partner_sign: values?.partnerSign ?? partnerSign,
        your_gender: values?.yourGender ?? yourGender,
        partner_gender: values?.partnerGender ?? partnerGender,
      });
      return params.toString();
    },
    [yourSign, partnerSign, yourGender, partnerGender],
  );

  const handleCompatibilityCardClick = useCallback(
    (secondSign: HoroscopeSign) => {
      // Build query string with current yourSign and the selected partner sign from card
      const params = new URLSearchParams({
        your_sign: yourSign,
        partner_sign: secondSign,
        your_gender: yourGender,
        partner_gender: partnerGender,
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [yourSign, yourGender, partnerGender, pathname, router],
  );

  const handleFindNow = useCallback(() => {
    const nextQuery = buildQueryString();

    // Keep behavior consistent with /compatibility: Find Now syncs selected values to URL.
    if (nextQuery !== currentQuery) {
      router.push(`${pathname}?${nextQuery}`);
      return;
    }

    // If URL already matches current selections, still run API on explicit click.
    void fetchCompatibility();
  }, [buildQueryString, currentQuery, fetchCompatibility, pathname, router]);

  useEffect(() => {
    const incomingYourSign = searchParams.get('your_sign');
    const incomingPartnerSign = searchParams.get('partner_sign');
    const incomingYourGender = searchParams.get('your_gender');
    const incomingPartnerGender = searchParams.get('partner_gender');

    if (
      !isValidSign(incomingYourSign) ||
      !isValidSign(incomingPartnerSign) ||
      !isValidGender(incomingYourGender) ||
      !isValidGender(incomingPartnerGender)
    ) {
      return;
    }

    const queryKey = buildQueryString({
      yourSign: incomingYourSign,
      partnerSign: incomingPartnerSign,
      yourGender: incomingYourGender,
      partnerGender: incomingPartnerGender,
    });

    if (lastHandledQueryRef.current === queryKey) return;
    lastHandledQueryRef.current = queryKey;

    setYourSign(incomingYourSign);
    setPartnerSign(incomingPartnerSign);
    setYourGender(incomingYourGender);
    setPartnerGender(incomingPartnerGender);

    void fetchCompatibility({
      yourSign: incomingYourSign,
      partnerSign: incomingPartnerSign,
      yourGender: incomingYourGender,
      partnerGender: incomingPartnerGender,
    });
  }, [searchParams, isValidSign, isValidGender, fetchCompatibility, buildQueryString]);

  const getTabContent = useCallback(() => {
    if (!compatibilityData) return null;
    const category = compatibilityData.categories.find(cat => cat.key === activeTab);
    return category?.narrative || '';
  }, [compatibilityData, activeTab]);

  const getTabScoreMap = useCallback(() => {
    if (!compatibilityData) return {};
    const scoreMap: Record<string, number> = {};
    compatibilityData.categories.forEach(cat => {
      scoreMap[cat.key] = cat.match_percent || 0;
    });
    return scoreMap;
  }, [compatibilityData]);

  const scoreMap = getTabScoreMap();
  const currentScore = scoreMap[activeTab] || 0;
  const overallScore = compatibilityData?.overall_match_percent || 95;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1728px] px-4 sm:px-8 lg:px-[136px]">
        <section className="mx-auto mt-8 max-w-[1453px] flex flex-col gap-20 pb-20">
          {/* ── Hero / Header ── */}
          <div className="flex flex-col gap-8">
            {/* Top row: title | zodiac pair | match % */}
            <div className="flex flex-col gap-4 border-b border-[#F8F3DF] pb-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <h1 className="font-sahitya text-[36px] font-bold leading-[48px] text-primary">
                  Zodiac Compatibility
                </h1>
                <p className="font-mukta text-[24px] font-medium leading-[30px] text-[#141414]">
                  Love, Sex, Friendship &amp; More
                </p>
              </div>

              {/* Zodiac pair pill */}
              <div className="relative flex items-center justify-center overflow-hidden rounded-[48px] bg-white/70 px-6 py-8 backdrop-blur-md sm:flex-row sm:gap-0 sm:px-10 sm:py-6">
                {/* Your sign */}
                <div className="flex items-center sm:text-left">
                  <span className="font-mukta text-[16px] font-medium uppercase leading-[24px] text-primary sm:text-[20px] sm:leading-[28px]">
                    {signLabels[pillYourSign]}
                  </span>
                  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#ff0066] bg-secondary p-2 sm:h-[84px] sm:w-[84px] sm:p-3">
                    <Image
                      src={zodiacImageMap[pillYourSign].color}
                      alt={pillYourSign}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Heart icon */}
                <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                  <svg
                    width="37"
                    height="34"
                    viewBox="0 0 37 34"
                    fill="none"
                    className="flex-shrink-0 sm:w-[37px] sm:h-[34px]"
                  >
                    <path
                      d="M18.3333 33.6417L15.675 31.2217C6.23333 22.66 0 16.995 0 10.0833C0 4.41833 4.43667 0 10.0833 0C13.2733 0 16.335 1.485 18.3333 3.81333C20.3317 1.485 23.3933 0 26.5833 0C32.23 0 36.6667 4.41833 36.6667 10.0833C36.6667 16.995 30.4333 22.66 20.9917 31.2217L18.3333 33.6417Z"
                      fill="#862C23"
                    />
                  </svg>
                </div>
                {/* Partner sign */}
                <div className="flex items-center gap-2">
                  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#ff0066] bg-secondary p-2 sm:h-[84px] sm:w-[84px] sm:p-3">
                    <Image
                      src={zodiacImageMap[pillPartnerSign].color}
                      alt={pillPartnerSign}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-mukta text-[16px] font-medium uppercase leading-[24px] text-primary sm:text-[20px] sm:leading-[28px]">
                    {signLabels[pillPartnerSign]}
                  </span>
                </div>
              </div>

              {/* Match % */}
              <div className="text-center lg:text-right">
                <span className="font-raleway text-[32px] sm:text-[48px] lg:text-[59px] font-bold leading-[40px] sm:leading-[56px] lg:leading-[65px] text-primary">
                  {overallScore}%Matched
                </span>
              </div>
            </div>

            {/* Content + Sidebar row */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
              {/* Left: tabs + score + description */}
              <div className="flex flex-1 flex-col gap-2.5">
                {/* Tabs */}
                <div className="w-full min-w-0 flex-nowrap items-center gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-full gap-[10px]">
                    {compatibilityTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                          'flex-none rounded-[8px] px-4 py-2 sm:px-5 sm:py-3 font-mukta text-[13px] sm:text-[20px] font-medium uppercase leading-[18px] sm:leading-[28px] transition-colors whitespace-nowrap',
                          activeTab === tab.key
                            ? 'bg-primary text-secondary'
                            : 'bg-secondary text-primary hover:bg-[#ede8d1]',
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score row */}
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mukta text-[24px] font-medium leading-[32px] text-primary capitalize">
                      {activeTab} Compatibility
                    </span>
                    <span className="font-mukta text-[20px] font-semibold text-primary">
                      {loading ? '…' : `${currentScore}%`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#e0d0c0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FFC107] via-[#FF9800] to-[#E74C8C] transition-all duration-500"
                      style={{ width: `${loading ? 0 : currentScore}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="font-mukta text-[16px] leading-[32px] text-[#464646]">
                  {loading ? (
                    <span className="animate-pulse text-[#888]">
                      Loading compatibility details…
                    </span>
                  ) : error ? (
                    <span className="text-red-600">Error: {error}</span>
                  ) : (
                    getTabContent() ||
                    'No additional details available for this compatibility aspect.'
                  )}
                </p>
              </div>

              {/* Right: Find Compatible Partner sidebar */}
              <div className="w-full lg:w-[354px] flex-shrink-0">
                <h3 className="font-mukta text-[20px] font-semibold leading-[28px] text-primary">
                  Find Your Compatible Partner?
                </h3>
                <p className="mt-1 font-mukta text-[16px] leading-[24px] text-[#464646]">
                  Choose your and your partner&apos;s zodiac sign
                  <br />
                  to check compatibility
                </p>

                <div className="mt-4 flex gap-4">
                  {/* Your Sign column */}
                  <div className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-[165px] w-[165px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-4">
                      <Image
                        src={zodiacImageMap[yourSign].color}
                        alt={yourSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <p className="text-center font-mukta text-[16px] font-medium text-Trinary">
                        Your Sign
                      </p>
                      <div className="relative">
                        <select
                          value={yourSign}
                          onChange={e => setYourSign(e.target.value as HoroscopeSign)}
                          className="w-full appearance-none rounded-[32px] border border-Trinary bg-white px-4 py-1.5 pr-8 font-mukta text-[20px] font-medium uppercase leading-[28px] text-primary"
                        >
                          {signOptions.map(s => (
                            <option key={s} value={s}>
                              {signLabels[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 font-mukta text-[20px] font-medium leading-[20px] text-[#141414]">
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="yourGender"
                          className="sr-only"
                          checked={yourGender === 'male'}
                          onChange={() => setYourGender('male')}
                        />
                        <RadioDot selected={yourGender === 'male'} />
                        <span>Man</span>
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="yourGender"
                          className="sr-only"
                          checked={yourGender === 'female'}
                          onChange={() => setYourGender('female')}
                        />
                        <RadioDot selected={yourGender === 'female'} />
                        <span>Woman</span>
                      </label>
                    </div>
                  </div>

                  {/* Partner's Sign column */}
                  <div className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-[165px] w-[165px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-4">
                      <Image
                        src={zodiacImageMap[partnerSign].color}
                        alt={partnerSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <p className="text-center font-mukta text-[16px] font-medium text-Trinary">
                        Partner&apos;s Sign
                      </p>
                      <div className="relative">
                        <select
                          value={partnerSign}
                          onChange={e => setPartnerSign(e.target.value as HoroscopeSign)}
                          className="w-full appearance-none rounded-[32px] border border-Trinary bg-white px-4 py-1.5 pr-8 font-mukta text-[20px] font-medium uppercase leading-[28px] text-primary"
                        >
                          {signOptions.map(s => (
                            <option key={s} value={s}>
                              {signLabels[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 font-mukta text-[20px] font-medium leading-[20px] text-[#141414]">
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="partnerGender"
                          className="sr-only"
                          checked={partnerGender === 'male'}
                          onChange={() => setPartnerGender('male')}
                        />
                        <RadioDot selected={partnerGender === 'male'} />
                        <span>Man</span>
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="partnerGender"
                          className="sr-only"
                          checked={partnerGender === 'female'}
                          onChange={() => setPartnerGender('female')}
                        />
                        <RadioDot selected={partnerGender === 'female'} />
                        <span>Woman</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Find Now button */}
                <button
                  onClick={handleFindNow}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-primary py-2 font-mukta text-[16px] font-semibold leading-[28px] text-secondary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19.3 14.9C19.7 14.2 20 13.4 20 12.5C20 10 18 8 15.5 8C13 8 11 10 11 12.5C11 15 13 17 15.5 17C16.4 17 17.2 16.7 17.9 16.3L20.8 19.2L22.2 17.8L19.3 14.9ZM15.5 15C14.1 15 13 13.9 13 12.5C13 11.1 14.1 10 15.5 10C16.9 10 18 11.1 18 12.5C18 13.9 16.9 15 15.5 15ZM14.7 18.9C14.3 19.3 13.9 19.6 13.5 20L12 21.3L10.5 20C5.4 15.4 2 12.3 2 8.5C2 5.4 4.4 3 7.5 3C9.2 3 10.9 3.8 12 5.1C13.1 3.8 14.8 3 16.5 3C19.6 3 22 5.4 22 8.5C22 9.2 21.9 9.8 21.7 10.5C20.8 7.9 18.4 6 15.5 6C11.9 6 9 8.9 9 12.5C9 15.8 11.5 18.5 14.7 18.9Z"
                      fill="#F8F3DF"
                    />
                  </svg>
                  Find Now
                </button>
              </div>
            </div>
          </div>

          {/* ── Compatibility With Other Signs ── */}
          <div className="flex flex-col gap-8">
            <h2 className="font-sahitya text-[28px] font-bold leading-[38px] text-primary">
              Compatibility With Other Signs
            </h2>

            {useMemo(() => {
              const dynamicPairs = signOptions;

              return (
                <>
                  {/* Mobile: horizontal snap carousel + dots */}
                  <div className="flex flex-col gap-6 sm:hidden">
                    <div
                      ref={otherSignsScrollRef}
                      onScroll={updateOtherSignsSlideFromScroll}
                      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {dynamicPairs.map(secondSign => (
                        <div
                          key={secondSign}
                          className="w-[min(100%,calc(100vw-3.5rem))] max-w-[420px] shrink-0 snap-center"
                        >
                          <OtherSignPairCard
                            firstSign={yourSign}
                            secondSign={secondSign}
                            isActive={pillYourSign === yourSign && pillPartnerSign === secondSign}
                            onClick={() => handleCompatibilityCardClick(secondSign)}
                          />
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex flex-wrap items-center justify-center gap-2"
                      aria-label="Compatibility pair slides"
                    >
                      {dynamicPairs.map((secondSign, i) => (
                        <button
                          key={secondSign}
                          type="button"
                          aria-label={`Go to ${signLabels[yourSign]} and ${signLabels[secondSign]} compatibility`}
                          aria-current={i === otherSignsSlideIndex ? 'true' : undefined}
                          onClick={() => scrollToOtherSignsSlide(i)}
                          className={clsx(
                            'h-2 w-2 rounded-full transition-colors',
                            i === otherSignsSlideIndex ? 'bg-primary' : 'bg-[#C4C4C4]',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tablet / desktop: grid */}
                  <div className="hidden grid-cols-2 gap-4 sm:grid sm:grid-cols-3 xl:grid-cols-4">
                    {dynamicPairs.map(secondSign => (
                      <OtherSignPairCard
                        key={secondSign}
                        firstSign={yourSign}
                        secondSign={secondSign}
                        isActive={pillYourSign === yourSign && pillPartnerSign === secondSign}
                        onClick={() => handleCompatibilityCardClick(secondSign)}
                      />
                    ))}
                  </div>
                </>
              );
            }, [
              signOptions,
              yourSign,
              pillYourSign,
              pillPartnerSign,
              handleCompatibilityCardClick,
              updateOtherSignsSlideFromScroll,
              otherSignsSlideIndex,
              scrollToOtherSignsSlide,
            ])}
          </div>

          {/* ── Read Horoscope For Other Zodiac Signs (today list API + details deep links) ── */}
          <div className="w-full min-w-0 max-w-full overflow-x-clip">
            <div className="flex flex-col gap-6 sm:gap-8">
              <h2 className="px-1 text-center font-sahitya text-[22px] font-bold leading-[30px] text-primary text-balance sm:text-[26px] sm:leading-[34px] md:text-[28px] md:leading-[38px]">
                Read Horoscope For Other Zodiac Signs
              </h2>

              <div className="mx-auto flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => setHoroscopeCardLang(ELanguage.ENGLISH)}
                  className={clsx(
                    'min-h-[44px] w-full rounded-full border px-5 py-2.5 font-mukta text-[15px] transition-colors sm:w-auto sm:min-h-0 sm:px-6',
                    horoscopeCardLang === ELanguage.ENGLISH
                      ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                      : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setHoroscopeCardLang(ELanguage.NEPALI)}
                  className={clsx(
                    'min-h-[44px] w-full rounded-full border px-5 py-2.5 font-mukta text-[15px] transition-colors sm:w-auto sm:min-h-0 sm:px-6',
                    horoscopeCardLang === ELanguage.NEPALI
                      ? 'border-[#6f2618] bg-[#6f2618] text-white shadow-sm'
                      : 'border-[#6f2618] bg-white text-[#6f2618] hover:bg-white/90',
                  )}
                >
                  Nepali
                </button>
              </div>

              <ZodiacSignCardsGrid
                cards={horoscopeSectionCards}
                listError={horoscopeListError}
                emptyLabel={dict.list.empty}
                errorFallbackSuffix={dict.list.errorFallbackSuffix}
                swiperKey={`compatibility-horoscope-${horoscopeCardLang}-${
                  horoscopeSectionCards === 'loading'
                    ? 'loading'
                    : horoscopeSectionCards.map(c => c.key).join(',')
                }`}
                dataQaId="compatibility-horoscope-sign-cards-grid"
                compact
                useSmUpGrid
                className="lg:grid-cols-3"
                renderCard={(card, layout) => (
                  <CompatibilityHoroscopeCardLink
                    card={card}
                    uiLanguage={uiLanguage}
                    readMoreLabel={dict.list.readMore}
                    layout={layout}
                  />
                )}
              />
            </div>
          </div>

          {/* ── Find Clarity Today banner ── */}
          <div
            className="relative overflow-hidden rounded-[40px] lg:rounded-[74px]"
            style={{ background: 'linear-gradient(90deg, #350B04 -50.26%, #691709 100%)' }}
          >
            <div className="flex flex-col items-start gap-8 px-8 py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-[116px] lg:py-10">
              {/* Text + buttons */}
              <div className="flex flex-1 flex-col gap-8">
                <div className="flex flex-col gap-0">
                  <h2 className="font-tiro-devanagari text-[48px] font-normal leading-[122%] text-secondary lg:text-[80px]">
                    Find clarity today.
                  </h2>
                  <p className="font-mukta text-[22px] font-normal capitalize leading-[71px] text-[rgba(255,255,255,0.81)] lg:text-[36px]">
                    Discover Insights Through Vedic Astrology.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <button className="flex items-center gap-1 rounded-[24px] border-2 border-secondary px-8 py-3.5 font-mukta text-[24px] leading-[28px] text-secondary">
                    Chat Now
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12H19"
                        stroke="#F8F3DF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 5L19 12L12 19"
                        stroke="#F8F3DF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="rounded-[24px] bg-secondary px-8 py-3.5 font-mukta text-[24px] leading-[28px] text-black">
                    Download app
                  </button>
                </div>
              </div>

              {/* Mandala image */}
              <div className="hidden lg:block flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/b042b3fb63b0eb77d9201455c8ffeccd2852ff0d?width=752"
                  alt="Vedic astrology wheel"
                  className="h-[286px] w-[376px] object-contain"
                />
              </div>
            </div>
          </div>

          {/* ── Our Services ── */}
          <div>
            <Services />
          </div>

          {/* ── Download App ── */}
          <div>
            <DownloadApp />
          </div>
        </section>
      </div>
    </main>
  );
}
