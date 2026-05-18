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
      <section className="w-full px-3 md:px-8 pb-12">
        <p className="py-24 text-center font-mukta text-[#4a4a4a]">Loading…</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="w-full px-3 md:px-8 pb-12">
        <div className="mx-auto max-w-[900px] rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center">
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
      </section>
    );
  }

  const rows = data.rows ?? [];

  return (
    <section className="w-full px-3 md:px-8 pb-16">
      <div className="mx-auto max-w-[900px]">
        <div className="pt-8 pb-4">
          <h1 className="font-sahitya text-[28px] font-bold text-[#5D1409] md:text-[34px]">
            Numerology Calculator
          </h1>
          <p className="mt-2 font-mukta text-[15px] text-[#6d6d6d]">
            Focus: {data.resultLabel}
            {data.result !== undefined ? ` (${data.result})` : ''}.{' '}
            {data.note ?? 'Pythagorean numerology from name and birth date.'}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#d3c2b4] overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-[#e8ddd4]">
            <h2 className="font-sahitya text-[18px] font-bold text-[#5D1409] mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mukta text-[15px] text-[#2f2f2f]">
              <div>
                <p className="text-[#9a8f87] text-sm">Name</p>
                <p>{data.fullName}</p>
              </div>
              <div>
                <p className="text-[#9a8f87] text-sm">Date of Birth</p>
                <p>{data.birthDate}</p>
              </div>
              {data.birthPlace ? (
                <div className="sm:col-span-2">
                  <p className="text-[#9a8f87] text-sm">Birth place</p>
                  <p>{data.birthPlace}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-6 py-6">
            <h2 className="font-sahitya text-[18px] font-bold text-[#5D1409] mb-4">
              Numerology Analysis
            </h2>
            {rows.length === 0 ? (
              <p className="font-mukta text-[#4a4a4a]">
                No detail rows returned. Try adding birth place and time on the form.
              </p>
            ) : (
              <div className="rounded-[12px] border border-[#e0d6cc] overflow-hidden">
                {rows.map((row, idx) => (
                  <div
                    key={`${row.label}-${idx}`}
                    className={`flex justify-between gap-4 px-4 py-3 font-mukta text-[14px] ${
                      idx < rows.length - 1 ? 'border-b border-[#ede5dc]' : ''
                    }`}
                  >
                    <span className="text-[#5d5047] capitalize">{row.label}</span>
                    <span className="text-[#2f2f2f] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 pb-7">
            <button
              type="button"
              onClick={() => router.push('/calculators/numerology-calculator')}
              className="rounded-full border border-[#5D1409] px-7 py-3 font-mukta text-[15px] font-bold text-[#5D1409]"
            >
              Calculate Again
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
