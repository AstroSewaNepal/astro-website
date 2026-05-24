'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import {
  formatDobDisplay,
  formatGenderDisplay,
} from '@/lib/calculators/calculator-form-types';
import {
  getReportDisplayName,
  getSunSignMeta,
  type SunSignMeta,
} from '@/lib/calculators/sun-sign-metadata';

export type SunSignCalculatorResult = CalculatorFormValues & {
  sunSign: string;
};

const STORAGE_KEY = 'sunSignCalculatorResult';

const PROFILE_INTRO =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const ACCENT_VALUE_CLASS = 'font-sahitya text-[16px] font-normal text-[#c49a8f] md:text-[18px]';

type SunSignReportCardProps = {
  meta: SunSignMeta;
  mirrored?: boolean;
};

function SunSignReportCard({ meta, mirrored = false }: SunSignReportCardProps) {
  const signVisual = (
    <div className="flex w-full flex-col items-center justify-center px-2 py-4 sm:w-[42%]">
      <div className="relative h-[120px] w-[120px] md:h-[140px] md:w-[140px]">
        <Image
          src={meta.image}
          alt={meta.englishName}
          fill
          className="object-contain"
          sizes="140px"
        />
      </div>
      <p className="mt-3 font-sahitya text-[28px] font-bold uppercase leading-none text-[#5D1409] md:text-[32px]">
        {meta.englishName}
      </p>
      <p className="mt-2 text-center font-sahitya text-[14px] font-normal text-[#5D1409] md:text-[16px]">
        {meta.dateRangeLong}
      </p>
    </div>
  );

  const signDetails = (
    <div className="flex w-full flex-col justify-center px-4 py-4 sm:w-[58%] sm:px-6">
      <h3 className="font-sahitya text-[22px] font-bold text-[#5D1409] md:text-[26px]">
        Vedic Sun Sign
      </h3>
      <p className="mt-1 font-mukta text-[12px] font-normal text-[#141414] md:text-[14px]">
        Sidereal chart from VedAstro at your birth time
      </p>
      <p className="mt-5 font-mukta text-[15px] font-medium text-[#3d352f] md:text-[16px]">
        {meta.description}
      </p>
      <p className="mt-5 font-mukta text-[14px] font-normal text-[#141414] md:text-[16px]">
        Element: <span className={ACCENT_VALUE_CLASS}>{meta.element}</span>
      </p>
      <p className="mt-2 font-mukta text-[14px] font-normal text-[#141414] md:text-[16px]">
        Ruling Planet: <span className={ACCENT_VALUE_CLASS}>{meta.rulingPlanet}</span>
      </p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#5D1409]/40 bg-[#fffdf9]">
      <div
        className={`flex flex-col items-stretch sm:min-h-[220px] sm:flex-row ${
          mirrored ? 'sm:flex-row-reverse' : ''
        }`}
      >
        {mirrored ? (
          <>
            {signDetails}
            {signVisual}
          </>
        ) : (
          <>
            {signVisual}
            {signDetails}
          </>
        )}
      </div>
    </div>
  );
}

export default function SunSignCalculatorResultSection() {
  const router = useRouter();
  const [data, setData] = useState<SunSignCalculatorResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoaded(true);
      return;
    }

    try {
      setData(JSON.parse(raw) as SunSignCalculatorResult);
    } catch {
      setData(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleCalculateAgain = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push('/calculators/sun-sign-calculator');
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
            Sun Sign Result
          </h1>
          <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
            No result found. Please go back and calculate your sun sign first.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/calculators/sun-sign-calculator"
              className="rounded-full bg-[#5D1409] px-8 py-3.5 font-mukta text-[17px] font-bold text-white hover:opacity-95"
            >
              Go to Sun Sign Calculator
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const meta = getSunSignMeta(data.sunSign);
  const displayName = getReportDisplayName(data.fullName);
  const dobDisplay = formatDobDisplay(data.birthDate);
  const birthTimeDisplay = data.dontKnowTime
    ? 'Unknown'
    : `${data.birthTimeHH}:${data.birthTimeMM} ${data.birthTimeAMPM.toUpperCase()}`;
  const genderDisplay = formatGenderDisplay(data.gender);

  if (!meta) {
    return (
      <section className="w-full px-3 md:px-8 pb-12">
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="font-mukta text-[16px] text-[#2f2f2f]">Unable to load sun sign details.</p>
          <button
            type="button"
            onClick={handleCalculateAgain}
            className="mt-6 rounded-full bg-[#5D1409] px-8 py-3 font-mukta font-bold text-white"
          >
            Calculate Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-3 py-8 md:px-8 md:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-sahitya text-[28px] font-bold text-[#5D1409] md:text-[34px]">
          {displayName}'s Vedic Sun Sign Report
        </h1>
        <p className="mt-2 font-mukta text-[15px] text-[#141414] md:text-[16px]">
          Your sun sign is <span className="font-semibold">{meta.englishName}</span>, a {meta.element.toLowerCase()} sign ruled by {meta.rulingPlanet}.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-[#e4d5c9] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <h2 className="font-sahitya text-[20px] font-bold text-[#5D1409]">
              Birth details
            </h2>
            <div className="mt-5 space-y-3 text-[14px] text-[#3d352f] md:text-[15px]">
              <p>
                <span className="font-semibold">Name:</span> {displayName}
              </p>
              <p>
                <span className="font-semibold">Date of birth:</span> {dobDisplay}
              </p>
              <p>
                <span className="font-semibold">Time of birth:</span> {birthTimeDisplay}
              </p>
              <p>
                <span className="font-semibold">Birth place:</span> {data.birthPlace || '—'}
              </p>
              <p>
                <span className="font-semibold">Gender:</span> {genderDisplay}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e4d5c9] bg-[#FFF5E3] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <h2 className="font-sahitya text-[20px] font-bold text-[#5D1409]">
              Sun sign summary
            </h2>
            <p className="mt-4 text-[15px] text-[#3d352f] md:text-[16px]">
              {meta.englishName} is your Vedic sun sign. It is a {meta.element.toLowerCase()} sign ruled by {meta.rulingPlanet}.
            </p>
            <p className="mt-3 text-[14px] text-[#3d352f] md:text-[15px]">
              This sign covers the approximate sidereal period {meta.dateRangeLong}.
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-[1000px] mx-auto">
          <SunSignReportCard meta={meta} />
        </div>

        <div className="mt-10 flex justify-center lg:mt-12">
          <button
            type="button"
            onClick={handleCalculateAgain}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#5D1409] bg-[#FFF5E3] px-8 font-mukta text-[16px] font-bold text-[#5D1409] transition-colors hover:bg-[#f7e7d2]"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </section>
  );
}
