'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicBackendBaseCandidates } from '@/lib/utils/url';

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

type PersonInput = {
  fullName: string;
  dateOfBirth: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  latitude: string;
  longitude: string;
};

type StoredMatchingInput = {
  man: PersonInput;
  woman: PersonInput;
  // Cached individual data
  manPayload?: unknown;
  womanPayload?: unknown;
  manPlanetRows?: string[][];
  womanPlanetRows?: string[][];
  manLagnaSvg?: string;
  womanLagnaSvg?: string;
};

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

type MatchApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    payload?: {
      MatchReport?: MatchReportPayload;
    };
  };
};

type VedastroProxyResult = {
  calculator?: string;
  payload?: unknown;
};

type TabButtonProps = {
  id: KundaliMatchingTab;
  label: string;
  activeTab: KundaliMatchingTab;
  onSelect: (tab: KundaliMatchingTab) => void;
};

function TabButton({ id, label, activeTab, onSelect }: TabButtonProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`h-[40px] md:h-[46px] px-6 whitespace-nowrap rounded-[32px] border border-[#A13924] font-mukta text-[16px] md:text-[18px] font-medium transition-colors duration-200 ${
        activeTab === id
          ? 'bg-[#7F1808] text-white'
          : 'bg-[#ede9d9] text-[#7F1808] hover:bg-[#7F1808] hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VEDASTRO_NINE_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

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

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function toTitleCase(value: string | undefined): string {
  if (!value) return '-';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getLocalOffset(dateInput: string): string {
  const [day, month, year] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

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

function getStoredKundaliQueryParams(person: PersonInput): URLSearchParams | null {
  if (!person.latitude || !person.longitude || !person.dateOfBirth || !person.birthTime)
    return null;
  return new URLSearchParams({
    lat: person.latitude,
    lon: person.longitude,
    date: person.dateOfBirth,
    time: person.birthTime,
    offset: getLocalOffset(person.dateOfBirth),
    location: person.birthPlace || '',
  });
}

function cleanVedastroCell(value: unknown): string {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') {
    if (
      value.includes('TargetInvocationException') ||
      value.includes('System.Reflection') ||
      value.includes('KeyNotFoundException')
    )
      return '—';
    return value.trim() || '-';
  }
  return '-';
}

function degreeFromBlock(block: unknown): string {
  if (!block || typeof block !== 'object') return '-';
  const d = (block as Record<string, unknown>).DegreeMinuteSecond;
  return typeof d === 'string' && d.trim() ? d : '-';
}

function planetDetailRow(planet: string, raw: Record<string, unknown>): string[] {
  const rasi = raw.PlanetRasiD1Sign as Record<string, unknown> | undefined;
  const signName = typeof rasi?.Name === 'string' ? rasi.Name : '-';
  const degInSign =
    rasi && typeof rasi.DegreesIn === 'object' ? degreeFromBlock(rasi.DegreesIn) : '-';
  const nirayana = degreeFromBlock(raw.PlanetNirayanaLongitude);
  const nak = cleanVedastroCell(raw.PlanetConstellation);
  const houseSign = cleanVedastroCell(raw.HousePlanetOccupiesBasedOnSign);
  const houseLong = cleanVedastroCell(raw.HousePlanetOccupiesBasedOnLongitudes);
  const retro = cleanVedastroCell(raw.IsPlanetRetrograde);
  const lordBlock = raw.PlanetLordOfConstellation as Record<string, unknown> | undefined;
  const nakLord =
    lordBlock && typeof lordBlock.Name === 'string' ? lordBlock.Name : cleanVedastroCell(lordBlock);

  return [planet, signName, degInSign, nirayana, nak, houseSign, houseLong, retro, nakLord];
}

// ─── Network Helpers ──────────────────────────────────────────────────────────

const getCandidateBackendBases = getPublicBackendBaseCandidates;

async function fetchMatchReport(man: PersonInput, woman: PersonInput): Promise<MatchReportPayload> {
  const bride = woman.gender === 'male' ? man : woman;
  const groom = woman.gender === 'male' ? woman : man;

  const params = new URLSearchParams({
    brideLat: bride.latitude,
    brideLon: bride.longitude,
    brideTime: bride.birthTime,
    brideDate: bride.dateOfBirth,
    brideOffset: getLocalOffset(bride.dateOfBirth),
    brideName: bride.fullName,
    groomLat: groom.latitude,
    groomLon: groom.longitude,
    groomTime: groom.birthTime,
    groomDate: groom.dateOfBirth,
    groomOffset: getLocalOffset(groom.dateOfBirth),
    groomName: groom.fullName,
  });

  const attemptErrors: string[] = [];
  for (const base of getCandidateBackendBases()) {
    const url = `${base}api/v1/vedastro/proxy/match?${params.toString()}`;
    try {
      const res = await fetch(url);
      const ct = res.headers.get('content-type')?.toLowerCase() ?? '';
      if (!ct.includes('application/json')) {
        attemptErrors.push(`Non-JSON from ${url} (${res.status})`);
        continue;
      }
      const json = (await res.json()) as MatchApiResponse;
      if (!res.ok || json.success === false) {
        attemptErrors.push(json.message ?? `Request failed (${res.status}).`);
        continue;
      }
      const report = json.data?.payload?.MatchReport;
      if (!report) {
        attemptErrors.push('MatchReport missing in response.');
        continue;
      }
      return report;
    } catch (err) {
      attemptErrors.push(err instanceof Error ? err.message : 'Network error');
    }
  }
  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Failed to fetch match report.');
}

async function fetchVedastroGeneral(
  query: URLSearchParams,
): Promise<{ payload: VedastroProxyResult; usedBase: string }> {
  for (const base of getCandidateBackendBases()) {
    const url = `${base}api/v1/vedastro/proxy/general?${query.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const payload = (await response.json()) as VedastroProxyResult;
      return { payload, usedBase: base };
    } catch (e) {
      /* empty */
    }
  }
  throw new Error('Failed to reach backend endpoint for Dosha.');
}

