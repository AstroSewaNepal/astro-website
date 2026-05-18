'use client';

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
const HOUSE_ANCHORS: Record<number, { leftPct: number; topPct: number }> = {
  1: { leftPct: 49.5, topPct: 17 },
  2: { leftPct: 28.5, topPct: 15 },
  3: { leftPct: 13.5, topPct: 24 },
  4: { leftPct: 27.5, topPct: 42 },
  5: { leftPct: 13.5, topPct: 60 },
  6: { leftPct: 28.5, topPct: 79 },
  7: { leftPct: 49.5, topPct: 71 },
  8: { leftPct: 69.5, topPct: 77.5 },
  9: { leftPct: 84.5, topPct: 58.5 },
  10: { leftPct: 65.5, topPct: 43 },
  11: { leftPct: 86.5, topPct: 24 },
  12: { leftPct: 66.5, topPct: 15 },
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
export const OPEN_CHART_FRAME_CLASS =
  'relative mx-auto h-[353.0445861816406px] w-[463.39971923828125px] max-w-full';

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

  const recalcImgFit = useCallback(() => {
    const wrap = containerRef.current;
    const img = imgRef.current;
    if (!wrap) return;
    const nw = img?.naturalWidth || OPEN_CHART_NATURAL_SIZE.w;
    const nh = img?.naturalHeight || OPEN_CHART_NATURAL_SIZE.h;
    const next = computeObjectContainFit(wrap.clientWidth, wrap.clientHeight, nw, nh);
    setImgFit(next);
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
  const fzHouse = Math.max(7, Math.round(fitH * 0.026));
  const fzSign = Math.max(7, Math.round(fitH * 0.024));
  const fzPlanet = Math.max(8, Math.round(fitH * 0.029));
  const fzNak = Math.max(6, Math.round(fitH * 0.022));
  const fzLh = Math.max(6, Math.round(fitH * 0.02));

  return (
    <div ref={containerRef} className={`${OPEN_CHART_FRAME_CLASS}`}>
      <img
        ref={imgRef}
        src={src}
        alt="North Indian D1 chart template"
        className="block h-full w-full select-none object-contain"
        draggable={false}
        onLoad={recalcImgFit}
      />
      {imgFit ? (
        <div
          className="pointer-events-none absolute"
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
            const dense = nPlanets >= 4 ? 0.78 : nPlanets >= 2 ? 0.9 : 1;

            return (
              <div
                key={houseNum}
                className="absolute flex max-w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[2px] px-[2px] text-center"
                style={{
                  left: `${anchor.leftPct}%`,
                  top: `${anchor.topPct}%`,
                  maxWidth: `${Math.min(26, 18 + nPlanets * 3)}%`,
                }}
              >
                <span
                  className="font-mukta font-bold leading-none text-primary [text-shadow:0_0_3px_rgba(255,255,255,0.85)]"
                  style={{ fontSize: Math.round(fzHouse * dense) }}
                >
                  {houseNum}
                </span>
                {signLabel ? (
                  <span
                    className="font-mukta font-semibold leading-none text-primary [text-shadow:0_0_3px_rgba(255,255,255,0.85)]"
                    style={{ fontSize: Math.round(fzSign * dense), marginTop: 1 }}
                  >
                    {signLabel}
                  </span>
                ) : null}
                {planets.map(p => (
                  <div
                    key={p.planet}
                    className="mt-[3px] flex max-w-full flex-col items-center gap-px break-words"
                  >
                    <span
                      className="font-mukta font-semibold leading-[1.08] tracking-tight text-primary [text-shadow:0_0_3px_rgba(255,255,255,0.85)]"
                      style={{ fontSize: Math.round(fzPlanet * dense) }}
                    >
                      {p.line1}
                    </span>
                    {p.line2 ? (
                      <span
                        className="font-mukta font-normal leading-[1.06] text-primary/95 [text-shadow:0_0_3px_rgba(255,255,255,0.85)]"
                        style={{ fontSize: Math.round(fzNak * dense) }}
                      >
                        {p.line2}
                      </span>
                    ) : null}
                    {p.line3 ? (
                      <span
                        className="font-mukta font-medium leading-none text-primary/90 [text-shadow:0_0_3px_rgba(255,255,255,0.85)]"
                        style={{ fontSize: Math.round(fzLh * dense) }}
                      >
                        {p.line3}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
