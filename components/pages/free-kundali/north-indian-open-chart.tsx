'use client';

import Image from 'next/image';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import OpenChart from '@/components/images/openchart.png';

type ImgFitRect = { left: number; top: number; width: number; height: number };

/** IHDR from `openchart.png` — used until browser reports `naturalWidth` / `naturalHeight`. */
const OPEN_CHART_NATURAL_SIZE = { w: 1391, h: 1060 } as const;

function computeObjectContainFit(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): ImgFitRect | null {
  if (containerW <= 0 || containerH <= 0 || naturalW <= 0 || naturalH <= 0) return null;
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const width = naturalW * scale;
  const height = naturalH * scale;
  const left = (containerW - width) / 2;
  const top = (containerH - height) / 2;
  return { left, top, width, height };
}

/** One row from `planetDetailRow` in kundali-result-section. */
export type PlanetTableRow = string[];

const ZODIAC_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

/** Map common Hindi / alternate spellings → English sign for whole-sign wheel. */
const SIGN_NAME_TO_ENGLISH: Record<string, string> = {
  aries: 'Aries',
  mesh: 'Aries',
  mesha: 'Aries',
  taurus: 'Taurus',
  vrishabh: 'Taurus',
  vrishabha: 'Taurus',
  gemini: 'Gemini',
  mithun: 'Gemini',
  cancer: 'Cancer',
  kark: 'Cancer',
  karka: 'Cancer',
  leo: 'Leo',
  singh: 'Leo',
  sinh: 'Leo',
  virgo: 'Virgo',
  kanya: 'Virgo',
  libra: 'Libra',
  tula: 'Libra',
  scorpio: 'Scorpio',
  vrishchik: 'Scorpio',
  vrishchika: 'Scorpio',
  sagittarius: 'Sagittarius',
  dhanu: 'Sagittarius',
  dhanush: 'Sagittarius',
  capricorn: 'Capricorn',
  makar: 'Capricorn',
  aquarius: 'Aquarius',
  kumbh: 'Aquarius',
  pisces: 'Pisces',
  meen: 'Pisces',
};

const SIGN_SHORT: Record<string, string> = {
  Aries: 'Ar',
  Taurus: 'Ta',
  Gemini: 'Ge',
  Cancer: 'Cn',
  Leo: 'Le',
  Virgo: 'Vi',
  Libra: 'Li',
  Scorpio: 'Sc',
  Sagittarius: 'Sg',
  Capricorn: 'Cp',
  Aquarius: 'Aq',
  Pisces: 'Pi',
};

