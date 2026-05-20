'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  NorthIndianOpenChartWithPlanets,
  OPEN_CHART_FRAME_CLASS,
} from '@/components/pages/free-kundali/north-indian-open-chart';
import DoshaRemediesSection from '@/components/pages/free-kundali/dosha-remedies-section';
import {
  DOSHA_DISPLAY_ORDER,
  type AllDoshaResult,
  type DoshaStrength,
} from '@/lib/vedastro/dosha-types';

type StoredKundaliResult = {
  fullName: string;
  birthPlace: string;
  dateOfBirth: string;
  birthTime: string;
  gender?: string;
  latitude?: string;
  longitude?: string;
  payload: unknown;
  /** Cached sidereal planet table rows (from VedAstro AllPlanetData). */
  planetRows?: string[][];
  /** Seven-dosha engine output from GET /vedastro/dosha. */
  doshas?: AllDoshaResult;
};

function toTitleCase(value: string | undefined): string {
  if (!value) return '-';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getNestedValue(source: Record<string, unknown> | undefined, keys: string[]): unknown {
  let current: unknown = source;
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function formatPanchangaValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(formatPanchangaValue)
      .filter(v => v !== '-')
      .join(', ');
  }

  if (value && typeof value === 'object') {
    const candidateKeys = [
      'Name',
      'name',
      'Value',
      'value',
      'StdTime',
      'DegreeMinuteSecond',
      'Description',
      'description',
      'Text',
      'text',
    ];

    for (const key of candidateKeys) {
      if (key in value) {
        const nestedValue = (value as Record<string, unknown>)[key];
        const formatted = formatPanchangaValue(nestedValue);
        if (formatted !== '-') return formatted;
      }
    }

    const nested = Object.values(value)
      .map(formatPanchangaValue)
      .filter(v => v !== '-')
      .join(' ');

    return nested || '-';
  }

  return '-';
}

function doshaStrengthClass(strength: DoshaStrength): string {
  if (strength === 'Strong') return 'text-[#7F1808]';
  if (strength === 'Mild') return 'text-[#a16207]';
  return 'text-[#2d6a4f]';
}

function planetHouseBullets(planetRows: string[][]): string[] {
  return planetRows.map(row => {
    const planet = row[0] ?? '—';
    const house = row[5] ?? '—';
    return `${planet} is in ${house} in your birth chart.`;
  });
}

function getPanchangaValue(
  source: Record<string, unknown> | undefined,
  ...paths: string[][]
): string {
  for (const path of paths) {
    const value = getNestedValue(source, path);
    if (value !== undefined && value !== null) {
      const formatted = formatPanchangaValue(value);
      if (formatted !== '-') return formatted;
    }
  }
  return '-';
}

type RashiLabel = { hindi: string; english: string };

