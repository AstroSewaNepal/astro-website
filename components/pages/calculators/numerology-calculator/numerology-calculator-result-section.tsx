'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type NumerologyResult = {
  fullName: string;
  birthDate: string;
  birthPlace?: string;
  calculatorType: string;
  resultLabel: string;
  result?: number;
  rows?: Array<{ label: string; value: string }>;
  source?: string;
  note?: string;
};

const LABEL_CLASS =
  'font-sahitya text-[16px] leading-[24px] text-[#9a8f87] md:text-[20px] md:leading-[30px] lg:text-[22px] lg:leading-[32px]';

const VALUE_CLASS =
  'font-sahitya text-[16px] leading-[24px] text-[#2f2f2f] md:text-[20px] md:leading-[30px] lg:text-[22px] lg:leading-[32px]';

const SECTION_TITLE_CLASS =
  'font-sahitya text-[22px] font-bold leading-[30px] text-[#5D1409] md:text-[26px] md:leading-[34px] lg:text-[28px] lg:leading-[38px]';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-row items-center gap-3 border-b border-[#e8ddd4] py-3 sm:gap-4 md:gap-6 md:py-4">
      <span
        className={`w-[42%] min-w-[100px] max-w-[180px] shrink-0 capitalize md:max-w-[220px] ${LABEL_CLASS}`}
      >
        {label}
      </span>
      <span className={`min-w-0 flex-1 break-words ${VALUE_CLASS}`}>{value}</span>
    </div>
  );
}

export default function NumerologyCalculatorResultSection() {
  const router = useRouter();
  const [data, setData] = useState<NumerologyResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('numerologyCalculatorResult');
    if (!raw) {
      setLoaded(true);
      return;
    }
    try {
      setData(JSON.parse(raw) as NumerologyResult);
    } catch {
      setData(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
        <div className="max-w-[1454px] mx-auto">
          <p className="py-12 text-center font-mukta text-[#4a4a4a]">Loading…</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
        <div className="max-w-[1454px] mx-auto">
          <div className="rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center">
            <h1 className="font-sahitya text-[32px] font-bold text-[#5D1409]">Numerology Result</h1>
            <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
              No result found. Please calculate again.
            </p>
            <Link
              href="/calculators/numerology-calculator"
              className="mt-8 inline-block rounded-full bg-[#5D1409] px-8 py-3.5 font-mukta text-[17px] font-bold text-white"
            >
              Go to Numerology Calculator
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const rows = data.rows ?? [];

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
      title: document.title || 'AstroSewa Numerology Result',
      text: 'Check out my Numerology result on AstroSewa.',
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

  return (
    <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
      <div className="max-w-[1454px] mx-auto">
        <div className="pb-4 md:pb-6">
          <h1 className="font-sahitya text-[24px] font-bold leading-[1.2] text-[#5D1409] md:text-[34px] lg:text-[40px]">
            Numerology Calculator
          </h1>
          <p className="mt-2 font-mukta text-[14px] leading-[22px] text-[#141414] md:text-[16px] md:leading-[28px] lg:text-lg">
            Discover your numerology profile and unlock insights about your life path, expression,
            and soul urge
          </p>
        </div>

        <div className="mb-5 md:mb-6">
          <h2 className={`mb-3 md:mb-4 ${SECTION_TITLE_CLASS}`}>Personal Information</h2>
          <div className="border-t border-[#e8ddd4]">
            <InfoRow label="Name" value={data.fullName} />
            <InfoRow label="Date of Birth" value={data.birthDate} />
            {data.birthPlace ? <InfoRow label="Birth place" value={data.birthPlace} /> : null}
          </div>
        </div>

        <div className="border-t border-[#e0d6cc] mb-5 md:mb-8">
          <h2 className={`mt-5 md:mt-6 mb-3 md:mb-4 ${SECTION_TITLE_CLASS}`}>
            Numerology Analysis
          </h2>
          {rows.length === 0 ? (
            <p className={`${VALUE_CLASS} text-[#4a4a4a]`}>
              No detail rows returned. Try adding birth place and time on the form.
            </p>
          ) : (
            <div className="border-t border-[#e8ddd4]">
              {rows.map((row, idx) => (
                <InfoRow key={`${row.label}-${idx}`} label={row.label} value={row.value} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleShareReport}
            className="inline-flex min-h-[52px] w-[calc(50%-0.375rem)] items-center justify-center rounded-full bg-[#5D1409] px-4 font-mukta text-[15px] font-bold text-white transition-opacity hover:opacity-95 sm:w-auto sm:px-8 sm:text-[16px]"
          >
            Share Your Report
          </button>
          <button
            type="button"
            onClick={() => router.push('/calculators/numerology-calculator')}
            className="inline-flex min-h-[52px] w-[calc(50%-0.375rem)] items-center justify-center rounded-full border border-[#5D1409] bg-[#FFF5E3] px-4 font-mukta text-[15px] font-bold text-[#5D1409] transition-colors hover:bg-[#f7e7d2] sm:w-auto sm:px-8 sm:text-[16px]"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </section>
  );
}
