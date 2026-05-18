'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { resolveVedastroProxyFetchUrl } from '@/lib/utils/url';
import PanchangCircleImage from '@/components/images/panchang_circle.png';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import PanchangTimingStrip, { type PanchangTimingEntry } from './panchang-timing-strip';
import { MOON_RISE_SET_SOURCE_NOTE, moonRiseSetForPlace } from './panchang-moon-times';
import {
  PANCHANG_DEFAULT_GEO,
  buildPanchangaTitleLine,
  dateInputIsoValue,
  extractPanchangaResult,
  formatBriefFromStdTime,
  formatDdMmYyyy,
  formatEnglishLongDate,
  getCandidateBackendBases,
  nestedString,
  pakshaDisplay,
  parseIsoToLocalCalendarDate,
  utcOffsetHmFromLocalDate,
  yogaName,
} from './panchang-utils';

async function fetchPanchangaForDate(
  calendarDay: Date,
  cityLabel: string,
): Promise<{ table: Record<string, unknown>; moonSign: string }> {
  const attemptErrors: string[] = [];
  const params = new URLSearchParams({
    lat: String(PANCHANG_DEFAULT_GEO.lat),
    lon: String(PANCHANG_DEFAULT_GEO.lon),
    date: formatDdMmYyyy(calendarDay),
    time: '12:00',
    offset: utcOffsetHmFromLocalDate(calendarDay),
    location: cityLabel.trim() || PANCHANG_DEFAULT_GEO.label,
  });

  for (const base of getCandidateBackendBases()) {
    const url = resolveVedastroProxyFetchUrl(base, 'panchanga', params);
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
      if (!contentType.includes('application/json')) {
        attemptErrors.push(`Non-JSON (${response.status})`);
        continue;
      }
      const json = (await response.json()) as Record<string, unknown>;
      if (!response.ok || json.success === false) {
        attemptErrors.push(
          (typeof json.message === 'string' && json.message) ||
            `Request failed (${response.status}).`,
        );
        continue;
      }
      const parsed = extractPanchangaResult(json);
      if (!parsed) {
        attemptErrors.push('Unexpected response shape.');
        continue;
      }
      return parsed;
    } catch (e) {
      attemptErrors.push(e instanceof Error ? e.message : 'Network error');
    }
  }

  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Failed to load panchanga.');
}

function buildTimings(
  table: Record<string, unknown> | null,
  calendarDay: Date,
): PanchangTimingEntry[] {
  const sunrise = formatBriefFromStdTime(
    table && typeof table.Sunrise === 'object'
      ? (table.Sunrise as Record<string, unknown>).StdTime
      : undefined,
  );
  const sunset = formatBriefFromStdTime(
    table && typeof table.Sunset === 'object'
      ? (table.Sunset as Record<string, unknown>).StdTime
      : undefined,
  );
  const { rise, set } = moonRiseSetForPlace(calendarDay);
  return [
    { label: 'Sunrise', time: sunrise },
    { label: 'Sunset', time: sunset },
    { label: 'Moonrise', time: rise },
    { label: 'Moonset', time: set },
  ];
}

