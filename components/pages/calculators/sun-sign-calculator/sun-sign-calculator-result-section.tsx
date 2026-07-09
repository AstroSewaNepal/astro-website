'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoShareOutline } from 'react-icons/io5';

import {
  formatBirthTimeDisplay,
  formatDobDisplay,
  formatGenderDisplay,
  type CalculatorFormValues,
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

const ACCENT_VALUE_CLASS = 'font-mukta text-[16px] font-normal text-[#c49a8f] md:text-[18px]';

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
      <p className="mt-3 font-tiro-devanagari text-[28px] font-bold uppercase leading-[1.2] text-[#5D1409] md:text-[32px]">
        {meta.englishName}
      </p>
      <p className="mt-2 text-center font-mukta text-[14px] font-normal leading-[1.2] tracking-[0.02em] text-[#5D1409] md:text-[16px]">
        {meta.dateRangeLong}
      </p>
    </div>
  );

  const signDetails = (
    <div className="flex w-full flex-col justify-center px-4 py-4 sm:w-[58%] sm:px-6">
      <h3 className="font-tiro-devanagari text-[22px] font-bold leading-[1.2] text-[#5D1409] md:text-[26px]">
        Vedic Sun Sign
      </h3>
      <p className="mt-1 font-mukta text-[12px] font-normal text-[#141414] md:text-[14px]">
        Sidereal chart based on accurate planetary positions at your birth time
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
    router.push('/calculators/sun-sign-calculator');
  };

  const copyTextToClipboard = async (text: string) => {
    if (typeof window === 'undefined') return false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to legacy copy behavior below.
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleShareReport = async () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: document.title || 'AstroSewa Sun Sign Result',
      text: 'Check out my Sun Sign result on AstroSewa.',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const copied = await copyTextToClipboard(shareData.url);
      if (copied) {
        return;
      }

      window.prompt('Copy this result link:', shareData.url);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      const copied = await copyTextToClipboard(shareData.url);
      if (!copied) {
        window.prompt('Copy this result link:', shareData.url);
      }
    }
  };

  if (!loaded) {
    return (
      <section className="pt-6 md:pt-12 pb-12">
        <div className="font-mukta text-[16px] text-[#4a423d]">Loading…</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="pt-6 md:pt-12 pb-12">
        <div className="rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
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
  const birthTimeDisplay = formatBirthTimeDisplay(data);
  const genderDisplay = formatGenderDisplay(data.gender);

  if (!meta) {
    return (
      <section className="w-full pb-12">
        <div className="text-center">
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
    <section className="pt-6 md:pt-12 pb-12">
      <div>
        <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
          {displayName}&apos;s Vedic Sun Sign Report
        </h1>
        <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
          Your sun sign is <span className="font-semibold">{meta.englishName}</span>, a{' '}
          {meta.element.toLowerCase()} sign ruled by {meta.rulingPlanet}.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-[#e4d5c9] bg-[#fffdf9] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <h2 className="font-tiro-devanagari text-[20px] font-bold leading-[1.2] text-[#5D1409]">Birth details</h2>
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

          <div className="rounded-[24px] border border-[#e4d5c9] bg-[#fffdf9] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <h2 className="font-tiro-devanagari text-[20px] font-bold leading-[1.2] text-[#5D1409]">Sun sign summary</h2>
            <p className="mt-4 text-[15px] text-[#3d352f] md:text-[16px]">
              {meta.englishName} is your Vedic sun sign. It is a {meta.element.toLowerCase()} sign
              ruled by {meta.rulingPlanet}.
            </p>
            <p className="mt-3 text-[14px] text-[#3d352f] md:text-[15px]">
              This sign covers the approximate sidereal period {meta.dateRangeLong}.
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-[1000px] mx-auto">
          <SunSignReportCard meta={meta} />
        </div>

        <div className="mt-10 flex flex-row items-center gap-3 justify-center lg:mt-12">
          <button
            type="button"
            onClick={handleShareReport}
            className="inline-flex min-h-[52px] w-[calc(50%-0.375rem)] items-center justify-center rounded-full bg-[#5D1409] px-4 font-mukta text-[15px] font-bold text-white transition-opacity hover:opacity-95 sm:w-auto sm:px-8 sm:text-[16px]"
          >
            <IoShareOutline className="mr-2 text-lg" />
            Share Your Report
          </button>
          <button
            type="button"
            onClick={handleCalculateAgain}
            className="inline-flex min-h-[52px] w-[calc(50%-0.375rem)] items-center justify-center rounded-full border border-[#5D1409] bg-[#FFF5E3] px-4 font-mukta text-[15px] font-bold text-[#5D1409] transition-colors hover:bg-[#f7e7d2] sm:w-auto sm:px-8 sm:text-[16px]"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </section>
  );
}
