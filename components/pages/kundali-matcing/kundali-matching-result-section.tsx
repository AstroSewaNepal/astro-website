'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import OpenChart from '@/components/images/openchart.png';
import {
  NorthIndianOpenChartWithPlanets,
  OPEN_CHART_FRAME_CLASS,
} from '@/components/pages/free-kundali/north-indian-open-chart';
import PersonDoshaResults from '@/components/shared/person-dosha-results';
import ChevronRight from '@/components/icons/chevron-right';
import type { StoredKundaliMatchingResult } from '@/lib/vedastro/fetch-kundali-matching-bundle';

// ─── Types ────────────────────────────────────────────────────────────────────

type KundaliMatchingTab = 'match' | 'basic' | 'dosha' | 'planets' | 'lagna';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function unwrapVedastroPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;

  const data = payload['data'];
  if (isRecord(data) && 'payload' in data) return (data as Record<string, unknown>)['payload'];
  if ('payload' in payload) return payload['payload'];
  return payload;
}

type PersonInput = StoredKundaliMatchingResult['man'];

type MatchPredictionRow = {
  Name?: string;
  Nature?: string;
  Info?: string;
  Description?: string;
  MaleInfo?: string;
  FemaleInfo?: string;
  Score?: number;
};

type TabButtonProps = {
  id: KundaliMatchingTab;
  label: string;
  activeTab: KundaliMatchingTab;
  onSelect: (tab: KundaliMatchingTab) => void;
};

/** Same pill classes as `free-kundali/kundali-result-section.tsx` tab buttons. */
function freeKundaliTabButtonClass(active: boolean): string {
  return `inline-flex items-center justify-center h-[34px] min-w-[118px] max-w-full rounded-[32px] border border-[#720A0B] px-4 py-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 whitespace-nowrap md:h-[46px] md:min-w-[334.25px] md:px-2 ${
    active ? 'bg-[#720A0B] text-white' : 'bg-[#FFFAE6] text-[#720A0B]'
  } hover:bg-[#720A0B] hover:text-white`;
}

function TabButton({ id, label, activeTab, onSelect }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={freeKundaliTabButtonClass(activeTab === id)}
    >
      {label}
    </button>
  );
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function toTitleCase(value: string | undefined): string {
  if (!value) return '-';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatPanchangaValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value))
    return value
      .map(formatPanchangaValue)
      .filter(v => v !== '-')
      .join(', ');
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

function getNestedValue(source: unknown, keys: string[]): unknown {
  let current: unknown = source;
  for (const key of keys) {
    if (!isRecord(current) || !(key in current)) return undefined;
    current = current[key];
  }
  return current;
}

function getPanchangaValue(source: unknown, ...paths: string[][]): string {
  for (const path of paths) {
    const value = getNestedValue(source, path);
    if (value !== undefined && value !== null) {
      const formatted = formatPanchangaValue(value);
      if (formatted !== '-') return formatted;
    }
  }
  return '-';
}

function chartDataUrl(svg: string | undefined): string | null {
  return svg && svg.includes('<svg')
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : null;
}

// ─── Render Helpers ───────────────────────────────────────────────────────────

