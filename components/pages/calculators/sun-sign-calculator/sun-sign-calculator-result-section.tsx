'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  getReportDisplayName,
  getSunSignMeta,
  type SunSignMeta,
} from '@/lib/calculators/sun-sign-metadata';

export type SunSignCalculatorResult = {
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthTimeHH: string;
  birthTimeMM: string;
  birthTimeAMPM: string;
  dontKnowTime: boolean;
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
        Western Astrology
      </h3>
      <p className="mt-1 font-mukta text-[12px] font-normal text-[#141414] md:text-[14px]">
        Based on the Tropical Zodiac
      </p>
      <p className="mt-5 font-mukta text-[14px] font-normal text-[#141414] md:text-[16px]">
        Element:{' '}
        <span className={ACCENT_VALUE_CLASS}>{meta.element}</span>
      </p>
      <p className="mt-2 font-mukta text-[14px] font-normal text-[#141414] md:text-[16px]">
        Ruling Planet:{' '}
        <span className={ACCENT_VALUE_CLASS}>{meta.rulingPlanet}</span>
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
          Your Astrological Profile
        </h1>
        <p className="mt-2 font-mukta text-[14px] font-normal text-[#141414] md:text-[16px]">
          Lorem ipsum dolor sit amet, consectetur
        </p>
        <p className="mt-4 max-w-[900px] font-mukta text-[14px] font-normal leading-[24px] text-[#141414] md:text-[16px] md:leading-[28px]">
          {PROFILE_INTRO}
        </p>

        <h2 className="mt-10 text-center font-sahitya text-[22px] font-bold text-[#5D1409] md:mt-12 md:text-[28px]">
          {displayName}&apos;s Sun Sign Report
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <SunSignReportCard meta={meta} />
          <SunSignReportCard meta={meta} mirrored />
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
