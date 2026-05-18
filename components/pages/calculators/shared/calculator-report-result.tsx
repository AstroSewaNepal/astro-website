'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  formatDobDisplay,
  formatGenderDisplay,
  type CalculatorFormValues,
} from '@/lib/calculators/calculator-form-types';
import { getReportDisplayName } from '@/lib/calculators/rashi-metadata';

const PERSONAL_INFO_LABEL_CLASS =
  'w-full max-w-[180px] shrink-0 font-mukta text-[16px] font-normal leading-[28px] text-[#c49a8f] md:max-w-[220px] md:text-[18px]';

const PERSONAL_INFO_VALUE_CLASS =
  'min-w-0 flex-1 font-mukta text-[16px] font-normal leading-[28px] text-[#141414] md:text-[18px]';

export type CalculatorReportResultData = CalculatorFormValues & Record<string, unknown>;

type ReportDisplay = {
  title: string;
  subtitle?: string;
  description: string;
  image?: StaticImageData;
  imageAlt?: string;
  fallbackLabel?: string;
};

type CalculatorReportResultProps<T extends CalculatorReportResultData> = {
  storageKey: string;
  calculatorPath: string;
  pageTitle: string;
  pageSubtitle: string;
  emptyTitle: string;
  reportSuffix: string;
  getReportDisplay: (data: T) => ReportDisplay;
  extraPersonalRows?: (data: T) => Array<{ label: string; value: string }>;
};

export default function CalculatorReportResult<T extends CalculatorReportResultData>({
  storageKey,
  calculatorPath,
  pageTitle,
  pageSubtitle,
  emptyTitle,
  reportSuffix,
  getReportDisplay,
  extraPersonalRows,
}: CalculatorReportResultProps<T>) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      setLoaded(true);
      return;
    }

    try {
      setData(JSON.parse(raw) as T);
    } catch {
      setData(null);
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  const handleCalculateAgain = () => {
    sessionStorage.removeItem(storageKey);
    router.push(calculatorPath);
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
          <h1 className="font-sahitya text-[32px] font-bold text-[#5D1409] md:text-[40px]">{emptyTitle}</h1>
          <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
            No result found. Please go back and run the calculator first.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={calculatorPath}
              className="rounded-full bg-[#5D1409] px-8 py-3.5 font-mukta text-[17px] font-bold text-white hover:opacity-95"
            >
              Go to Calculator
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const display = getReportDisplay(data);
  const displayName = getReportDisplayName(data.fullName);

  const personalInfoRows = [
    { label: 'Name', value: displayName },
    { label: 'Date of Birth', value: formatDobDisplay(data.birthDate) },
    { label: 'Gender', value: formatGenderDisplay(data.gender) },
    { label: 'Place of Birth', value: data.birthPlace.trim() || '—' },
    ...(extraPersonalRows?.(data) ?? []),
  ];

  return (
    <section className="w-full px-3 py-8 md:px-8 md:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-sahitya text-[28px] font-bold leading-snug text-[#2f2f2f] md:text-[34px]">
          {pageTitle}
        </h1>
        <p className="mt-3 w-full text-left font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          {pageSubtitle}
        </p>

        <div className="mt-10 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <p className="font-mukta text-[16px] font-bold leading-[30px] text-[#141414] md:text-[18px]">
              {displayName}&apos;s {reportSuffix}
            </p>
            <h2 className="mt-1 font-sahitya text-[40px] font-bold leading-[1.1] text-[#5D1409] md:text-[48px]">
              {display.title}
            </h2>
            {display.subtitle ? (
              <p className="mt-1 font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[16px] md:leading-[28px]">
                ({display.subtitle})
              </p>
            ) : null}
            <p className="mt-4 max-w-[720px] font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[16px] md:leading-[28px]">
              {display.description}
            </p>
          </div>

          <ResultVisual display={display} />
        </div>

        <PersonalInfoSection rows={personalInfoRows} onCalculateAgain={handleCalculateAgain} />
      </div>
    </section>
  );
}

function ResultVisual({ display }: { display: ReportDisplay }) {
  return (
    <div className="mx-auto w-full max-w-[340px] shrink-0 lg:mx-0 lg:max-w-[380px]">
      <div className="flex items-center justify-center rounded-[20px] bg-[#FFF5E3] px-10 py-12 md:rounded-[24px] md:px-12 md:py-14">
        <div className="flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_12px_rgba(93,20,9,0.08)] md:h-[180px] md:w-[180px]">
          {display.image ? (
            <Image
              src={display.image}
              alt={display.imageAlt ?? display.title}
              width={140}
              height={140}
              className="h-[120px] w-[120px] object-contain md:h-[140px] md:w-[140px]"
              priority
            />
          ) : (
            <span className="px-4 text-center font-sahitya text-[24px] font-bold text-[#5D1409] md:text-[28px]">
              {display.fallbackLabel ?? display.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonalInfoSection({
  rows,
  onCalculateAgain,
}: {
  rows: Array<{ label: string; value: string }>;
  onCalculateAgain: () => void;
}) {
  return (
    <div className="mt-12 lg:mt-16">
      <h2 className="font-sahitya text-[20px] font-bold text-[#5D1409] md:text-[22px]">
        Personal Information
      </h2>

      <div className="mt-4 border-t border-[#e8ddd4]">
        {rows.map(row => (
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
          onClick={onCalculateAgain}
          className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#5D1409] bg-[#FFF5E3] px-8 font-mukta text-[16px] font-bold text-[#5D1409] transition-colors hover:bg-[#f7e7d2]"
        >
          Calculate Again
        </button>
      </div>
    </div>
  );
}
