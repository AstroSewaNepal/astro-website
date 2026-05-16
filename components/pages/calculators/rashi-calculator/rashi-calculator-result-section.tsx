'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getRashiMeta, getReportDisplayName } from '@/lib/calculators/rashi-metadata';

export type RashiCalculatorResult = {
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthTimeHH: string;
  birthTimeMM: string;
  birthTimeAMPM: string;
  dontKnowTime: boolean;
  rashi: string;
};

const STORAGE_KEY = 'rashiCalculatorResult';

const PERSONAL_INFO_LABEL_CLASS =
  'w-full max-w-[180px] shrink-0 font-mukta text-[16px] font-normal leading-[28px] text-[#c49a8f] md:max-w-[220px] md:text-[18px]';

const PERSONAL_INFO_VALUE_CLASS =
  'min-w-0 flex-1 font-mukta text-[16px] font-normal leading-[28px] text-[#141414] md:text-[18px]';

function formatDobDisplay(isoDate: string) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function formatGenderDisplay(value: string) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RashiCalculatorResultSection() {
  const router = useRouter();
  const [data, setData] = useState<RashiCalculatorResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoaded(true);
      return;
    }

    try {
      setData(JSON.parse(raw) as RashiCalculatorResult);
    } catch {
      setData(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleCalculateAgain = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push('/calculators/rashi-calculator');
  };

  if (!loaded) {
    return (
      <section className="w-full px-3 py-24 md:px-8">
        <div className="mx-auto max-w-[1440px] font-mukta text-[16px] text-[#4a423d]">Loading…</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="w-full px-3 md:px-8 pb-12">
        <div className="mx-auto max-w-[1440px] rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="font-sahitya text-[32px] font-bold text-[#5D1409] md:text-[40px]">
            Rashi Result
          </h1>
          <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
            No result found. Please go back and calculate your Rashi first.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/calculators/rashi-calculator"
              className="rounded-full bg-[#5D1409] px-8 py-3.5 font-mukta text-[17px] font-bold text-white hover:opacity-95"
            >
              Go to Rashi Calculator
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const meta = getRashiMeta(data.rashi);
  const displayName = getReportDisplayName(data.fullName);
  const signLabel = meta?.englishName ?? data.rashi;
  const dateRange = meta?.dateRange ?? '';
  const description =
    meta?.description ??
    'Your Rashi reflects your emotional nature and Vedic personality archetype based on the Moon’s position at birth.';

  const personalInfoRows = [
    { label: 'Name', value: displayName },
    { label: 'Date of Birth', value: formatDobDisplay(data.birthDate) },
    { label: 'Gender', value: formatGenderDisplay(data.gender) },
    { label: 'Place of Birth', value: data.birthPlace.trim() || '—' },
  ];

  return (
    <section className="w-full px-3 py-8 md:px-8 md:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-sahitya text-[28px] font-bold leading-snug text-[#2f2f2f] md:text-[34px]">
          Rashi/Moon Sign Calculator
        </h1>
        <p className="mt-3 w-full text-left font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          Discover your Rashi (moon sign) from your birth date and explore what it reveals about your
          emotional nature in Vedic astrology.
        </p>

        <div className="mt-10 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <p className="font-mukta text-[16px] font-bold leading-[30px] text-[#141414] md:text-[18px]">
              {displayName}&apos;s Rashi Report
            </p>
            <h2 className="mt-1 font-sahitya text-[40px] font-bold leading-[1.1] text-[#5D1409] md:text-[48px]">
              {signLabel}
            </h2>
            {dateRange ? (
              <p className="mt-1 font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[16px] md:leading-[28px]">
                ({dateRange})
              </p>
            ) : null}
            <p className="mt-4 max-w-[720px] font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[16px] md:leading-[28px]">
              {description}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[340px] shrink-0 lg:mx-0 lg:max-w-[380px]">
            <div className="flex items-center justify-center rounded-[20px] bg-[#FFF5E3] px-10 py-12 md:rounded-[24px] md:px-12 md:py-14">
              <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(93,20,9,0.08)] md:h-[180px] md:w-[180px]">
                {meta ? (
                  <Image
                    src={meta.image}
                    alt={meta.englishName}
                    width={120}
                    height={120}
                    className="h-[100px] w-[100px] object-contain md:h-[120px] md:w-[120px]"
                    priority
                  />
                ) : (
                  <span className="font-sahitya text-[32px] font-bold text-[#5D1409]">{data.rashi}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <h2 className="font-sahitya text-[20px] font-bold text-[#5D1409] md:text-[22px]">
            Personal Information
          </h2>

          <div className="mt-4 border-t border-[#e8ddd4]">
            {personalInfoRows.map(row => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-[#e8ddd4] py-4 sm:flex-row sm:items-center sm:gap-6 sm:py-5"
              >
                <span className={PERSONAL_INFO_LABEL_CLASS}>{row.label}</span>
                <span className={PERSONAL_INFO_VALUE_CLASS}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#5D1409] px-8 font-mukta text-[16px] font-bold text-white transition-opacity hover:opacity-95"
            >
              Share Your Report
            </button>
            <button
              type="button"
              onClick={handleCalculateAgain}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#5D1409] bg-[#FFF5E3] px-8 font-mukta text-[16px] font-bold text-[#5D1409] transition-colors hover:bg-[#f7e7d2]"
            >
              Calculate Again
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