const NAKSHATRA_PADA_TO_RASHI: Record<string, Record<number, RashiLabel>> = {
  ashwini: {
    1: { hindi: 'Mesh', english: 'Aries' },
    2: { hindi: 'Mesh', english: 'Aries' },
    3: { hindi: 'Mesh', english: 'Aries' },
    4: { hindi: 'Mesh', english: 'Aries' },
  },
  bharani: {
    1: { hindi: 'Mesh', english: 'Aries' },
    2: { hindi: 'Mesh', english: 'Aries' },
    3: { hindi: 'Mesh', english: 'Aries' },
    4: { hindi: 'Mesh', english: 'Aries' },
  },
  krittika: {
    1: { hindi: 'Mesh', english: 'Aries' },
    2: { hindi: 'Vrishabh', english: 'Taurus' },
    3: { hindi: 'Vrishabh', english: 'Taurus' },
    4: { hindi: 'Vrishabh', english: 'Taurus' },
  },
  rohini: {
    1: { hindi: 'Vrishabh', english: 'Taurus' },
    2: { hindi: 'Vrishabh', english: 'Taurus' },
    3: { hindi: 'Vrishabh', english: 'Taurus' },
    4: { hindi: 'Vrishabh', english: 'Taurus' },
  },
  mrigashira: {
    1: { hindi: 'Vrishabh', english: 'Taurus' },
    2: { hindi: 'Vrishabh', english: 'Taurus' },
    3: { hindi: 'Mithun', english: 'Gemini' },
    4: { hindi: 'Mithun', english: 'Gemini' },
  },
  mrigasira: {
    1: { hindi: 'Vrishabh', english: 'Taurus' },
    2: { hindi: 'Vrishabh', english: 'Taurus' },
    3: { hindi: 'Mithun', english: 'Gemini' },
    4: { hindi: 'Mithun', english: 'Gemini' },
  },
  ardra: {
    1: { hindi: 'Mithun', english: 'Gemini' },
    2: { hindi: 'Mithun', english: 'Gemini' },
    3: { hindi: 'Mithun', english: 'Gemini' },
    4: { hindi: 'Mithun', english: 'Gemini' },
  },
  aridra: {
    1: { hindi: 'Mithun', english: 'Gemini' },
    2: { hindi: 'Mithun', english: 'Gemini' },
    3: { hindi: 'Mithun', english: 'Gemini' },
    4: { hindi: 'Mithun', english: 'Gemini' },
  },
  punarvasu: {
    1: { hindi: 'Mithun', english: 'Gemini' },
    2: { hindi: 'Mithun', english: 'Gemini' },
    3: { hindi: 'Mithun', english: 'Gemini' },
    4: { hindi: 'Kark', english: 'Cancer' },
  },
  pushya: {
    1: { hindi: 'Kark', english: 'Cancer' },
    2: { hindi: 'Kark', english: 'Cancer' },
    3: { hindi: 'Kark', english: 'Cancer' },
    4: { hindi: 'Kark', english: 'Cancer' },
  },
  ashlesha: {
    1: { hindi: 'Kark', english: 'Cancer' },
    2: { hindi: 'Kark', english: 'Cancer' },
    3: { hindi: 'Kark', english: 'Cancer' },
    4: { hindi: 'Kark', english: 'Cancer' },
  },
  magha: {
    1: { hindi: 'Singh', english: 'Leo' },
    2: { hindi: 'Singh', english: 'Leo' },
    3: { hindi: 'Singh', english: 'Leo' },
    4: { hindi: 'Singh', english: 'Leo' },
  },
  purvaphalguni: {
    1: { hindi: 'Singh', english: 'Leo' },
    2: { hindi: 'Singh', english: 'Leo' },
    3: { hindi: 'Singh', english: 'Leo' },
    4: { hindi: 'Singh', english: 'Leo' },
  },
  uttaraphalguni: {
    1: { hindi: 'Singh', english: 'Leo' },
    2: { hindi: 'Kanya', english: 'Virgo' },
    3: { hindi: 'Kanya', english: 'Virgo' },
    4: { hindi: 'Kanya', english: 'Virgo' },
  },
  hasta: {
    1: { hindi: 'Kanya', english: 'Virgo' },
    2: { hindi: 'Kanya', english: 'Virgo' },
    3: { hindi: 'Kanya', english: 'Virgo' },
    4: { hindi: 'Kanya', english: 'Virgo' },
  },
  chitra: {
    1: { hindi: 'Kanya', english: 'Virgo' },
    2: { hindi: 'Kanya', english: 'Virgo' },
    3: { hindi: 'Tula', english: 'Libra' },
    4: { hindi: 'Tula', english: 'Libra' },
  },
  swati: {
    1: { hindi: 'Tula', english: 'Libra' },
    2: { hindi: 'Tula', english: 'Libra' },
    3: { hindi: 'Tula', english: 'Libra' },
    4: { hindi: 'Tula', english: 'Libra' },
  },
  vishakha: {
    1: { hindi: 'Tula', english: 'Libra' },
    2: { hindi: 'Tula', english: 'Libra' },
    3: { hindi: 'Tula', english: 'Libra' },
    4: { hindi: 'Vrischik', english: 'Scorpio' },
  },
  anuradha: {
    1: { hindi: 'Vrischik', english: 'Scorpio' },
    2: { hindi: 'Vrischik', english: 'Scorpio' },
    3: { hindi: 'Vrischik', english: 'Scorpio' },
    4: { hindi: 'Vrischik', english: 'Scorpio' },
  },
  jyeshtha: {
    1: { hindi: 'Vrischik', english: 'Scorpio' },
    2: { hindi: 'Vrischik', english: 'Scorpio' },
    3: { hindi: 'Vrischik', english: 'Scorpio' },
    4: { hindi: 'Vrischik', english: 'Scorpio' },
  },
  mula: {
    1: { hindi: 'Dhanu', english: 'Sagittarius' },
    2: { hindi: 'Dhanu', english: 'Sagittarius' },
    3: { hindi: 'Dhanu', english: 'Sagittarius' },
    4: { hindi: 'Dhanu', english: 'Sagittarius' },
  },
  purvashada: {
    1: { hindi: 'Dhanu', english: 'Sagittarius' },
    2: { hindi: 'Dhanu', english: 'Sagittarius' },
    3: { hindi: 'Dhanu', english: 'Sagittarius' },
    4: { hindi: 'Dhanu', english: 'Sagittarius' },
  },
  uttarashada: {
    1: { hindi: 'Dhanu', english: 'Sagittarius' },
    2: { hindi: 'Makar', english: 'Capricorn' },
    3: { hindi: 'Makar', english: 'Capricorn' },
    4: { hindi: 'Makar', english: 'Capricorn' },
  },
  shravana: {
    1: { hindi: 'Makar', english: 'Capricorn' },
    2: { hindi: 'Makar', english: 'Capricorn' },
    3: { hindi: 'Makar', english: 'Capricorn' },
    4: { hindi: 'Makar', english: 'Capricorn' },
  },
  dhanishta: {
    1: { hindi: 'Makar', english: 'Capricorn' },
    2: { hindi: 'Makar', english: 'Capricorn' },
    3: { hindi: 'Kumbh', english: 'Aquarius' },
    4: { hindi: 'Kumbh', english: 'Aquarius' },
  },
  shatabhisha: {
    1: { hindi: 'Kumbh', english: 'Aquarius' },
    2: { hindi: 'Kumbh', english: 'Aquarius' },
    3: { hindi: 'Kumbh', english: 'Aquarius' },
    4: { hindi: 'Kumbh', english: 'Aquarius' },
  },
  purvabhadrapada: {
    1: { hindi: 'Kumbh', english: 'Aquarius' },
    2: { hindi: 'Kumbh', english: 'Aquarius' },
    3: { hindi: 'Meen', english: 'Pisces' },
    4: { hindi: 'Meen', english: 'Pisces' },
  },
  uttarabhadrapada: {
    1: { hindi: 'Meen', english: 'Pisces' },
    2: { hindi: 'Meen', english: 'Pisces' },
    3: { hindi: 'Meen', english: 'Pisces' },
    4: { hindi: 'Meen', english: 'Pisces' },
  },
  revati: {
    1: { hindi: 'Meen', english: 'Pisces' },
    2: { hindi: 'Meen', english: 'Pisces' },
    3: { hindi: 'Meen', english: 'Pisces' },
    4: { hindi: 'Meen', english: 'Pisces' },
  },
};