const PLANET_ORDER = [
  'Ascendant',
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

const PLANET_ABBR: Record<string, string> = {
  Ascendant: 'Asc',
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

/**
 * Anchor points (% of **bitmap** width / height) for each house on `openchart.png`.
 * North Indian layout (house 1 = top / Lagna diamond). Nudged slightly toward chart centre
 * so labels clear red strokes (especially houses 2, 10, 12).
 */
const HOUSE_ANCHORS: Record<number, { leftPct: number; topPct: number; widthPct: number }> = {
  1: { leftPct: 50, topPct: 25, widthPct: 14 },
  2: { leftPct: 30, topPct: 10, widthPct: 10 },
  3: { leftPct: 9, topPct: 28, widthPct: 14 },
  4: { leftPct: 30, topPct: 48, widthPct: 14 },
  5: { leftPct: 13, topPct: 70, widthPct: 14 },
  6: { leftPct: 25, topPct: 87, widthPct: 14 },
  7: { leftPct: 50, topPct: 68, widthPct: 14 },
  8: { leftPct: 69.5, topPct: 90, widthPct: 14 },
  9: { leftPct: 89, topPct: 70, widthPct: 16 },
  10: { leftPct: 75, topPct: 50, widthPct: 14 },
  11: { leftPct: 90, topPct: 25, widthPct: 10 },
  12: { leftPct: 72, topPct: 9, widthPct: 17 },
};

function parseHouseNumber(cell: string): number | null {
  const trimmed = cell.trim();
  if (!trimmed || trimmed === '-') return null;
  const m = trimmed.match(/(\d{1,2})/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  if (n < 1 || n > 12) return null;
  return n;
}

function compactDegreeInSign(dms: string): string {
  if (!dms || dms === '-') return '';
  const m = dms.match(/(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+)?/);
  if (!m) {
    const short = dms.replace(/\s+/g, ' ').trim();
    return short.length > 12 ? `${short.slice(0, 10)}…` : short;
  }
  const deg = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  const total = deg + min / 60 + sec / 3600;
  return `${total.toFixed(2)}°`;
}

function resolveEnglishSignName(raw: string): string | null {
  const t = raw.trim();
  if (!t || t === '-') return null;
  const key = t.replace(/\s+/g, ' ').toLowerCase();
  if (SIGN_NAME_TO_ENGLISH[key]) return SIGN_NAME_TO_ENGLISH[key];
  const first = key.split(/\s+/)[0] ?? key;
  if (SIGN_NAME_TO_ENGLISH[first]) return SIGN_NAME_TO_ENGLISH[first];
  for (const z of ZODIAC_ORDER) {
    if (key === z.toLowerCase()) return z;
    if (key.startsWith(z.slice(0, 4).toLowerCase())) return z;
  }
  return null;
}

function zodiacIndex(english: string): number {
  return ZODIAC_ORDER.indexOf(english as (typeof ZODIAC_ORDER)[number]);
}

/** Whole-sign rashi in each house (house 1 = Lagna sign). */
function wholeSignLabelsForHouses(lagnaEnglish: string): string[] | null {
  const idx = zodiacIndex(lagnaEnglish);
  if (idx < 0) return null;
  const labels: string[] = [];
  for (let h = 1; h <= 12; h++) {
    const sign = ZODIAC_ORDER[(idx + h - 1) % 12];
    labels.push(SIGN_SHORT[sign] ?? sign.slice(0, 2));
  }
  return labels;
}

function shortenNakshatra(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t || t === '-') return '';
  const cut = t.length > 16 ? `${t.slice(0, 14)}…` : t;
  return cut;
}

function planetSortKey(name: string): number {
  const idx = PLANET_ORDER.indexOf(name as (typeof PLANET_ORDER)[number]);
  return idx === -1 ? 99 : idx;
}

type HousePlanet = {
  planet: string;
  line1: string;
  line2: string;
  line3: string;
};

function groupPlanetsByHouse(rows: PlanetTableRow[]): Map<number, HousePlanet[]> {
  const map = new Map<number, HousePlanet[]>();

  for (const row of rows) {
    const planet = row[0]?.trim();
    if (!planet) continue;
    const houseCell = row[5] ?? '';
    const house = parseHouseNumber(String(houseCell));
    if (house === null) continue;

    const retroRaw = (row[7] ?? '').toString().trim().toLowerCase();
    const retro = retroRaw === 'yes' || retroRaw === 'true' || retroRaw === 'y' || retroRaw === '1';

    const abbr = PLANET_ABBR[planet] ?? planet.slice(0, 3);
    const degShort = compactDegreeInSign(row[2] ?? '');
    const line1 = degShort
      ? `${abbr}-${degShort}${retro ? '®' : ''}`
      : `${abbr}${retro ? '®' : ''}`;

    const nak = shortenNakshatra(row[4] ?? '');
    const line2 = nak ? `★ ${nak}` : '';

    const hSign = parseHouseNumber(String(row[5] ?? ''));
    const hLong = parseHouseNumber(String(row[6] ?? ''));
    const line3 = hSign !== null && hLong !== null && hSign !== hLong ? `Lh${hLong}` : '';

    const list = map.get(house) ?? [];
    list.push({ planet, line1, line2, line3 });
    map.set(house, list);
  }

  for (const [, list] of map) {
    list.sort((a, b) => planetSortKey(a.planet) - planetSortKey(b.planet));
  }

  return map;
}

/** Same frame as Basic Details `OpenChart` preview (matches Next/Image fill + object-contain box). */
export const OPEN_CHART_FRAME_CLASS = 'relative mx-auto h-[300px] w-full max-w-[700px]';

export type NorthIndianOpenChartProps = {
  planetRows: PlanetTableRow[];
  /** Used for whole-sign rashi labels if Ascendant row is missing. */
  lagnaSignFallback?: string;
};

export function NorthIndianOpenChartWithPlanets({
  planetRows,
  lagnaSignFallback = '',
}: NorthIndianOpenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgFit, setImgFit] = useState<ImgFitRect | null>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  const recalcImgFit = useCallback(() => {
    const wrap = containerRef.current;
    const img = imgRef.current;
    if (!wrap) return;
    const nw = img?.naturalWidth || OPEN_CHART_NATURAL_SIZE.w;
    const nh = img?.naturalHeight || OPEN_CHART_NATURAL_SIZE.h;
    const next = computeObjectContainFit(wrap.clientWidth, wrap.clientHeight, nw, nh);
    setImgFit(next);
    if (next) {
      // If the computed image height is larger than the current container, expand container
      // so overlay text doesn't spill outside (keeps labels below surrounding text).
      if (next.height > wrap.clientHeight) {
        setMinHeight(Math.ceil(next.height));
      } else {
        setMinHeight(undefined);
      }
    }
  }, []);

  useLayoutEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;
    recalcImgFit();
    const ro = new ResizeObserver(() => recalcImgFit());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [recalcImgFit]);

  const byHouse = useMemo(() => groupPlanetsByHouse(planetRows), [planetRows]);

  const lagnaEnglish = useMemo(() => {
    const asc = planetRows.find(r => r[0] === 'Ascendant');
    const fromAsc = asc && asc[1] && asc[1] !== '-' ? resolveEnglishSignName(String(asc[1])) : null;
    if (fromAsc) return fromAsc;
    return lagnaSignFallback ? resolveEnglishSignName(lagnaSignFallback) : null;
  }, [planetRows, lagnaSignFallback]);

  const houseSignShort = useMemo(
    () => (lagnaEnglish ? wholeSignLabelsForHouses(lagnaEnglish) : null),
    [lagnaEnglish],
  );

  const src = typeof OpenChart === 'string' ? OpenChart : OpenChart.src;

  const fitH = imgFit?.height ?? 353;
  const fzHouse = Math.max(10, Math.round(fitH * 0.034));
  const fzSign = Math.max(9, Math.round(fitH * 0.032));
  const fzPlanet = Math.max(11, Math.round(fitH * 0.044));

  return (
    <div
      ref={containerRef}
      className={`${OPEN_CHART_FRAME_CLASS}`}
      style={minHeight ? { height: `${minHeight}px` } : undefined}
    >
      <Image
        ref={imgRef}
        src={src}
        alt="North Indian D1 chart template"
        width={OPEN_CHART_NATURAL_SIZE.w}
        height={OPEN_CHART_NATURAL_SIZE.h}
        className="block h-full w-full select-none object-contain"
        draggable={false}
        onLoad={recalcImgFit}
        unoptimized
      />
      {imgFit ? (
        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: imgFit.left,
            top: imgFit.top,
            width: imgFit.width,
            height: imgFit.height,
          }}
        >
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map(houseNum => {
            const anchor = HOUSE_ANCHORS[houseNum];
            const planets = byHouse.get(houseNum) ?? [];
            const signLabel = houseSignShort?.[houseNum - 1] ?? null;
            const nPlanets = planets.length;
            const dense = nPlanets >= 4 ? 0.85 : nPlanets >= 2 ? 0.95 : 1;

            return (
              <div
                key={houseNum}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${anchor.leftPct}%`,
                  top: `${anchor.topPct}%`,
                  width: `${anchor.widthPct * 0.9}%`,
                  minWidth: '4rem',
                  minHeight: '6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.1rem',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  className="font-mukta font-bold leading-none text-primary [text-shadow:0_0_4px_rgba(255,255,255,0.9)]"
                  style={{ fontSize: Math.round(fzHouse * dense) }}
                >
                  {houseNum}
                </span>
                {signLabel ? (
                  <span
                    className="font-mukta font-semibold text-primary [text-shadow:0_0_4px_rgba(255,255,255,0.9)]"
                    style={{
                      fontSize: Math.round(fzSign * dense),
                      lineHeight: 1,
                      marginBottom: '0.18rem',
                    }}
                  >
                    {signLabel}
                  </span>
                ) : null}
                {planets.length > 0 ? (
                  <div
                    className="flex flex-col items-center justify-center gap-1"
                    style={{ width: '100%', maxHeight: '4rem', overflow: 'hidden' }}
                  >
                    {planets.map(p => (
                      <span
                        key={p.planet}
                        className="font-mukta font-semibold tracking-tight text-primary [text-shadow:0_0_4px_rgba(255,255,255,0.9)]"
                        style={{
                          fontSize: Math.round(fzPlanet * dense * 0.92),
                          lineHeight: '1.08em',
                          width: '100%',
                          wordBreak: 'break-word',
                        }}
                      >
                        {p.line1}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div className="pointer-events-none absolute inset-0">
            {[
              { left: '72%', top: '14%', rotate: '14deg' },
              { left: '48%', top: '46%', rotate: '-8deg' },
              { left: '18%', top: '72%', rotate: '10deg' },
              { left: '76%', top: '76%', rotate: '-10deg' },
            ].map(({ left, top, rotate }, index) => (
              <span
                key={index}
                className="absolute text-[14px] font-semibold uppercase tracking-[0.3em] text-[#7f1808]/18"
                style={{ left, top, transform: `translate(-50%, -50%) rotate(${rotate})` }}
              >
                astrosewa.com
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
