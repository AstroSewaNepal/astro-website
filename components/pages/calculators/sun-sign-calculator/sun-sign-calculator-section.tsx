'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { determineSunSign } from '@/lib/calculators/determine-sun-sign';

type FormValues = {
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthTimeHH: string;
  birthTimeMM: string;
  birthTimeAMPM: string;
  dontKnowTime: boolean;
};

export default function SunSignCalculatorSection() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({
    fullName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    birthTimeHH: '',
    birthTimeMM: '',
    birthTimeAMPM: 'am',
    dontKnowTime: false,
  });
  const [error, setError] = useState('');

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.birthDate) {
      setError('Please enter your date of birth.');
      return;
    }

    setError('');
    const [, month, day] = form.birthDate.split('-').map(Number);
    const sunSign = determineSunSign(month, day);

    sessionStorage.setItem(
      'sunSignCalculatorResult',
      JSON.stringify({
        fullName: form.fullName,
        gender: form.gender,
        birthDate: form.birthDate,
        birthPlace: form.birthPlace,
        birthTimeHH: form.birthTimeHH,
        birthTimeMM: form.birthTimeMM,
        birthTimeAMPM: form.birthTimeAMPM,
        dontKnowTime: form.dontKnowTime,
        sunSign,
      }),
    );

    router.push('/calculators/sun-sign-calculator/result');
  };

  const handleReset = () => {
    setForm({
      fullName: '',
      gender: '',
      birthDate: '',
      birthPlace: '',
      birthTimeHH: '',
      birthTimeMM: '',
      birthTimeAMPM: 'am',
      dontKnowTime: false,
    });
    setError('');
  };

  return (
    <section className="w-full px-3 md:px-8 py-8">
      <div className="mx-auto max-w-[1440px]">

        {/* Title */}
        <h1 className="font-sahitya text-[28px] md:text-[34px] font-bold text-[#2f2f2f] leading-snug">
          Sun Sign Calculator
        </h1>

        {/* Short subtitle */}
        <p className="mt-3 w-full text-left font-mukta text-[14px] font-normal leading-[24px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          Find your sun sign based on your birth date and learn what it reveals about your personality
          and core identity in Western astrology.
        </p>

        {/* Long description */}
        <p className="mt-4 w-full text-left font-mukta text-[16px] font-normal leading-[28px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
          cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p className="mt-4 w-full text-left font-mukta text-[16px] font-normal leading-[28px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
          architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
          sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
          adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem.
        </p>

        {/* ── Fill up the Details Form ── */}
        <div className="mt-10">
          <h2 className="font-sahitya text-[20px] md:text-[22px] font-bold text-[#5D1409] mb-5">
            Fill up the Details
          </h2>

          <div className="rounded-[20px] border border-[#d3c2b4] bg-[#fdf8f2] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">

            {/* Row 1: Full Name + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Full Name */}
              <div>
                <label className="block font-mukta text-[14px] text-[#2f2f2f] mb-1.5">
                  Enter full name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    className="w-full rounded-full border border-[#c9b9aa] bg-white px-4 py-3 font-mukta text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none focus:border-[#5D1409] transition-colors pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D1409] opacity-60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block font-mukta text-[14px] text-[#2f2f2f] mb-1.5">
                  Select gender
                </label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full appearance-none rounded-full border border-[#c9b9aa] bg-white px-4 py-3 font-mukta text-[15px] text-[#2f2f2f] outline-none focus:border-[#5D1409] transition-colors pr-10"
                  >
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D1409]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Date of Birth + Birth Place */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Date of Birth */}
              <div>
                <label className="block font-mukta text-[14px] text-[#2f2f2f] mb-1.5">
                  Enter date of birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={e => handleChange('birthDate', e.target.value)}
                    className="w-full rounded-full border border-[#c9b9aa] bg-white px-4 py-3 font-mukta text-[15px] text-[#2f2f2f] outline-none focus:border-[#5D1409] transition-colors pr-10 [color-scheme:light]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D1409] opacity-70">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Birth Place */}
              <div>
                <label className="block font-mukta text-[14px] text-[#2f2f2f] mb-1.5">
                  Enter birth place
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Kathmandu, Nepal"
                    value={form.birthPlace}
                    onChange={e => handleChange('birthPlace', e.target.value)}
                    className="w-full rounded-full border border-[#c9b9aa] bg-white px-4 py-3 font-mukta text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none focus:border-[#5D1409] transition-colors pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D1409] opacity-60">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Birth Time (full width) */}
            <div className="mb-3">
              <label className="block font-mukta text-[14px] text-[#2f2f2f] mb-1.5">
                Enter birth time
              </label>
              <div className="relative">
                <div className="flex items-center rounded-full border border-[#c9b9aa] bg-white overflow-hidden focus-within:border-[#5D1409] transition-colors">
                  <input
                    type="text"
                    placeholder="hh"
                    maxLength={2}
                    value={form.birthTimeHH}
                    onChange={e => handleChange('birthTimeHH', e.target.value.replace(/\D/g, ''))}
                    disabled={form.dontKnowTime}
                    className="w-12 text-center bg-transparent px-2 py-3 font-mukta text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none disabled:opacity-40"
                  />
                  <span className="font-mukta text-[15px] text-[#b0a098]">/</span>
                  <input
                    type="text"
                    placeholder="mm"
                    maxLength={2}
                    value={form.birthTimeMM}
                    onChange={e => handleChange('birthTimeMM', e.target.value.replace(/\D/g, ''))}
                    disabled={form.dontKnowTime}
                    className="w-12 text-center bg-transparent px-2 py-3 font-mukta text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none disabled:opacity-40"
                  />
                  <span className="font-mukta text-[15px] text-[#b0a098]">/</span>
                  <select
                    value={form.birthTimeAMPM}
                    onChange={e => handleChange('birthTimeAMPM', e.target.value)}
                    disabled={form.dontKnowTime}
                    className="bg-transparent px-2 py-3 font-mukta text-[15px] text-[#2f2f2f] outline-none disabled:opacity-40 cursor-pointer"
                  >
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                  </select>
                  <span className="ml-auto pr-4 text-[#5D1409] opacity-60">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Don't know time checkbox */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleChange('dontKnowTime', !form.dontKnowTime)}
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                  form.dontKnowTime ? 'border-[#5D1409] bg-[#5D1409]' : 'border-[#9a8f87] bg-white'
                }`}
              />
              <span className="font-mukta text-[14px] text-[#2f2f2f]">
                Don&apos;t know my exact birth of time
              </span>
            </div>

            {error && (
              <p className="mb-4 font-mukta text-[14px] text-[#8d1f1f]" role="alert">
                {error}
              </p>
            )}

            {/* Note */}
            <p className="font-mukta text-[13px] text-[#5D1409] mb-6">
              <span className="font-bold">Note:</span> Without time of birth, we can still achieve up to{' '}
              <span className="font-bold">80% accurate</span> prediction
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full min-h-[52px] rounded-full bg-[#5D1409] font-mukta text-[16px] font-bold text-white hover:opacity-95 transition-opacity"
              >
                Find Your Sun Sign
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full min-h-[52px] rounded-full border border-[#5D1409] bg-transparent font-mukta text-[16px] font-bold text-[#5D1409] hover:bg-[#5D1409]/5 transition-colors"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* ── Info Sections ── */}
        <div className="mt-12 space-y-0">
          {[
            {
              title: 'How Does a Sun Sign Calculator Work?',
              body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            },
            {
              title: 'How Does a Sun Sign Calculator Work?',
              body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            },
            {
              title: 'How Does a Sun Sign Calculator Work?',
              body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            },
          ].map((section, idx) => (
            <div key={idx} className="pt-8 pb-2">
              <h2 className="font-sahitya text-[18px] md:text-[20px] font-bold text-[#2f2f2f] mb-3">
                {section.title}
              </h2>
              <p className="w-full text-left font-mukta text-[16px] font-normal leading-[28px] text-[#4a423d] md:text-[18px] md:leading-[30px]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}