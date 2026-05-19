'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OpenChart from '@/components/images/openchart.png';
import {
  NorthIndianOpenChartWithPlanets,
  OPEN_CHART_FRAME_CLASS,
} from '@/components/pages/free-kundali/north-indian-open-chart';
import PersonDoshaResults from '@/components/shared/person-dosha-results';
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

type MatchReportPayload = {
  KutaScore?: number;
  Notes?: string;
  Summary?: {
    HeartIcon?: string;
    ScoreColor?: string;
    ScoreSummary?: string;
  };
  PredictionList?: MatchPredictionRow[];
};

type TabButtonProps = {
  id: KundaliMatchingTab;
  label: string;
  activeTab: KundaliMatchingTab;
  onSelect: (tab: KundaliMatchingTab) => void;
};

/** Same pill classes as `free-kundali/kundali-result-section.tsx` tab buttons. */
function freeKundaliTabButtonClass(active: boolean): string {
  return `h-[46px] w-[334.25px] max-w-full rounded-[32px] border border-[#A13924] p-2 rotate-0 opacity-100 font-mukta text-[18px] leading-[30px] tracking-[0] font-medium cursor-pointer transition-colors duration-200 ${
    active ? 'bg-[#7F1808] text-white' : 'bg-[#ede9d9] text-[#7F1808]'
  } hover:bg-[#7F1808] hover:text-white`;
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

function natureColor(nature: string | undefined): string {
  switch (nature) {
    case 'Good':
      return 'text-green-600';
    case 'Bad':
      return 'text-red-600';
    case 'Neutral':
      return 'text-amber-600';
    default:
      return 'text-gray-500';
  }
}

function natureBadge(nature: string | undefined): React.ReactNode {
  const label = nature ?? 'Unknown';
  const cls =
    nature === 'Good'
      ? 'bg-green-100 text-green-700 border-green-200'
      : nature === 'Bad'
        ? 'bg-red-100 text-red-700 border-red-200'
        : 'bg-amber-100 text-amber-700 border-amber-200';
  return (
    <span
      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mukta ${cls}`}
    >
      {label}
    </span>
  );
}

function scoreRingColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 65) return 'Good Match';
  if (score >= 50) return 'Average Match';
  if (score >= 35) return 'Below Average';
  return 'Low Compatibility';
}

const RING_R = 52;
const RING_CIRC = 2 * Math.PI * RING_R;

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const stroke = scoreRingColor(score);
  const dash = (score / 100) * RING_CIRC;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={RING_R} fill="none" stroke="#f3e8de" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={RING_R}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${RING_CIRC}`}
          strokeDashoffset={RING_CIRC / 4}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fill={stroke}
          fontSize="22"
          fontWeight="bold"
          fontFamily="Mukta"
        >
          {score}%
        </text>
        <text x="60" y="72" textAnchor="middle" fill="#7c3a2d" fontSize="9" fontFamily="Mukta">
          KutaScore
        </text>
      </svg>
      <span className="font-sahitya font-bold text-[16px]" style={{ color: stroke }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
};

const CATEGORIES = [
  {
    label: 'Love & Marriage',
    icon: '❤️',
    names: [
      'Marriage Stability',
      'Mahendra',
      'Stree Deergha',
      'Rasi Kuta',
      'Vasya Kuta',
      'Rajju',
      'Nadi Kuta',
      'Guna Kuta',
      'Dosha Samya',
      'Kuja Dosa',
    ],
  },
  {
    label: 'Intimacy',
    icon: '🔥',
    names: ['Yoni Kuta', 'Sex Energy', 'Sun-Moon-Mars-Venus 12th', 'Partners Death'],
  },
  {
    label: 'Friendship',
    icon: '🤝',
    names: ['Graha Maitram', 'Dina Kuta', 'Planetary Trine Harmony', 'Varna', 'Vedha'],
  },
  {
    label: 'Communication',
    icon: '💬',
    names: ['Sun-Moon Harmony', 'Mental Health', 'Bad Constellation'],
  },
];

function categoryPercent(names: string[], predictions: MatchPredictionRow[]): number {
  const subset = predictions.filter(p => names.includes((p.Name ?? '').trim()));
  if (!subset.length) return 50;
  let sum = 0,
    count = 0;
  for (const r of subset) {
    if (!r.Nature || r.Nature === 'Empty') continue;
    sum += r.Nature === 'Good' ? 100 : r.Nature === 'Neutral' ? 62 : 28;
    count++;
  }
  return count ? Math.round(sum / count) : 50;
}

const CategoryBar: React.FC<{ label: string; icon: string; percent: number }> = ({
  label,
  icon,
  percent,
}) => {
  const color = percent >= 70 ? '#22c55e' : percent >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-mukta text-sm font-medium text-[#3d1a14] flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>
        <span className="font-mukta text-sm font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#f3e8de] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
};

const PersonCard: React.FC<{ person: PersonInput; role: string; symbol: string }> = ({
  person,
  role,
  symbol,
}) => (
  <div className="rounded-2xl border-2 border-[#f5e9c6] bg-[#f9f4dd] shadow-sm p-4 md:p-5 flex flex-col gap-2">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{symbol}</span>
      <div>
        <p className="font-sahitya font-bold text-primary text-base leading-tight">
          {person.fullName}
        </p>
        <p className="font-mukta text-xs text-[#7c3a2d] capitalize">{role}</p>
      </div>
    </div>
    {[
      ['Date of Birth', person.dateOfBirth],
      ['Birth Time', person.birthTime],
      ['Birth Place', person.birthPlace],
      ['Gender', toTitleCase(person.gender)],
    ].map(([k, v]) => (
      <div key={k} className="flex justify-between text-xs border-t border-[#f3e8de] pt-1.5">
        <span className="font-mukta text-[#7c3a2d]">{k}</span>
        <span className="font-mukta font-medium text-[#3d1a14]">{v || '-'}</span>
      </div>
    ))}
  </div>
);

const KutaTable: React.FC<{
  predictions: MatchPredictionRow[];
  man: PersonInput;
  woman: PersonInput;
}> = ({ predictions, man, woman }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#f5e9c6] shadow-sm">
      <table className="w-full min-w-[500px] text-sm font-mukta">
        <thead>
          <tr className="bg-[#fffdf6] text-[#2d2d2d]">
            <th className="px-4 py-3 text-left font-semibold">Kuta / Factor</th>
            <th className="px-3 py-3 text-center font-semibold">Nature</th>
            <th className="px-3 py-3 text-center font-semibold">
              For {man.fullName.split(' ')[0]}
            </th>
            <th className="px-3 py-3 text-center font-semibold">
              For {woman.fullName.split(' ')[0]}
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
                  className={`border-t border-[#f5e9c6] cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#faf8f5]'} hover:bg-[#f9ece0]`}
                  onClick={() => setExpandedKey(isOpen ? null : rowKey)}
                >
                  <td className="px-4 py-2.5 font-medium text-[#3d1a14] border-r border-[#f5e9c6]">
                    <span className="flex items-center gap-1.5">
                      {info && (
                        <span className="text-primary/50 text-xs">{isOpen ? '▾' : '▸'}</span>
                      )}
                      {name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center border-r border-[#f5e9c6]">
                    {natureBadge(row.Nature)}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-center text-xs border-r border-[#f5e9c6] ${natureColor(row.Nature)}`}
                  >
                    {row.MaleInfo?.trim() || (row.Nature ?? '-')}
                  </td>
                  <td className={`px-3 py-2.5 text-center text-xs ${natureColor(row.Nature)}`}>
                    {row.FemaleInfo?.trim() || (row.Nature ?? '-')}
                  </td>
                </tr>
                {isOpen && info && (
                  <tr className="border-t border-[#f5e9c6]">
                    <td
                      colSpan={4}
                      className="px-4 py-3 bg-[#fffdf6] text-xs text-[#5a2a20] leading-relaxed italic"
                    >
                      {info}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
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
    <div className="flex-1 min-w-[300px]">
      <div className="rounded-[20px] p-5 shadow-sm h-full">
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold border-b border-[#f5e9c6] pb-2 mb-4">
          {title}
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-8">
          <div>
            <h3 className="font-sahitya text-primary text-[34px] leading-[44px] font-bold">
              Basic Details
            </h3>
            <div className="mt-2">
              {basicRows.map(([label, value]) => (
                <div key={`basic-${label}`} className="grid grid-cols-2">
                  <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[28px] leading-[40px] font-medium text-[#3a3a3a]">
                    {label}
                  </div>
                  <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[28px] leading-[40px] font-normal text-[#4a4a4a]">
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
                <div key={`kundali-${label}`} className="grid grid-cols-2">
                  <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[28px] leading-[40px] font-medium text-[#3a3a3a]">
                    {label}
                  </div>
                  <div className="border border-[#C8A9A0] px-3 py-2 font-mukta text-[28px] leading-[40px] font-normal text-[#4a4a4a]">
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

const IndividualDoshaDetails: React.FC<{ payload: unknown; title: string }> = ({
  payload,
  title,
}) => {
  const pData = unwrapVedastroPayload(payload);
  const panchanga = isRecord(pData) && pData['PanchangaTable'] ? pData['PanchangaTable'] : pData;
  const panchangaRecord = isRecord(panchanga) ? panchanga : undefined;

  const doshaCards = [
    ['Yoga', getPanchangaValue(panchangaRecord, ['Yoga', 'Name'], ['YogaName'], ['Yoga'])],
    ['Karana', getPanchangaValue(panchangaRecord, ['Karana'], ['KaranaName'])],
    ['Disha Shool', getPanchangaValue(panchangaRecord, ['DishaShool'])],
    ['Lagna', getPanchangaValue(panchangaRecord, ['Lagna'], ['LagnaSign'])],
    ['Nakshatra', getPanchangaValue(panchangaRecord, ['Nakshatra'])],
    ['Tithi', getPanchangaValue(panchangaRecord, ['Tithi', 'Name'], ['TithiName'], ['Tithi'])],
    ['Paksha', getPanchangaValue(panchangaRecord, ['Tithi', 'Paksha'])],
    ['Ayanamsa', getPanchangaValue(panchangaRecord, ['Ayanamsa'])],
  ];
  const tableRows = [
    ['Yoga Description', getPanchangaValue(panchangaRecord, ['Yoga', 'Description'])],
    ['Hora Lord', getPanchangaValue(panchangaRecord, ['HoraLord', 'Name'], ['HoraLord'])],
    ['Sunrise', getPanchangaValue(panchangaRecord, ['Sunrise', 'StdTime'], ['Sunrise'])],
    ['Sunset', getPanchangaValue(panchangaRecord, ['Sunset', 'StdTime'], ['Sunset'])],
    ['Ishta Kaala', getPanchangaValue(panchangaRecord, ['IshtaKaala', 'DegreeMinuteSecond'])],
    ['Moon Phase', getPanchangaValue(panchangaRecord, ['MoonPhase'])],
    ['Day of Week', getPanchangaValue(panchangaRecord, ['DayOfWeek'])],
  ];

  return (
    <div className="flex-1 min-w-[300px]">
      <div className="rounded-[20px] bg-[#f9f4dd] p-5 shadow-sm h-full">
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold border-b border-[#f5e9c6] pb-2 mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {doshaCards.map(([lbl, val]) => (
            <div
              key={lbl}
              className="rounded-lg bg-[#fffdf6] p-3 text-center shadow-sm border border-[#f5e9c6]"
            >
              <p className="font-sahitya text-primary text-[16px] font-bold">{lbl}</p>
              <p className="font-mukta text-[14px] text-[#2d2d2d] truncate" title={val}>
                {val}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#f5e9c6]">
          <table className="w-full text-sm font-mukta">
            <tbody>
              {tableRows.map(([lbl, val]) => (
                <tr key={lbl} className="border-b border-[#f5e9c6] last:border-0 bg-[#faf8f5]">
                  <td className="px-3 py-2 font-medium text-[#2d2d2d] bg-[#fffdf6] border-r border-[#f5e9c6]">
                    {lbl}
                  </td>
                  <td className="px-3 py-2 text-[#4a4a4a]">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DoshaSummary: React.FC<{ report: MatchReportPayload }> = ({ report }) => {
  const scoreText =
    report.KutaScore != null
      ? `${Math.round(((Math.max(0, Math.min(100, report.KutaScore)) * 36) / 100) * 10) / 10}/36`
      : '-';
  const yesNo = 'Yes';
  const cards: Array<[string, string]> = [
    ['Ashtakoot', scoreText],
    ['Ashtakoot', yesNo],
    ['Vedha Dosha', yesNo],
    ['Manglik Match', yesNo],
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold mb-3">
          What Is Dosha?
        </h2>
        <p className="font-mukta text-[#464646] text-[16px] leading-[28px] tracking-[0] text-justify">
          In Vedic astrology, a Dosha means an imbalance or flaw in a person&apos;s horoscope caused
          by the placement of certain planets in specific houses. These planetary positions are
          believed to create challenges or obstacles in areas like marriage, health, career, or
          relationships.
        </p>
      </div>

      <div>
        <h2 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold mb-3">
          What Is Ashtakoot Points?
        </h2>
        <p className="font-mukta text-[#464646] text-[16px] leading-[28px] tracking-[0] text-justify">
          Ashtakoot Points, also known as Guna Milan, are used in Vedic astrology to check marriage
          compatibility between two individuals. The word “Ashta” means eight and “Koot” means
          categories, so Ashtakoot refers to eight aspects of life that are compared in the
          horoscopes of the bride and groom. These eight aspects are Varna (temperament), Vashya
          (attraction), Tara (luck), Yoni (nature and intimacy), Graha Maitri (planetary
          friendship), Gana (behavior), Bhakoot (family life), and Nadi (health and progeny). Each
          aspect carries certain points, making a total of 36 points. A higher score indicates
          better compatibility — 28 or more points is considered excellent, 23 to 27 good, 18 to 22
          average, and less than 18 not recommended for marriage. In simple terms, Ashtakoot Points
          help determine harmony in love, health, family, and overall married life.
        </p>
      </div>

      <div>
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold mb-6">
          Match Ashtakoot Points
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div
              key={label + value}
              className="rounded-[18px] bg-[#f7f1dd] p-6 text-center shadow-sm border border-[#f5e9c6]"
            >
              <p className="font-sahitya text-primary text-[18px] font-bold mb-3">{label}</p>
              <p className="font-mukta text-[20px] font-semibold text-[#7F1808]">{value}</p>
            </div>
          ))}
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
);

const IndividualLagnaChart: React.FC<{ svg: string | undefined; title: string }> = ({
  svg,
  title,
}) => {
  const dataUrl =
    svg && svg.includes('<svg')
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      : null;
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="rounded-[20px] bg-[#f9f4dd] p-5 border-2 border-[#f5e9c6] shadow-sm h-full flex flex-col items-center">
        <h3 className="font-sahitya text-primary text-[28px] font-bold mb-4 border-b border-[#f5e9c6] pb-2 w-full text-center">
          {title}
        </h3>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`${title} D1 Chart`}
            className="w-full max-w-[400px] object-contain flex-1"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center font-mukta text-gray-500">
            No chart available
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<KundaliMatchingTab>('match');

  if (!result) {
    return (
      <section className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="mx-auto flex max-w-[1453px] flex-col items-center justify-center gap-4 py-24 text-center">
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
  const kutaScore = clampPercent(report.KutaScore);
  const predictions = report.PredictionList ?? [];
  const goodCount = predictions.filter(p => p.Nature === 'Good').length;
  const badCount = predictions.filter(p => p.Nature === 'Bad').length;
  const manName = result.man.fullName?.trim();
  const womanName = result.woman.fullName?.trim();
  const manChartUrl = chartDataUrl(result.manLagnaSvg);
  const womanChartUrl = chartDataUrl(result.womanLagnaSvg);
  const manPayloadRoot = unwrapVedastroPayload(result.manPayload);
  const manPanchanga = isRecord(manPayloadRoot) && manPayloadRoot['PanchangaTable'] ? manPayloadRoot['PanchangaTable'] : manPayloadRoot;
  const manLagnaSignFallback = getPanchangaValue(isRecord(manPanchanga) ? manPanchanga : undefined, ['Lagna'], ['LagnaSign']);

  const womanPayloadRoot = unwrapVedastroPayload(result.womanPayload);
  const womanPanchanga = isRecord(womanPayloadRoot) && womanPayloadRoot['PanchangaTable'] ? womanPayloadRoot['PanchangaTable'] : womanPayloadRoot;
  const womanLagnaSignFallback = getPanchangaValue(isRecord(womanPanchanga) ? womanPanchanga : undefined, ['Lagna'], ['LagnaSign']);
  const resultSubtitle =
    manName && womanName
      ? `Matching result for ${manName} and ${womanName}`
      : manName || womanName
        ? `Matching result for ${manName || womanName}`
        : 'Your Kundali Matching Result';

  return (
    <section className="w-full px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto w-full max-w-[1453px] space-y-8">
        <section className="w-full pt-0 md:pt-2 pb-6">
          <div className="max-w-4xl">
            <h1 className="font-sahitya font-bold text-[20px] leading-[100%] md:text-[36px] md:leading-[48px] text-primary mb-1">
              Kundali Matching Result
            </h1>
            <p className="font-mukta font-medium text-[16px] leading-[30px] md:text-[24px] text-[#141414] mb-3">
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
                <div className="relative h-[180px] w-full sm:h-[240px] md:h-[300px]">
                  {result.manPlanetRows && result.manPlanetRows.length > 0 ? (
                    <div className={`w-full h-full ${OPEN_CHART_FRAME_CLASS}`}>
                      <NorthIndianOpenChartWithPlanets
                        planetRows={result.manPlanetRows}
                        lagnaSignFallback={manLagnaSignFallback}
                      />
                    </div>
                  ) : manChartUrl ? (
                    <img
                      src={manChartUrl}
                      alt="Man Kundali chart"
                      className="h-full w-full object-contain object-center"
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
                <div className="relative h-[180px] w-full sm:h-[240px] md:h-[300px]">
                  {result.womanPlanetRows && result.womanPlanetRows.length > 0 ? (
                    <div className={`w-full h-full ${OPEN_CHART_FRAME_CLASS}`}>
                      <NorthIndianOpenChartWithPlanets
                        planetRows={result.womanPlanetRows}
                        lagnaSignFallback={womanLagnaSignFallback}
                      />
                    </div>
                  ) : womanChartUrl ? (
                    <img
                      src={womanChartUrl}
                      alt="Woman Kundali chart"
                      className="h-full w-full object-contain object-center"
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

        {/* Tabs — markup matches Free Kundali: flex row, fixed-width pills, max-w-[1453px] parent */}
        <div className="mt-6 flex flex-nowrap items-center justify-center gap-3 overflow-x-auto">
          <TabButton
            id="match"
            label="Match Result"
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
          <TabButton
            id="basic"
            label="Basic Details"
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
          <TabButton id="lagna" label="Lagna Chart" activeTab={activeTab} onSelect={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'match' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PersonCard person={result.man} role="Man" symbol="♂" />
                <PersonCard person={result.woman} role="Woman" symbol="♀" />
              </div>
              <div className="rounded-3xl border-2 border-[#f5e9c6] bg-[#f9f4dd] shadow p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <ScoreRing score={kutaScore} />
                    <div className="mt-3 flex justify-center gap-4 text-xs font-mukta">
                      <span className="text-green-600 font-semibold">✓ {goodCount} Good</span>
                      <span className="text-red-500 font-semibold">✗ {badCount} Challenging</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    {CATEGORIES.map(cat => (
                      <CategoryBar
                        key={cat.label}
                        label={cat.label}
                        icon={cat.icon}
                        percent={categoryPercent(cat.names, predictions)}
                      />
                    ))}
                  </div>
                </div>
                {report.Summary?.ScoreSummary && (
                  <div className="mt-6 rounded-xl bg-[#fffdf6] border border-[#f5e9c6] px-5 py-4">
                    <p className="font-mukta text-sm text-[#5a2a20] leading-relaxed">
                      <span className="font-semibold text-primary">Astro Summary: </span>
                      {report.Summary.ScoreSummary}
                    </p>
                  </div>
                )}
              </div>
              {predictions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-sahitya font-bold text-xl text-primary">
                    Guna Milan — Detailed Kuta Analysis
                  </h2>
                  <KutaTable predictions={predictions} man={result.man} woman={result.woman} />
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
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-[300px]">
                {result.manPlanetRows && result.manPlanetRows.length > 0 ? (
                  <div className={`rounded-[20px] p-5 shadow-sm h-full ${OPEN_CHART_FRAME_CLASS}`}>
                    <NorthIndianOpenChartWithPlanets
                      planetRows={result.manPlanetRows}
                      lagnaSignFallback={manLagnaSignFallback}
                    />
                  </div>
                ) : (
                  <IndividualLagnaChart svg={result.manLagnaSvg} title={`${result.man.fullName}'s Chart (Man)`} />
                )}
              </div>

              <div className="flex-1 min-w-[300px]">
                {result.womanPlanetRows && result.womanPlanetRows.length > 0 ? (
                  <div className={`rounded-[20px] p-5 shadow-sm h-full ${OPEN_CHART_FRAME_CLASS}`}>
                    <NorthIndianOpenChartWithPlanets
                      planetRows={result.womanPlanetRows}
                      lagnaSignFallback={womanLagnaSignFallback}
                    />
                  </div>
                ) : (
                  <IndividualLagnaChart svg={result.womanLagnaSvg} title={`${result.woman.fullName}'s Chart (Woman)`} />
                )}
              </div>
            </div>
          )}
        </div>

        <p className="font-mukta text-xs text-center text-gray-400 pb-4 mt-12">
          Results are powered by VedAstro. Information is for reference only.
        </p>
      </div>
    </section>
  );
};

export default KundaliMatchingResultSection;
