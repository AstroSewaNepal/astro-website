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
          <p className="py-24 text-center font-mukta text-[#4a4a4a]">Loading…</p>
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

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        return;
      }

      window.prompt('Copy this result link:', shareData.url);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
    }
  };

  return (
    <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
      <div className="max-w-[1454px] mx-auto">
        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="font-sahitya text-[28px] font-bold text-[#5D1409] md:text-[40px]">
            Numerology Calculator
          </h1>
          <p className="mt-2 font-mukta text-sm md:text-lg text-[#141414]">
            Discover your numerology profile and unlock insights about your life path, expression,
            and soul urge
          </p>
        </div>

        {/* Personal Information — no card border */}
        <div className="mb-6">
          <h2
            className="text-[#5D1409] mb-4"
            style={{
              fontFamily: 'Sahitya',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '38px',
              letterSpacing: 0,
            }}
          >
            Personal Information
          </h2>
          <div className="flex flex-col gap-y-4">
            <div>
              <p
                style={{
                  fontFamily: 'Sahitya',
                  fontWeight: 400,
                  fontSize: '22px',
                  lineHeight: '32px',
                  letterSpacing: 0,
                  color: '#9a8f87',
                }}
              >
                Name
              </p>
              <p
                style={{
                  fontFamily: 'Sahitya',
                  fontWeight: 400,
                  fontSize: '22px',
                  lineHeight: '32px',
                  letterSpacing: 0,
                  color: '#2f2f2f',
                }}
              >
                {data.fullName}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Sahitya',
                  fontWeight: 400,
                  fontSize: '22px',
                  lineHeight: '32px',
                  letterSpacing: 0,
                  color: '#9a8f87',
                }}
              >
                Date of Birth
              </p>
              <p
                style={{
                  fontFamily: 'Sahitya',
                  fontWeight: 400,
                  fontSize: '22px',
                  lineHeight: '32px',
                  letterSpacing: 0,
                  color: '#2f2f2f',
                }}
              >
                {data.birthDate}
              </p>
            </div>
            {data.birthPlace ? (
              <div>
                <p
                  style={{
                    fontFamily: 'Sahitya',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '32px',
                    letterSpacing: 0,
                    color: '#9a8f87',
                  }}
                >
                  Birth place
                </p>
                <p
                  style={{
                    fontFamily: 'Sahitya',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '32px',
                    letterSpacing: 0,
                    color: '#2f2f2f',
                  }}
                >
                  {data.birthPlace}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e0d6cc] mb-6" />

        {/* Numerology Analysis — flat two-column table, no outer card border */}
        <div className="mb-8">
          <h2
            className="text-[#5D1409] mb-4"
            style={{
              fontFamily: 'Sahitya',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '38px',
              letterSpacing: 0,
            }}
          >
            Numerology Analysis
          </h2>
          {rows.length === 0 ? (
            <p
              style={{
                fontFamily: 'Sahitya',
                fontWeight: 400,
                fontSize: '22px',
                lineHeight: '32px',
                color: '#4a4a4a',
              }}
            >
              No detail rows returned. Try adding birth place and time on the form.
            </p>
          ) : (
            <div>
              {rows.map((row, idx) => (
                <div
                  key={`${row.label}-${idx}`}
                  className={`grid w-full grid-cols-[300px_minmax(0,1fr)] items-center gap-x-4 py-3 ${
                    idx < rows.length - 1 ? 'border-b border-[#ede5dc]' : ''
                  }`}
                >
                  <span
                    style={{
                      fontFamily: 'Sahitya',
                      fontWeight: 400,
                      fontSize: '22px',
                      lineHeight: '32px',
                      letterSpacing: 0,
                      color: '#9a8f87',
                    }}
                    className="capitalize"
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Sahitya',
                      fontWeight: 400,
                      fontSize: '22px',
                      lineHeight: '32px',
                      letterSpacing: 0,
                      color: '#2f2f2f',
                    }}
                    className="text-left"
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-row items-center gap-[10px]">
          <button
            type="button"
            onClick={handleShareReport}
            className="inline-flex h-[50px] w-[calc(50%-0.3125rem)] items-center justify-center rounded-[32px] bg-[#5D1409] px-[10px] py-[16px] font-mukta text-[16px] leading-[30px] font-semibold text-white transition-opacity hover:opacity-95 sm:w-[240px] sm:text-[18px]"
          >
            Share Your Report
          </button>
          <button
            type="button"
            onClick={() => router.push('/calculators/numerology-calculator')}
            className="inline-flex h-[50px] w-[calc(50%-0.3125rem)] items-center justify-center rounded-[32px] border border-[#5D1409] bg-[#FFF5E3] px-[10px] py-[16px] font-mukta text-[16px] leading-[30px] font-semibold text-[#5D1409] transition-colors hover:bg-[#f7e7d2] sm:w-[240px] sm:text-[18px]"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </section>
  );
}