async function fetchVedastroPlanetsTable(
  query: URLSearchParams,
): Promise<{ rows: string[][]; usedBase: string }> {
  for (const base of getCandidateBackendBases()) {
    try {
      const tasks = VEDASTRO_NINE_PLANETS.map(async planet => {
        const q = new URLSearchParams(query);
        q.set('planet', planet);
        const url = `${base}api/v1/vedastro/proxy/planets?${q.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const json = (await response.json()) as unknown;
        const data = isRecord(json) && isRecord(json['data']) ? json['data'] : undefined;
        const inner = data && isRecord(data['payload']) ? data['payload'] : {};
        return planetDetailRow(planet, inner);
      });
      const rows = await Promise.all(tasks);
      return { rows, usedBase: base };
    } catch (e) {
      /* empty */
    }
  }
  throw new Error('Failed to load planet details.');
}

async function fetchVedastroBirthChart(
  query: URLSearchParams,
): Promise<{ svg: string; usedBase: string }> {
  const q = new URLSearchParams(query);
  q.set('style', 'south');
  for (const base of getCandidateBackendBases()) {
    const url = `${base}api/v1/vedastro/proxy/chart?${q.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const json = (await response.json()) as unknown;
      const data = isRecord(json) && isRecord(json['data']) ? json['data'] : undefined;
      const payload = data ? data['payload'] : undefined;
      if (typeof payload === 'string' && payload.includes('<svg'))
        return { svg: payload, usedBase: base };
    } catch (e) {
      /* empty */
    }
  }
  throw new Error('Failed to load birth chart.');
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
  <div className="rounded-2xl border-2 border-primary/20 bg-white/80 shadow-sm p-4 md:p-5 flex flex-col gap-2">
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
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto rounded-2xl border border-primary/20 shadow-sm">
      <table className="w-full min-w-[500px] text-sm font-mukta">
        <thead>
          <tr className="bg-primary text-secondary">
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
            const isOpen = expanded === name;
            const info = row.Info?.trim() || row.Description?.trim();
            return (
              <React.Fragment key={name}>
                <tr
                  className={`border-t border-primary/10 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-[#fdf8f3]' : 'bg-white'} hover:bg-[#f9ece0]`}
                  onClick={() => setExpanded(isOpen ? null : name)}
                >
                  <td className="px-4 py-2.5 font-medium text-[#3d1a14]">
                    <span className="flex items-center gap-1.5">
                      {info && (
                        <span className="text-primary/50 text-xs">{isOpen ? '▾' : '▸'}</span>
                      )}
                      {name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">{natureBadge(row.Nature)}</td>
                  <td className={`px-3 py-2.5 text-center text-xs ${natureColor(row.Nature)}`}>
                    {row.MaleInfo?.trim() || (row.Nature ?? '-')}
                  </td>
                  <td className={`px-3 py-2.5 text-center text-xs ${natureColor(row.Nature)}`}>
                    {row.FemaleInfo?.trim() || (row.Nature ?? '-')}
                  </td>
                </tr>
                {isOpen && info && (
                  <tr className="border-t border-primary/5">
                    <td
                      colSpan={4}
                      className="px-4 py-3 bg-[#fff9f4] text-xs text-[#5a2a20] leading-relaxed italic"
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

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-primary/10 ${className}`} />
);

// ─── Individual Tabs Renderers ────────────────────────────────────────────────

const IndividualBasicDetails: React.FC<{
  person: PersonInput;
  payload: unknown;
  title: string;
}> = ({ person, payload, title }) => {
  const pData = unwrapVedastroPayload(payload);
  const panchanga = isRecord(pData) && pData['PanchangaTable'] ? pData['PanchangaTable'] : pData;
  const panchangaRecord = isRecord(panchanga) ? panchanga : undefined;
  const nakshatra = getPanchangaValue(panchangaRecord, ['Nakshatra'], ['NakshatraName']);

  const basicRows: Array<[string, string]> = [
    ['Name', person.fullName || '-'],
    ['Birth Date', person.dateOfBirth || '-'],
    ['Birth Time', person.birthTime || '-'],
    ['Birth Place', person.birthPlace || '-'],
    ['Gender', toTitleCase(person.gender)],
    ['Rashi', formatRashiFromNakshatra(nakshatra)],
    ['Latitude', person.latitude || '-'],
    ['Longitude', person.longitude || '-'],
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
      <div className="rounded-[20px] bg-white p-5 border-2 border-primary/20 shadow-sm mb-6">
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold border-b border-primary/10 pb-2 mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="font-sahitya text-primary text-[22px] font-bold mb-2">Basic Details</h4>
            <div className="border-t border-l border-primary/20">
              {basicRows.map(([lbl, val]) => (
                <div key={lbl} className="grid grid-cols-2 border-b border-r border-primary/20">
                  <div className="px-3 py-1.5 font-mukta text-[15px] font-medium text-[#3a3a3a] bg-primary/5">
                    {lbl}
                  </div>
                  <div className="px-3 py-1.5 font-mukta text-[15px] text-[#4a4a4a] bg-white">
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-sahitya text-primary text-[22px] font-bold mb-2">
              Kundali Details
            </h4>
            <div className="border-t border-l border-primary/20">
              {kundaliRows.map(([lbl, val]) => (
                <div key={lbl} className="grid grid-cols-2 border-b border-r border-primary/20">
                  <div className="px-3 py-1.5 font-mukta text-[15px] font-medium text-[#3a3a3a] bg-primary/5">
                    {lbl}
                  </div>
                  <div className="px-3 py-1.5 font-mukta text-[15px] text-[#4a4a4a] bg-white">
                    {val}
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
        <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold border-b border-primary/10 pb-2 mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {doshaCards.map(([lbl, val]) => (
            <div
              key={lbl}
              className="rounded-lg bg-white p-3 text-center shadow-sm border border-[#f5e9c6]"
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
                <tr key={lbl} className="border-b border-[#f5e9c6] last:border-0 bg-white">
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

const IndividualPlanetsTable: React.FC<{ rows: string[][]; title: string }> = ({ rows, title }) => (
  <div className="mt-8 rounded-[20px] bg-[#f9f4dd] p-5 md:p-7 w-full shadow-sm">
    <h3 className="font-sahitya text-primary text-[28px] font-bold mb-4 border-b border-primary/10 pb-2">
      {title}
    </h3>
    <div className="overflow-x-auto rounded-lg border border-[#f5e9c6]">
      <table className="min-w-[900px] w-full text-sm font-mukta bg-white">
        <thead>
          <tr className="bg-[#fffdf6] border-b border-[#f5e9c6]">
            {[
              'Planet',
              'Sign (Rasi)',
              '° in sign',
              'Nirayana',
              'Nakshatra',
              'House (sign)',
              'House (°)',
              'Retro',
              'Nak. lord',
            ].map(h => (
              <th
                key={h}
                className="px-3 py-2.5 text-left font-medium text-[#2d2d2d] border-r border-[#f5e9c6] last:border-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#f5e9c6] last:border-0 hover:bg-[#fffdf6]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-[#2d2d2d] border-r border-[#f5e9c6] last:border-0"
                >
                  {j === 0 ? <span className="font-medium text-[#7F1808]">{cell}</span> : cell}
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
      <div className="rounded-[20px] bg-white p-5 border-2 border-primary/20 shadow-sm h-full flex flex-col items-center">
        <h3 className="font-sahitya text-primary text-[28px] font-bold mb-4 border-b border-primary/10 pb-2 w-full text-center">
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

const KundaliMatchingResultSection: React.FC = () => {
  const [input, setInput] = useState<StoredMatchingInput | null>(null);
  const [activeTab, setActiveTab] = useState<KundaliMatchingTab>('match');
  const [report, setReport] = useState<MatchReportPayload | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [errorMatch, setErrorMatch] = useState<string | null>(null);

  // States for tabs
  const [isFetchingDosha, setIsFetchingDosha] = useState(false);
  const [isFetchingPlanets, setIsFetchingPlanets] = useState(false);
  const [isFetchingChart, setIsFetchingChart] = useState(false);

  useEffect(() => {
    const raw = window.sessionStorage.getItem('kundaliMatchingInput');
    if (!raw) return;
    let cancelled = false;
    try {
      const parsed = JSON.parse(raw) as StoredMatchingInput;
      queueMicrotask(() => {
        if (!cancelled) setInput(parsed);
      });
    } catch {
      queueMicrotask(() => {
        if (!cancelled) setInput(null);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Update session storage
  const updateInput = (newInput: StoredMatchingInput) => {
    setInput(newInput);
    if (typeof window !== 'undefined')
      window.sessionStorage.setItem('kundaliMatchingInput', JSON.stringify(newInput));
  };

  // Fetch MatchReport
  useEffect(() => {
    if (!input || report || loadingMatch) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingMatch(true);
      setErrorMatch(null);
    });
    fetchMatchReport(input.man, input.woman)
      .then(data => {
        if (!cancelled) setReport(data);
      })
      .catch(err => {
        if (!cancelled) setErrorMatch(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingMatch(false);
      });
    return () => {
      cancelled = true;
    };
  }, [input, report]);

  // Fetch Dosha (General)
  useEffect(() => {
    if (activeTab !== 'dosha' && activeTab !== 'basic') return;
    if (!input || (input.manPayload && input.womanPayload)) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsFetchingDosha(true);
    });
    Promise.all([
      input.manPayload
        ? Promise.resolve({ payload: input.manPayload })
        : fetchVedastroGeneral(getStoredKundaliQueryParams(input.man)!),
      input.womanPayload
        ? Promise.resolve({ payload: input.womanPayload })
        : fetchVedastroGeneral(getStoredKundaliQueryParams(input.woman)!),
    ])
      .then(([manRes, womanRes]) => {
        if (cancelled) return;
        updateInput({ ...input, manPayload: manRes.payload, womanPayload: womanRes.payload });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsFetchingDosha(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, input]);

  // Fetch Planets
  useEffect(() => {
    if (activeTab !== 'planets' || !input || (input.manPlanetRows && input.womanPlanetRows)) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsFetchingPlanets(true);
    });
    Promise.all([
      input.manPlanetRows
        ? Promise.resolve({ rows: input.manPlanetRows })
        : fetchVedastroPlanetsTable(getStoredKundaliQueryParams(input.man)!),
      input.womanPlanetRows
        ? Promise.resolve({ rows: input.womanPlanetRows })
        : fetchVedastroPlanetsTable(getStoredKundaliQueryParams(input.woman)!),
    ])
      .then(([manRes, womanRes]) => {
        if (cancelled) return;
        updateInput({ ...input, manPlanetRows: manRes.rows, womanPlanetRows: womanRes.rows });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsFetchingPlanets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, input]);

  // Fetch Lagna Chart
  useEffect(() => {
    if (activeTab !== 'lagna' || !input || (input.manLagnaSvg && input.womanLagnaSvg)) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsFetchingChart(true);
    });
    Promise.all([
      input.manLagnaSvg
        ? Promise.resolve({ svg: input.manLagnaSvg })
        : fetchVedastroBirthChart(getStoredKundaliQueryParams(input.man)!),
      input.womanLagnaSvg
        ? Promise.resolve({ svg: input.womanLagnaSvg })
        : fetchVedastroBirthChart(getStoredKundaliQueryParams(input.woman)!),
    ])
      .then(([manRes, womanRes]) => {
        if (cancelled) return;
        updateInput({ ...input, manLagnaSvg: manRes.svg, womanLagnaSvg: womanRes.svg });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsFetchingChart(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, input]);

  if (!input) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="font-sahitya text-2xl font-bold text-primary">No Kundali data found.</p>
        <Link
          href="/kundali-matching"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mukta text-sm font-semibold text-secondary hover:bg-[#8e2f27] transition-colors"
        >
          ← Back to Form
        </Link>
      </div>
    );
  }

  const kutaScore = clampPercent(report?.KutaScore);
  const predictions = report?.PredictionList ?? [];
  const goodCount = predictions.filter(p => p.Nature === 'Good').length;
  const badCount = predictions.filter(p => p.Nature === 'Bad').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-sahitya font-bold text-2xl md:text-[40px] text-primary leading-tight">
            Kundali Matching Result
          </h1>
          <p className="font-mukta text-[#141414] text-sm md:text-lg mt-1">
            {input.man.fullName} &amp; {input.woman.fullName}
          </p>
        </div>
        <Link
          href="/kundali-matching"
          className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-4 py-2 font-mukta text-sm font-semibold text-primary hover:bg-primary hover:text-secondary transition-colors"
        >
          ← Match Again
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap items-center justify-start md:justify-center gap-3 overflow-x-auto pb-2">
        <TabButton id="match" label="Match Result" activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="basic" label="Basic Details" activeTab={activeTab} onSelect={setActiveTab} />
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
        {/* Match Result Tab */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PersonCard person={input.man} role="Man" symbol="♂" />
              <PersonCard person={input.woman} role="Woman" symbol="♀" />
            </div>
            {loadingMatch ? (
              <div className="rounded-3xl border-2 border-primary/20 bg-white/70 shadow p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                <Skeleton className="w-36 h-36 rounded-full" />
                <div className="flex-1 space-y-4 w-full">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : errorMatch ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="font-mukta text-sm font-semibold text-red-700">{errorMatch}</p>
              </div>
            ) : report ? (
              <>
                <div className="rounded-3xl border-2 border-primary/20 bg-white/80 shadow p-6 md:p-8">
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
                    <div className="mt-6 rounded-xl bg-[#fdf8f3] border border-primary/15 px-5 py-4">
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
                    <KutaTable predictions={predictions} man={input.man} woman={input.woman} />
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Basic Details Tab */}
        {activeTab === 'basic' && (
          <div>
            {isFetchingDosha ? (
              <p className="font-mukta text-center py-10">Loading detailed info...</p>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <IndividualBasicDetails
                  person={input.man}
                  payload={input.manPayload}
                  title={`${input.man.fullName}'s Details (Man)`}
                />
                <IndividualBasicDetails
                  person={input.woman}
                  payload={input.womanPayload}
                  title={`${input.woman.fullName}'s Details (Woman)`}
                />
              </div>
            )}
          </div>
        )}

        {/* Dosha Tab */}
        {activeTab === 'dosha' && (
          <div>
            {isFetchingDosha ? (
              <p className="font-mukta text-center py-10">Loading Dosha info...</p>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <IndividualDoshaDetails
                  payload={input.manPayload}
                  title={`${input.man.fullName}'s Dosha (Man)`}
                />
                <IndividualDoshaDetails
                  payload={input.womanPayload}
                  title={`${input.woman.fullName}'s Dosha (Woman)`}
                />
              </div>
            )}
          </div>
        )}

        {/* Planets Tab */}
        {activeTab === 'planets' && (
          <div>
            {isFetchingPlanets ? (
              <p className="font-mukta text-center py-10">Loading Planet tables...</p>
            ) : (
              <div className="flex flex-col gap-8">
                {input.manPlanetRows && (
                  <IndividualPlanetsTable
                    rows={input.manPlanetRows}
                    title={`${input.man.fullName}'s Planets (Man)`}
                  />
                )}
                {input.womanPlanetRows && (
                  <IndividualPlanetsTable
                    rows={input.womanPlanetRows}
                    title={`${input.woman.fullName}'s Planets (Woman)`}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Lagna Chart Tab */}
        {activeTab === 'lagna' && (
          <div>
            {isFetchingChart ? (
              <p className="font-mukta text-center py-10">Loading Lagna Charts...</p>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <IndividualLagnaChart
                  svg={input.manLagnaSvg}
                  title={`${input.man.fullName}'s Chart (Man)`}
                />
                <IndividualLagnaChart
                  svg={input.womanLagnaSvg}
                  title={`${input.woman.fullName}'s Chart (Woman)`}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <p className="font-mukta text-xs text-center text-gray-400 pb-4 mt-12">
        Results are powered by VedAstro. Information is for reference only.
      </p>
    </div>
  );
};

export default KundaliMatchingResultSection;