function clampPercent(v: number | undefined): number {
  if (v === undefined || !Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function natureBadge(nature: string | undefined): React.ReactNode {
  const label = nature ?? 'Unknown';
  const lower = label.toLowerCase();
  const colorClass =
    lower === 'good' || lower === 'excellent'
      ? 'bg-green-50 border-green-300 text-green-700'
      : lower === 'bad' || lower === 'worst' || lower === 'very bad'
        ? 'bg-red-50 border-red-300 text-red-700'
        : lower === 'neutral' || lower === 'average'
          ? 'bg-amber-50 border-amber-300 text-amber-700'
          : 'bg-[#fffdf6] border-[#C8A9A0] text-[#3a3a3a]';
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border font-mukta ${colorClass}`}
    >
      {label}
    </span>
  );
}

function planetHouseBullets(planetRows: string[][]): string[] {
  return planetRows.map(row => {
    const planet = row[0] ?? '—';
    const house = row[5] ?? '—';
    return `${planet} is in ${house} in your birth chart.`;
  });
}

const PersonCard: React.FC<{ person: PersonInput; role: string; symbol: string }> = () => {
  return null;
};

const KutaTable: React.FC<{
  predictions: MatchPredictionRow[];
  man: PersonInput;
  woman: PersonInput;
  kutaRaw?: number | null;
}> = ({ predictions, man, woman, kutaRaw = null }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const manFirstName = man.fullName.split(' ')[0];
  const womanFirstName = woman.fullName.split(' ')[0];

  const totalScore =
    kutaRaw != null
      ? `Total Kuta Score: ${clampPercent(kutaRaw)}% — ${Math.round(((Math.max(0, Math.min(100, kutaRaw)) * 36) / 100) * 10) / 10}/36`
      : 'Total Kuta Score: -';

  return (
    <div className="space-y-0">
      {/* ── Mobile: FAQ-style accordion (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {predictions.map((row, i) => {
          const name = row.Name ?? `Row ${i + 1}`;
          const rowKey = `${i}-${name}`;
          const isOpen = expandedKey === rowKey;
          const info = row.Info?.trim() || row.Description?.trim();
          const maleInfo = row.MaleInfo?.trim() || (row.Nature ?? '-');
          const femaleInfo = row.FemaleInfo?.trim() || (row.Nature ?? '-');

          return (
            <div key={rowKey} className="border border-solid border-[#C8A9A0] rounded-xl px-4 py-4">
              {/* Header row — identical layout to QNASComponent */}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpandedKey(isOpen ? null : rowKey)}
                className="flex w-full cursor-pointer justify-between gap-4 text-left items-center"
              >
                <span className="font-mukta text-base font-bold text-primary leading-snug">
                  {name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {natureBadge(row.Nature)}
                  <ChevronRight
                    aria-hidden="true"
                    className={clsx(
                      'w-4 h-4 text-primary flex-shrink-0',
                      'transition-all duration-300',
                      isOpen ? '-rotate-90' : 'rotate-0',
                    )}
                  />
                </div>
              </button>

              {/* Collapsible panel — grid trick from QNASComponent */}
              <div
                className={clsx(
                  'grid overflow-hidden transition-all duration-300',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="min-h-0">
                  {/* Per-person info pills */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[10px] border border-[#e5d9bc] bg-[#fffdf6] px-3 py-2">
                      <p className="font-mukta text-[10px] font-semibold uppercase tracking-wide text-[#720A0B] mb-1">
                        {manFirstName}
                      </p>
                      <p className="font-mukta text-[13px] leading-snug text-[#3a3a3a]">
                        {maleInfo}
                      </p>
                    </div>
                    <div className="rounded-[10px] border border-[#e5d9bc] bg-[#fffdf6] px-3 py-2">
                      <p className="font-mukta text-[10px] font-semibold uppercase tracking-wide text-[#720A0B] mb-1">
                        {womanFirstName}
                      </p>
                      <p className="font-mukta text-[13px] leading-snug text-[#3a3a3a]">
                        {femaleInfo}
                      </p>
                    </div>
                  </div>
                  {/* Detailed info */}
                  {info && <p className="font-mukta text-sm text-[#5B5B5B] mt-3">{info}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: full table (hidden below md) ── */}
      <div className="hidden md:block rounded-[20px] border border-[#e5d9bc] bg-transparent overflow-x-auto p-3">
        <table className="w-full min-w-[640px] border-collapse font-mukta">
          <thead>
            <tr>
              <th className="border-b border-[#C8A9A0] bg-transparent px-3 py-3 text-left font-sahitya text-[18px] leading-[30px] font-semibold text-[#3a3a3a]">
                Kuta / Factor
              </th>
              <th className="border-b border-[#C8A9A0] bg-transparent px-3 py-3 text-center font-sahitya text-[18px] leading-[30px] font-semibold text-[#3a3a3a]">
                Nature
              </th>
              <th className="border-b border-[#C8A9A0] bg-transparent px-3 py-3 text-center font-sahitya text-[18px] leading-[30px] font-semibold text-[#3a3a3a]">
                For {manFirstName}
              </th>
              <th className="border-b border-[#C8A9A0] bg-transparent px-3 py-3 text-center font-sahitya text-[18px] leading-[30px] font-semibold text-[#3a3a3a]">
                For {womanFirstName}
              </th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((row, i) => {
              const name = row.Name ?? `Row ${i + 1}`;
              const rowKey = `${i}-${name}`;
              const isOpen = expandedKey === rowKey;
              const info = row.Info?.trim() || row.Description?.trim();
              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className="border-t border-[#C8A9A0] cursor-pointer transition-colors hover:bg-[#f3e8de]"
                    onClick={() => setExpandedKey(isOpen ? null : rowKey)}
                  >
                    <td className="border border-[#C8A9A0] px-3 py-2 text-[18px] leading-[30px] font-semibold text-[#3a3a3a]">
                      <span className="flex items-center gap-2">
                        <ChevronRight
                          aria-hidden="true"
                          className={clsx(
                            'w-3.5 h-3.5 text-primary/50 flex-shrink-0 transition-all duration-300',
                            isOpen ? '-rotate-90' : 'rotate-0',
                          )}
                        />
                        {name}
                      </span>
                    </td>
                    <td className="border border-[#C8A9A0] px-3 py-2 text-center">
                      {natureBadge(row.Nature)}
                    </td>
                    <td className="border border-[#C8A9A0] px-3 py-2 text-center text-[16px] leading-[28px] text-[#3a3a3a]">
                      {row.MaleInfo?.trim() || (row.Nature ?? '-')}
                    </td>
                    <td className="border border-[#C8A9A0] px-3 py-2 text-center text-[16px] leading-[28px] text-[#3a3a3a]">
                      {row.FemaleInfo?.trim() || (row.Nature ?? '-')}
                    </td>
                  </tr>
                  {isOpen && info && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 border border-[#C8A9A0]">
                        <p className="font-mukta text-[16px] leading-[28px] text-[#5B5B5B]">
                          {info}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {/* Total score on desktop */}
        <div className="mt-3 px-3 text-right font-mukta text-[16px] font-semibold text-[#3a3a3a]">
          {totalScore}
        </div>
      </div>

      {/* Total score on mobile */}
      <div className="md:hidden pt-3 text-right font-mukta text-[14px] font-semibold text-[#3a3a3a]">
        {totalScore}
      </div>
    </div>
  );
};

// ─── Individual Tabs Renderers ────────────────────────────────────────────────

const IndividualBasicDetails: React.FC<{
  person: PersonInput;
  payload: unknown;
  title: string;
}> = ({ person: _person, payload, title }) => {
  const pData = unwrapVedastroPayload(payload);
  const panchanga = isRecord(pData) && pData['PanchangaTable'] ? pData['PanchangaTable'] : pData;
  const panchangaRecord = isRecord(panchanga) ? panchanga : undefined;
  const nakshatra = getPanchangaValue(panchangaRecord, ['Nakshatra'], ['NakshatraName']);

  const basicRows: Array<[string, string]> = [
    ['Name', _person.fullName],
    ['Birth Date', _person.dateOfBirth],
    ['Birth Time', _person.birthTime],
    ['Birth Place', _person.birthPlace || '-'],
    ['Gender', toTitleCase(_person.gender)],
    ['Latitude', _person.latitude || '-'],
    ['Longitude', _person.longitude || '-'],
  ];

  const kundaliRows: Array<[string, string]> = [
    ['Ayanamsa', getPanchangaValue(panchangaRecord, ['Ayanamsa'])],
    ['Tithi', getPanchangaValue(panchangaRecord, ['Tithi', 'Name'], ['TithiName'], ['Tithi'])],
    ['Paksha', getPanchangaValue(panchangaRecord, ['Tithi', 'Paksha'])],
    ['Lunar Month', getPanchangaValue(panchangaRecord, ['LunarMonth'])],
    ['Vara', getPanchangaValue(panchangaRecord, ['Vara'])],
    ['Nakshatra', nakshatra || '-'],
    ['Sunrise', getPanchangaValue(panchangaRecord, ['Sunrise', 'StdTime'], ['Sunrise'])],
    ['Sunset', getPanchangaValue(panchangaRecord, ['Sunset', 'StdTime'], ['Sunset'])],
  ];

  return (
    <div className="flex-1 min-w-0">
      <div className="rounded-[20px] p-5 shadow-sm h-full">
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold border-b border-[#f5e9c6] pb-2 mb-4">
          {title}
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-8">
          <div>
            <h3 className="font-sahitya text-primary text-[22px] leading-[32px] font-bold md:text-[34px] md:leading-[44px]">
              Basic Details
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {basicRows.map(([label, value]) => (
                <div key={`basic-${label}`} className="grid grid-cols-2 gap-2">
                  <div className="border border-[#C8A9A0] rounded-[6px] bg-transparent px-3 py-2 font-mukta text-[15px] leading-[22px] sm:text-[18px] sm:leading-[30px] font-semibold text-[#3a3a3a]">
                    {label}
                  </div>
                  <div className="border border-[#C8A9A0] rounded-[6px] bg-transparent px-3 py-2 font-mukta text-[15px] leading-[22px] sm:text-[18px] sm:leading-[30px] font-normal text-[#4a4a4a]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sahitya text-primary text-[22px] leading-[32px] font-bold md:text-[34px] md:leading-[44px]">
              Kundali Details
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {kundaliRows.map(([label, value]) => (
                <div key={`kundali-${label}`} className="grid grid-cols-2 gap-2">
                  <div className="border border-[#C8A9A0] rounded-[6px] bg-transparent px-3 py-2 font-mukta text-[15px] leading-[22px] sm:text-[18px] sm:leading-[30px] font-semibold text-[#3a3a3a]">
                    {label}
                  </div>
                  <div className="border border-[#C8A9A0] rounded-[6px] bg-transparent px-3 py-2 font-mukta text-[15px] leading-[22px] sm:text-[18px] sm:leading-[30px] font-normal text-[#4a4a4a]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndividualPlanetsTable: React.FC<{ rows: string[][]; title: string }> = ({ rows, title }) => (
  <div className="mt-8 rounded-[20px] bg-[#f9f4dd] p-5 md:p-7 w-full shadow-sm">
    <h3 className="font-sahitya text-primary text-[28px] font-bold mb-4 border-b border-[#f5e9c6] pb-2">
      {title}
    </h3>
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
          {rows.map((row, rowIdx) => (
            <tr key={`planet-row-${rowIdx}`}>
              {row.map((cell, cellIdx) => (
                <td
                  key={`planet-cell-${rowIdx}-${cellIdx}`}
                  className={`border-b border-r border-[#f0e6d0] px-2 py-1.5 align-top font-mukta text-xs leading-snug last:border-r-0 sm:px-3 sm:py-2 sm:text-sm md:leading-normal ${
                    cellIdx === 0
                      ? `sticky left-0 z-10 min-w-[4.5rem] whitespace-nowrap font-semibold text-[#720A0B] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] ${
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
);

// ─── Main Component ───────────────────────────────────────────────────────────

let __lastKundaliRaw: string | null | undefined = undefined;
let __lastKundaliParsed: StoredKundaliMatchingResult | null = null;

function readKundaliMatchingResult(): StoredKundaliMatchingResult | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem('kundaliMatchingResult');
  // If the raw string hasn't changed, return the previously parsed object (stable reference)
  if (raw === __lastKundaliRaw) return __lastKundaliParsed;
  __lastKundaliRaw = raw;
  if (!raw) {
    __lastKundaliParsed = null;
    return null;
  }
  try {
    __lastKundaliParsed = JSON.parse(raw) as StoredKundaliMatchingResult;
  } catch {
    __lastKundaliParsed = null;
  }
  return __lastKundaliParsed;
}

const subscribeKundaliMatchingResult = () => () => {};

const KundaliMatchingResultSection: React.FC = () => {
  const result = useSyncExternalStore(
    subscribeKundaliMatchingResult,
    readKundaliMatchingResult,
    () => null,
  );
  const [activeTab, setActiveTab] = useState<KundaliMatchingTab>('basic');

  // No automatic clearing of sessionStorage here — leave stored result intact so
  // the results page can read and display it after navigation from the form.

  if (!result) {
    return (
      <section className="container mx-auto px-6 lg:px-0 py-8 md:py-12">
        <div className="mx-auto flex w-full max-w-[1453px] flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="font-sahitya text-2xl font-bold text-primary">No Kundali data found.</p>
          <Link
            href="/kundali-matching"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mukta text-sm font-semibold text-secondary hover:bg-[#8e2f27] transition-colors"
          >
            ← Back to Form
          </Link>
        </div>
      </section>
    );
  }

  const report = result.matchReport;
  const predictions = report.PredictionList ?? [];
  const manName = result.man.fullName?.trim();
  const womanName = result.woman.fullName?.trim();
  const manChartUrl = chartDataUrl(result.manLagnaSvg);
  const womanChartUrl = chartDataUrl(result.womanLagnaSvg);
  const manPayloadRoot = unwrapVedastroPayload(result.manPayload);
  const manPanchanga =
    isRecord(manPayloadRoot) && manPayloadRoot['PanchangaTable']
      ? manPayloadRoot['PanchangaTable']
      : manPayloadRoot;
  const manLagnaSignFallback = getPanchangaValue(
    isRecord(manPanchanga) ? manPanchanga : undefined,
    ['Lagna'],
    ['LagnaSign'],
  );

  const womanPayloadRoot = unwrapVedastroPayload(result.womanPayload);
  const womanPanchanga =
    isRecord(womanPayloadRoot) && womanPayloadRoot['PanchangaTable']
      ? womanPayloadRoot['PanchangaTable']
      : womanPayloadRoot;
  const womanLagnaSignFallback = getPanchangaValue(
    isRecord(womanPanchanga) ? womanPanchanga : undefined,
    ['Lagna'],
    ['LagnaSign'],
  );
  const manPlanetHouseLines =
    result.manPlanetRows && result.manPlanetRows.length > 0
      ? planetHouseBullets(result.manPlanetRows)
      : [];
  const womanPlanetHouseLines =
    result.womanPlanetRows && result.womanPlanetRows.length > 0
      ? planetHouseBullets(result.womanPlanetRows)
      : [];
  const resultSubtitle =
    manName && womanName
      ? `Matching result for ${manName} and ${womanName}`
      : manName || womanName
        ? `Matching result for ${manName || womanName}`
        : 'Your Kundali Matching Result';

  return (
    <section className="container mx-auto px-6 lg:px-0 py-8 md:py-12">
      <div className="mx-auto w-full max-w-[1453px] space-y-8">
        <section className="w-full pt-0 md:pt-2 pb-6">
          <div className="max-w-4xl">
            <h1 className="font-mukta font-semibold text-[18px] leading-[28px] tracking-[0] md:font-sahitya md:font-bold md:text-[36px] md:leading-[48px] text-primary mb-1">
              Kundali Matching Result
            </h1>
            <p className="font-mukta font-normal text-[15px] leading-[22px] tracking-[0] capitalize md:text-[22px] md:leading-[34px] text-[#141414] mb-3">
              {resultSubtitle}
            </p>
            <p className="font-mukta font-normal text-[16px] leading-6 tracking-[0] md:text-[24px] md:leading-[34px] text-[#464646] text-justify">
              View the compatibility analysis for both people, including Kuta Score, Guna Milan,
              Dosha findings, planetary details, and lagna chart insights.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-4xl">
          <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6 md:gap-8">
            <div className="flex min-w-0 flex-col items-stretch">
              <figure className="flex flex-col items-center gap-15">
                <div className="relative h-[240px] w-full sm:h-[280px] md:h-[300px]">
                  {result.manPlanetRows && result.manPlanetRows.length > 0 ? (
                    <div className={`w-full h-full ${OPEN_CHART_FRAME_CLASS}`}>
                      <NorthIndianOpenChartWithPlanets
                        planetRows={result.manPlanetRows}
                        lagnaSignFallback={manLagnaSignFallback}
                      />
                    </div>
                  ) : manChartUrl ? (
                    <Image
                      src={manChartUrl}
                      alt="Man Kundali chart"
                      fill
                      className="object-contain object-center"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={OpenChart}
                      alt="Man Kundali chart"
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                    />
                  )}
                </div>
                <figcaption className="font-sahitya text-center text-sm font-bold text-primary sm:text-base md:text-xl">
                  Man Kundali Chart
                </figcaption>
              </figure>
            </div>
            <div className="flex min-w-0 flex-col items-stretch">
              <figure className="flex flex-col items-center gap-15">
                <div className="relative h-[240px] w-full sm:h-[280px] md:h-[300px]">
                  {result.womanPlanetRows && result.womanPlanetRows.length > 0 ? (
                    <div className={`w-full h-full ${OPEN_CHART_FRAME_CLASS}`}>
                      <NorthIndianOpenChartWithPlanets
                        planetRows={result.womanPlanetRows}
                        lagnaSignFallback={womanLagnaSignFallback}
                      />
                    </div>
                  ) : womanChartUrl ? (
                    <Image
                      src={womanChartUrl}
                      alt="Woman Kundali chart"
                      fill
                      className="object-contain object-center"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={OpenChart}
                      alt="Woman Kundali chart"
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />
                  )}
                </div>
                <figcaption className="font-sahitya text-center text-sm font-bold text-primary sm:text-base md:text-xl">
                  Woman Kundali Chart
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Tabs — horizontal scroll on mobile with hidden scrollbar */}
        <div className="mt-6 w-full overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-3">
            <TabButton
              id="basic"
              label="Basic Details"
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
            <TabButton
              id="match"
              label="Match Result"
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
            <TabButton id="dosha" label="Dosha" activeTab={activeTab} onSelect={setActiveTab} />
            <TabButton
              id="planets"
              label="Planets Detail"
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
            <TabButton
              id="lagna"
              label="Lagna Chart"
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'match' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PersonCard person={result.man} role="Man" symbol="♂" />
                <PersonCard person={result.woman} role="Woman" symbol="♀" />
              </div>
              {/* match content removed per request */}
              {predictions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-sahitya font-bold text-[28px] leading-[38px] md:text-[34px] md:leading-[44px] text-primary">
                    Guna Milan — Detailed Kuta Analysis
                  </h2>
                  <KutaTable
                    predictions={predictions}
                    man={result.man}
                    woman={result.woman}
                    kutaRaw={report.KutaScore ?? null}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="flex flex-col md:flex-row gap-6">
              <IndividualBasicDetails
                person={result.man}
                payload={result.manPayload}
                title={`${result.man.fullName}'s Details (Man)`}
              />
              <IndividualBasicDetails
                person={result.woman}
                payload={result.womanPayload}
                title={`${result.woman.fullName}'s Details (Woman)`}
              />
            </div>
          )}

          {activeTab === 'dosha' && (
            <div className="mt-8 space-y-12">
              <div>
                <h3 className="font-sahitya text-primary text-[28px] leading-[38px] tracking-[0] font-bold">
                  What Is Dosha?
                </h3>
                <p className="mt-4 font-mukta text-[#2d2d2d] text-[18px] leading-[28px] tracking-[0] font-normal text-justify">
                  In Vedic astrology, a Dosha means an imbalance or flaw in a person&apos;s
                  horoscope caused by the placement of certain planets in specific houses. These
                  planetary positions are believed to create challenges or obstacles in areas like
                  marriage, health, career, or relationships.
                </p>
              </div>
              <PersonDoshaResults
                roleLabel="Man"
                personName={result.man.fullName}
                doshas={result.manDoshas}
              />
              <PersonDoshaResults
                roleLabel="Woman"
                personName={result.woman.fullName}
                doshas={result.womanDoshas}
              />
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="flex flex-col gap-8">
              <IndividualPlanetsTable
                rows={result.manPlanetRows}
                title={`${result.man.fullName}'s Planets (Man)`}
              />
              <IndividualPlanetsTable
                rows={result.womanPlanetRows}
                title={`${result.woman.fullName}'s Planets (Woman)`}
              />
            </div>
          )}

          {activeTab === 'lagna' && (
            <div className="space-y-8">
              <div className="rounded-[20px] bg-[#fffdf6] p-6 text-[#2d2d2d]">
                <h3 className="font-sahitya text-primary text-[28px] leading-[36px] font-bold">
                  Lagna chart
                </h3>
                <p className="mt-3 font-mukta text-[18px] leading-[30px]">
                  North Indian D1: house numbers, whole-sign rashi (from Lagna), nine grahas +
                  Ascendant with degree-in-sign, retrograde (®), nakshatra, and longitude-house
                  (Lh) when it differs from sign-house.
                </p>
                <p className="mt-4 font-mukta text-[18px] leading-[30px]">Planets by house</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#e5d9bc] bg-[#fffdf6] p-4">
                  <h4 className="font-sahitya text-lg font-bold text-primary">
                    Man: Planet house summary
                  </h4>
                  {manPlanetHouseLines.length > 0 ? (
                    <ul className="mt-3 list-disc pl-5 font-mukta text-[16px] leading-[28px] text-[#2d2d2d]">
                      {manPlanetHouseLines.map((line, idx) => (
                        <li key={`man-line-${idx}-${line.slice(0, 24)}`}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 font-mukta text-[16px] leading-[28px] text-[#4a4a4a]">
                      Lagna chart is already shown above. Detailed house summary will appear here
                      when available.
                    </p>
                  )}
                </div>
                <div className="rounded-[20px] border border-[#e5d9bc] bg-[#fffdf6] p-4">
                  <h4 className="font-sahitya text-lg font-bold text-primary">
                    Woman: Planet house summary
                  </h4>
                  {womanPlanetHouseLines.length > 0 ? (
                    <ul className="mt-3 list-disc pl-5 font-mukta text-[16px] leading-[28px] text-[#2d2d2d]">
                      {womanPlanetHouseLines.map((line, idx) => (
                        <li key={`woman-line-${idx}-${line.slice(0, 24)}`}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 font-mukta text-[16px] leading-[28px] text-[#4a4a4a]">
                      Lagna chart is already shown above. Detailed house summary will appear here
                      when available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KundaliMatchingResultSection;