const PanchangTodaySection: React.FC = () => {
  const [calendarDay, setCalendarDay] = useState(() => new Date());
  const [city, setCity] = useState<string>(PANCHANG_DEFAULT_GEO.label);
  const cityRef = useRef(city);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);
  const [panchanga, setPanchanga] = useState<{
    table: Record<string, unknown>;
    moonSign: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPanchangaForDate(calendarDay, cityRef.current);
      setPanchanga(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
      setPanchanga(null);
    } finally {
      setLoading(false);
    }
  }, [calendarDay]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const shiftDay = (delta: number) => {
    setCalendarDay(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const onTodayClick = () => {
    setCalendarDay(new Date());
  };

  const onDateInputChange = (iso: string) => {
    const parsed = parseIsoToLocalCalendarDate(iso);
    if (parsed) setCalendarDay(parsed);
  };

  const titleLine = panchanga ? buildPanchangaTitleLine(panchanga.table) : '—';
  const longDateLabel = formatEnglishLongDate(calendarDay);
  const displayDdMmYy = formatDdMmYyyy(calendarDay);

  const tithiObj = (panchanga?.table?.Tithi ?? null) as Record<string, unknown> | null;
  const varaLabel = nestedString(panchanga?.table, 'Vara') || '—';
  const pakshaLine = pakshaDisplay(tithiObj ? nestedString(tithiObj, 'Paksha') : undefined);
  const nakshatra = nestedString(panchanga?.table, 'Nakshatra') || '—';
  const yogaLbl = yogaName(panchanga?.table?.Yoga);
  const karana = nestedString(panchanga?.table, 'Karana') || '—';
  const moonRashi = panchanga?.moonSign?.trim() || '—';

  const timings = buildTimings(panchanga?.table ?? null, calendarDay);

  const roundedInputChrome =
    'h-[36px] md:h-[44px] rounded-full border border-primary font-mukta bg-secondary text-primary outline-none px-4';

  const dateChromeMd =
    'hidden md:flex md:h-[44px] md:rounded-[32px] md:border md:border-primary md:px-6 md:min-w-[208px]';

  return (
    <>
      <style>{`
        .city-input::placeholder {
          color: inherit;
        }
      `}</style>
      <section className="w-full max-w-[1454px] box-border min-h-[580px] flex flex-col lg:flex-row items-start gap-8 md:gap-10 opacity-100">
        <div className="w-full max-w-[982.6405px] min-h-[580px] flex flex-col gap-7 md:gap-10 opacity-100">
          <div className="w-full md:max-w-none">
            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={dateInputIsoValue(calendarDay)}
                  onChange={e => onDateInputChange(e.target.value)}
                  className={`date-input ${roundedInputChrome} w-full`}
                  aria-label="Select date"
                />
                <input
                  type="text"
                  placeholder="City (label only)"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onBlur={() => void reload()}
                  className={`city-input ${roundedInputChrome} w-full`}
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftDay(-1)}
                  style={{ width: '44px', height: '44px', opacity: 1 }}
                  className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Previous day"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={onTodayClick}
                  style={{
                    width: '110px',
                    height: '44px',
                    borderRadius: '24px',
                    borderWidth: '0.5px',
                    padding: '8px 32px',
                    opacity: 1,
                  }}
                  className="bg-primary text-[#F8F3DF] border-primary font-mukta hover:bg-primary/80 transition-colors flex items-center justify-center"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => shiftDay(1)}
                  style={{ width: '44px', height: '44px', opacity: 1 }}
                  className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Next day"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 flex-wrap">
              <input
                type="date"
                value={dateInputIsoValue(calendarDay)}
                onChange={e => onDateInputChange(e.target.value)}
                className={`${dateChromeMd} font-mukta`}
                aria-label="Select date"
              />
              <input
                type="text"
                placeholder="City (label only)"
                value={city}
                onChange={e => setCity(e.target.value)}
                onBlur={() => void reload()}
                style={{
                  width: '245px',
                  height: '44px',
                  borderRadius: '32px',
                  borderWidth: '1px',
                  padding: '8px 24px',
                  opacity: 1,
                }}
                className="city-input border border-primary font-mukta bg-secondary text-primary outline-none"
              />
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                style={{ width: '44px', height: '44px', opacity: 1 }}
                className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Previous day"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={onTodayClick}
                style={{
                  width: '105px',
                  height: '44px',
                  borderRadius: '24px',
                  borderWidth: '0.5px',
                  padding: '8px 32px',
                  opacity: 1,
                }}
                className="bg-primary text-[#F8F3DF] border-primary font-mukta hover:bg-primary/80 transition-colors flex items-center justify-center"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftDay(1)}
                style={{ width: '44px', height: '44px', opacity: 1 }}
                className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Next day"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-2 font-mukta text-[13px] leading-[18px] text-[#666]">
              Positions use VedAstro at {PANCHANG_DEFAULT_GEO.lat}°N, {PANCHANG_DEFAULT_GEO.lon}°E (
              {PANCHANG_DEFAULT_GEO.label}). City updates the place name only; coordinates stay
              fixed.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] leading-[32px] md:text-[36px] md:leading-[44px] font-bold font-sahitya text-primary mb-4 md:mb-6">
              Panchangam for {displayDdMmYy}
            </h2>

            {loading && (
              <p className="font-mukta text-[16px] text-[#555] mb-4">Loading panchanga…</p>
            )}
            {error && (
              <p className="font-mukta text-[16px] text-red-700 mb-4" role="alert">
                {error}
              </p>
            )}

            <div className="mx-auto mb-5 md:hidden w-[220px] h-[220px] flex items-center justify-center overflow-hidden rounded-full">
              <Image
                src={PanchangCircleImage}
                alt="Panchang zodiac circle"
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="border border-Trinary rounded-lg w-full max-w-[900px] mt-5 md:mt-8">
              <div className="px-4 md:px-6 pt-2 pb-2">
                <h3 className="text-[18px] leading-[24px] md:text-[26px] md:leading-[34px] font-mukta font-medium text-primary">
                  {titleLine}
                </h3>
              </div>
              <div className="border-b border-Trinary"></div>
              <div className="px-4 md:px-6 py-4">
                <p className="text-[28px] leading-[34px] md:text-[40px] md:leading-[46px] font-bold font-mukta text-[#7b1c1c] mb-2 md:mb-3">
                  {longDateLabel}
                </p>
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium mb-2 md:mb-3">
                  {varaLabel}
                </p>
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium">
                  {pakshaLine}
                </p>
              </div>
            </div>

            <div className="w-full max-w-[900px] mt-3 md:mt-4 px-2 md:px-6 py-4">
              <div className="grid grid-cols-2 gap-2 md:gap-0">
                <div>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Nakshatra:
                    </span>{' '}
                    {nakshatra}
                  </p>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Yoga:
                    </span>{' '}
                    {yogaLbl}
                  </p>
                </div>
                <div>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Karana:
                    </span>{' '}
                    {karana}
                  </p>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Rashi (Moon):
                    </span>{' '}
                    {moonRashi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex mx-auto w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[432px] lg:h-[432px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Image
            src={PanchangCircleImage}
            alt="Panchang zodiac circle"
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </section>

      <PanchangTimingStrip timings={timings} />
      <p className="mt-3 max-w-[1454px] font-mukta text-[13px] leading-[19px] text-[#5c4a42]">
        {MOON_RISE_SET_SOURCE_NOTE}
      </p>
    </>
  );
};

export default PanchangTodaySection;