function normalizeNakshatraName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

function formatRashiFromNakshatra(nakshatraWithPada: string | undefined): string {
  if (!nakshatraWithPada) return '-';
  const match = nakshatraWithPada.match(/^\s*([^()-]+?)\s*-\s*(\d)\s*$/);
  if (!match) return nakshatraWithPada;

  const nakshatraName = match[1].trim();
  const pada = Number(match[2]);
  const key = normalizeNakshatraName(nakshatraName);
  const rashi = NAKSHATRA_PADA_TO_RASHI[key]?.[pada];

  if (!rashi) return `${nakshatraName} - ${pada}`;
  return `${nakshatraName} - ${pada} (${rashi.hindi} / ${rashi.english})`;
}

function readFreeKundaliResult(): StoredKundaliResult | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.sessionStorage.getItem('freeKundaliResult');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredKundaliResult;
  } catch {
    return null;
  }
}

const KundaliResultSection: React.FC = () => {
  const [result, setResult] = useState<StoredKundaliResult | null>(null);

  useEffect(() => {
    setResult(readFreeKundaliResult());
  }, []);
  const [activeTab, setActiveTab] = useState<'basic' | 'dosha' | 'planets' | 'lagna'>('basic');

  const planetHouseLines =
    result?.planetRows && result.planetRows.length > 0 ? planetHouseBullets(result.planetRows) : [];

  const payloadRoot = result?.payload as
    | { data?: Record<string, unknown>; payload?: Record<string, unknown> }
    | undefined;
  const payloadData =
    payloadRoot?.data && typeof payloadRoot.data === 'object'
      ? payloadRoot.data
      : payloadRoot?.payload && typeof payloadRoot.payload === 'object'
        ? payloadRoot.payload
        : payloadRoot;
  const payloadInner =
    payloadData?.payload && typeof payloadData.payload === 'object'
      ? (payloadData.payload as Record<string, unknown>)
      : payloadData;
  const payloadInnerObject = payloadInner as Record<string, unknown> | undefined;
  const panchanga =
    payloadInnerObject &&
    payloadInnerObject.PanchangaTable &&
    typeof payloadInnerObject.PanchangaTable === 'object'
      ? (payloadInnerObject.PanchangaTable as Record<string, unknown>)
      : payloadInnerObject;
  const nakshatra = getPanchangaValue(panchanga, ['Nakshatra'], ['NakshatraName']);

  const basicRows: Array<[string, string]> = [
    ['Name', result?.fullName || '-'],
    ['Birth Date', result?.dateOfBirth || '-'],
    ['Birth Time', result?.birthTime || '-'],
    ['Birth Place', result?.birthPlace || '-'],
    ['Gender', toTitleCase(result?.gender)],
    ['Rashi', formatRashiFromNakshatra(nakshatra)],
    ['Latitude', result?.latitude || '-'],
    ['Longitude', result?.longitude || '-'],
  ];

  const kundaliRows: Array<[string, string]> = [
    ['Ayanamsa', getPanchangaValue(panchanga, ['Ayanamsa'])],
    ['Tithi', getPanchangaValue(panchanga, ['Tithi', 'Name'], ['TithiName'], ['Tithi'])],
    ['Paksha', getPanchangaValue(panchanga, ['Tithi', 'Paksha'])],
    ['Lunar Month', getPanchangaValue(panchanga, ['LunarMonth'])],
    ['Vara', getPanchangaValue(panchanga, ['Vara'])],
    ['Nakshatra', nakshatra || '-'],
    ['Sunrise', getPanchangaValue(panchanga, ['Sunrise', 'StdTime'], ['Sunrise'])],
    ['Sunset', getPanchangaValue(panchanga, ['Sunset', 'StdTime'], ['Sunset'])],
  ];

  const favourableRows: Array<[string, string]> = [
    ['Yoga', getPanchangaValue(panchanga, ['Yoga', 'Name'], ['YogaName'], ['Yoga'])],
    ['Yoga Description', getPanchangaValue(panchanga, ['Yoga', 'Description'])],
    ['Karana', getPanchangaValue(panchanga, ['Karana'], ['KaranaName'])],
    ['Hora Lord', getPanchangaValue(panchanga, ['HoraLord', 'Name'], ['HoraLord'])],
    ['Disha Shool', getPanchangaValue(panchanga, ['DishaShool'])],
    ['Tithi Day', getPanchangaValue(panchanga, ['Tithi', 'Day'])],
    ['Tithi Date', getPanchangaValue(panchanga, ['Tithi', 'Date'])],
    ['Ishta Kaala', getPanchangaValue(panchanga, ['IshtaKaala', 'DegreeMinuteSecond'])],
  ];

  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="mx-auto w-full max-w-[1453px]">
        <h1 className="font-sahitya text-primary text-[28px] md:text-[40px] leading-tight font-bold">
          Kundali Details
        </h1>
        <p className="mt-2 font-mukta text-[#141414] text-sm md:text-lg">
          Discover your detailed Janam Kundli instantly
        </p>
        {result?.planetRows && result.planetRows.length > 0 ? (
          <div className={`mt-4 rotate-0 opacity-100 ${OPEN_CHART_FRAME_CLASS}`}>
            <NorthIndianOpenChartWithPlanets
              planetRows={result.planetRows}
              lagnaSignFallback={getPanchangaValue(panchanga, ['Lagna'], ['LagnaSign'])}
            />
          </div>
        ) : (
          <div className="mt-4 flex h-[353px] items-center justify-center rounded-[28px] border border-[#e5d9bc] bg-[#fffdf6] px-6 text-center text-[#666]">
            <p className="font-mukta text-base leading-relaxed">
              Your Lagna chart preview appears here after generating your Kundali.
            </p>
          </div>
        )}
        <div className="mt-6 flex flex-nowrap items-center justify-center gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`h-[46px] w-[334.25px] max-w-full rounded-[32px] border border-[#A13924] p-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 ${
              activeTab === 'basic' ? 'bg-[#7F1808] text-white' : 'bg-[#ede9d9] text-[#7F1808]'
            } hover:bg-[#7F1808] hover:text-white`}
          >
            Basic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dosha')}
            className={`h-[46px] w-[334.25px] max-w-full rounded-[32px] border border-[#A13924] p-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 ${
              activeTab === 'dosha' ? 'bg-[#7F1808] text-white' : 'bg-[#ede9d9] text-[#7F1808]'
            } hover:bg-[#7F1808] hover:text-white`}
          >
            Dosha
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('planets')}
            className={`h-[46px] w-[334.25px] max-w-full rounded-[32px] border border-[#A13924] p-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 ${
              activeTab === 'planets' ? 'bg-[#7F1808] text-white' : 'bg-[#ede9d9] text-[#7F1808]'
            } hover:bg-[#7F1808] hover:text-white`}
          >
            Planets Detail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lagna')}
            className={`h-[46px] w-[334.25px] max-w-full rounded-[32px] border border-[#A13924] p-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 ${
              activeTab === 'lagna' ? 'bg-[#7F1808] text-white' : 'bg-[#ede9d9] text-[#7F1808]'
            } hover:bg-[#7F1808] hover:text-white`}
          >
            Lagna Chart
          </button>
        </div>

        {result ? (
          <>
            {activeTab === 'dosha' && (
              <div className="mt-8">
                <h3 className="font-sahitya text-primary text-[28px] leading-[38px] tracking-[0] font-bold">
                  What Is Dosha?
                </h3>
                <p className="mt-4 font-mukta text-[#2d2d2d] text-[18px] leading-[28px] tracking-[0] font-normal text-justify">
                  In Vedic astrology, a Dosha means an imbalance or flaw in a person&apos;s
                  horoscope caused by the placement of certain planets in specific houses. These
                  planetary positions are believed to create challenges or obstacles in areas like
                  marriage, health, career, or relationships.
                </p>

                {!result.doshas && (
                  <p className="mt-6 font-mukta text-base text-[#4a4a4a]">
                    Dosha data is missing. Please go back and generate your kundali again.
                  </p>
                )}
                {result.doshas && (
                  <div className="mt-10 overflow-x-auto rounded-xl border border-[#e5d9bc] bg-[#fffdf6] shadow-sm [-webkit-overflow-scrolling:touch]">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#e5d9bc]">
                          {['Dosha', 'Present', 'Strength', 'Details'].map((header, hi) => (
                            <th
                              key={`dosha-header-${header}`}
                              scope="col"
                              className={`border-b border-r border-[#f0e6d0] bg-[#fff9ed] px-4 py-3 font-mukta text-sm font-semibold text-[#5c4033] last:border-r-0 ${
                                hi === 0 ? 'min-w-[10rem]' : ''
                              } ${hi === 3 ? 'min-w-[16rem]' : ''}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DOSHA_DISPLAY_ORDER.map(({ key, label }, rowIdx) => {
                          const entry = result.doshas![key];

                          return (
                            <tr key={`dosha-row-${key}`}>
                              <td
                                className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-sahitya text-base font-bold text-primary ${
                                  rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                }`}
                              >
                                {label}
                              </td>
                              <td
                                className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-mukta text-base text-[#2d2d2d] ${
                                  rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                }`}
                              >
                                {entry.present ? 'Yes' : 'No'}
                              </td>
                              <td
                                className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-mukta text-base font-medium ${doshaStrengthClass(entry.strength)} ${
                                  rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                }`}
                              >
                                {entry.strength}
                              </td>
                              <td
                                className={`border-b border-[#f0e6d0] px-4 py-3 font-mukta text-base leading-relaxed text-[#4a4a4a] ${
                                  rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                }`}
                              >
                                {entry.reasons.length > 0 ? (
                                  <ul className="list-disc space-y-1 pl-4">
                                    {entry.reasons.map(reason => (
                                      <li key={`${key}-${reason}`}>{reason}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="italic text-[#666]">
                                    No specific conditions triggered for this dosha.
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {result.doshas && <DoshaRemediesSection doshas={result.doshas} />}
              </div>
            )}

            {activeTab === 'planets' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-[20px] bg-[#f9f4dd] p-4 sm:p-5 md:p-7">
                  <h3 className="font-sahitya text-primary text-[26px] leading-tight sm:text-[32px] md:text-[36px] md:leading-[48px] font-bold">
                    Planet details
                  </h3>
                  <p className="mt-2 font-mukta text-[#2d2d2d] text-sm leading-relaxed sm:text-base">
                    Sidereal positions from your birth time and place (VedAstro AllPlanetData).
                  </p>
                  {!result.planetRows?.length && (
                    <p className="mt-4 font-mukta text-sm text-[#4a4a4a] sm:text-base">
                      Planet data is missing. Please go back and generate your kundali again.
                    </p>
                  )}
                  <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5d9bc] bg-[#fffdf6] shadow-sm [-webkit-overflow-scrolling:touch]">
                    <table className="w-full min-w-[720px] border-collapse text-left sm:min-w-[880px]">
                      <thead>
                        <tr className="border-b border-[#e5d9bc]">
                          {[
                            'Planet',
                            'Sign (Rasi)',
                            '° in sign',
                            'Nirayana longitude',
                            'Nakshatra',
                            'House (by sign)',
                            'House (by degree)',
                            'Retrograde',
                            'Nakshatra lord',
                          ].map((header, hi) => (
                            <th
                              key={`planet-header-${header}`}
                              scope="col"
                              className={`border-b border-r border-[#f0e6d0] bg-[#fff9ed] px-2 py-2.5 align-bottom font-mukta text-[10px] font-semibold uppercase leading-tight tracking-wide text-[#5c4033] last:border-r-0 sm:px-3 sm:py-3 sm:text-[11px] md:text-xs ${
                                hi === 0
                                  ? 'sticky left-0 z-10 min-w-[4.5rem] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]'
                                  : ''
                              }`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(result.planetRows ?? []).map((row, rowIdx) => (
                          <tr key={`planet-row-${rowIdx}`}>
                            {row.map((cell, cellIdx) => (
                              <td
                                key={`planet-cell-${rowIdx}-${cellIdx}`}
                                className={`border-b border-r border-[#f0e6d0] px-2 py-1.5 align-top font-mukta text-xs leading-snug last:border-r-0 sm:px-3 sm:py-2 sm:text-sm md:leading-normal ${
                                  cellIdx === 0
                                    ? `sticky left-0 z-10 min-w-[4.5rem] whitespace-nowrap font-semibold text-[#7F1808] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] ${
                                        rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                      }`
                                    : `max-w-[8.5rem] break-words text-[#2d2d2d] sm:max-w-[11rem] md:max-w-none tabular-nums ${
                                        rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                                      }`
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'basic' && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
                  <div>
                    <h3 className="font-sahitya text-primary text-[34px] leading-[44px] font-bold">
                      Basic Details
                    </h3>
                    <div className="mt-2">
                      {basicRows.map(([label, value]) => (
                        <div key={`basic-${label}`} className="grid grid-cols-1 sm:grid-cols-2">
                          <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-medium text-[#3a3a3a]">
                            {label}
                          </div>
                          <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-normal text-[#4a4a4a]">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sahitya text-primary text-[34px] leading-[44px] font-bold">
                      Kundali Details
                    </h3>
                    <div className="mt-2">
                      {kundaliRows.map(([label, value]) => (
                        <div key={`kundali-${label}`} className="grid grid-cols-1 sm:grid-cols-2">
                          <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-medium text-[#3a3a3a]">
                            {label}
                          </div>
                          <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-normal text-[#4a4a4a]">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-sahitya text-primary text-[34px] leading-[44px] font-bold">
                    Favourable
                  </h3>
                  <div className="mt-2 max-w-[760px]">
                    {favourableRows.map(([label, value]) => (
                      <div key={`favourable-${label}`} className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-medium text-[#3a3a3a]">
                          {label}
                        </div>
                        <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[24px] leading-[34px] sm:text-[28px] sm:leading-[40px] font-normal text-[#4a4a4a]">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'lagna' && (
              <div className="mt-8 p-6">
                <h3 className="font-sahitya text-primary text-[36px] md:text-[48px] leading-tight md:leading-[58px] font-bold">
                  Lagna chart
                </h3>
                <p className="mt-3 font-mukta text-[18px] md:text-[20px] leading-[30px] text-[#2d2d2d]">
                  North Indian D1: house numbers, whole-sign rashi (from Lagna), nine grahas +
                  Ascendant with degree-in-sign, retrograde (®), nakshatra, and
                  longitude-house (Lh) when it differs from sign-house — data from VedAstro.
                </p>
                <p className="mt-4 font-mukta text-[18px] md:text-[20px] leading-[30px] text-[#2d2d2d]">
                  Planets by house
                </p>
                {planetHouseLines.length > 0 ? (
                  <ul className="mt-3 list-disc pl-6 font-mukta text-[18px] leading-[32px] text-[#2d2d2d]">
                    {planetHouseLines.map((line, idx) => (
                      <li key={`ph-${idx}-${line.slice(0, 24)}`}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 font-mukta text-[16px] text-[#777] italic">
                    Planet house list is not available. Generate your kundali again from the
                    form.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 font-mukta text-sm text-red-700">
            No generated kundali result found. Please generate your kundali first.
          </p>
        )}

        <Link
          href="/free-kundali"
          className="mt-6 inline-flex h-[48px] items-center justify-center rounded-full bg-[#6d1510] px-6 font-mukta text-base font-semibold text-secondary transition-colors hover:bg-[#8e2f27]"
        >
          Back to Free Kundali Form
        </Link>
      </div>
    </section>
  );
};

export default KundaliResultSection;
