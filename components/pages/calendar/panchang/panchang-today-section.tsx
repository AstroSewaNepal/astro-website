'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { resolveVedastroProxyFetchUrl } from '@/lib/utils/url';
import PanchangCircleImage from '@/components/images/panchang_circle.png';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import DatePickerDropdown from '@/components/pages/free-kundali/date-picker-dropdown';
import PanchangTimingStrip, { type PanchangTimingEntry } from './panchang-timing-strip';
import { moonRiseSetForPlace } from './panchang-moon-times';
import {
  PANCHANG_DEFAULT_GEO,
  buildPanchangaTitleLine,
  extractPanchangaResult,
  formatBriefFromStdTime,
  formatDdMmYyyy,
  formatEnglishLongDate,
  getCandidateBackendBases,
  nestedString,
  pakshaDisplay,
  utcOffsetHmFromLocalDate,
  yogaName,
} from './panchang-utils';

async function fetchPanchangaForDate(
  calendarDay: Date,
  cityLabel: string,
  lat: number,
  lon: number,
): Promise<{ table: Record<string, unknown>; moonSign: string }> {
  const attemptErrors: string[] = [];
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
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

function dateToPickerValue(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function pickerValueToDate(v: string): Date | null {
  const [dd, mm, yyyy] = v.split('-').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

/** Small calendar SVG icon used inside the nav bar */
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/** Pin / location SVG icon */
const PinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);

/** Chevron down icon */
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PanchangTodaySection: React.FC = () => {
  const [calendarDay, setCalendarDay] = useState(() => new Date());
  const [city, setCity] = useState<string>(PANCHANG_DEFAULT_GEO.label);
  const [geoLat, setGeoLat] = useState<number>(PANCHANG_DEFAULT_GEO.lat);
  const [geoLon, setGeoLon] = useState<number>(PANCHANG_DEFAULT_GEO.lon);
  const cityRef = useRef(city);
  const geoLatRef = useRef(geoLat);
  const geoLonRef = useRef(geoLon);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setGeoLat(latitude);
          setGeoLon(longitude);
          geoLatRef.current = latitude;
          geoLonRef.current = longitude;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'Accept-Language': 'en' } },
            );
            const data = (await response.json()) as Record<string, unknown>;
            const address = data.address as Record<string, unknown> | undefined;
            const cityName =
              (address?.city as string) ||
              (address?.town as string) ||
              (address?.village as string) ||
              (address?.county as string) ||
              'Your Location';
            setCity(cityName);
            cityRef.current = cityName;
          } catch {
            console.log('Could not reverse geocode, using default location name');
            setCity('Your Location');
          }
        },
        () => {
          console.log('Geolocation not available, using Kathmandu');
        },
      );
    }
  }, []);

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
      const data = await fetchPanchangaForDate(
        calendarDay,
        cityRef.current,
        geoLatRef.current,
        geoLonRef.current,
      );
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



  const onDatePickerSelect = (ddmmyyyy: string) => {
    const parsed = pickerValueToDate(ddmmyyyy);
    if (parsed) setCalendarDay(parsed);
  };

  const titleLine = panchanga ? buildPanchangaTitleLine(panchanga.table) : '—';
  const longDateLabel = formatEnglishLongDate(calendarDay);
  const longDateLabelNoWeekday = longDateLabel.includes(',')
    ? longDateLabel.replace(/^[^,]+,\s*/, '')
    : longDateLabel;
  const displayDdMmYy = formatDdMmYyyy(calendarDay);

  const tithiObj = (panchanga?.table?.Tithi ?? null) as Record<string, unknown> | null;
  const varaLabel = nestedString(panchanga?.table, 'Vara') || '—';
  const pakshaLine = pakshaDisplay(tithiObj ? nestedString(tithiObj, 'Paksha') : undefined);
  const nakshatra = nestedString(panchanga?.table, 'Nakshatra') || '—';
  const yogaLbl = yogaName(panchanga?.table?.Yoga);
  const karana = nestedString(panchanga?.table, 'Karana') || '—';
  const moonRashi = panchanga?.moonSign?.trim() || '—';

  const timings = buildTimings(panchanga?.table ?? null, calendarDay);

  return (
    <>
      <section className="w-full max-w-full box-border min-w-0 flex flex-col gap-7 md:gap-10 opacity-100">
        {/* ── Unified nav bar ── */}
        <div className="w-full flex justify-center lg:justify-start">
          <div
            className="flex flex-wrap sm:flex-nowrap items-center justify-center w-full max-w-[620px] px-2 py-1.5 sm:px-4 sm:py-2.5 gap-y-1"
            style={{
              background: '#fbf6ef',
              borderRadius: '20px',
              border: '1px solid #e8dfc8',
              boxShadow: '0 2px 6px 0 rgba(97,21,8,0.06)',
            }}
          >
            {/* Left group: Previous Day + calendar icon (equal-basis flank) */}
            <div className="flex items-center flex-1 min-w-0 justify-start">
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                aria-label="Previous day"
                className="flex flex-col items-center justify-center text-primary hover:opacity-70 transition-opacity flex-shrink-0"
                style={{
                  padding: '4px 6px',
                  gap: '2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span
                  className="hidden md:inline"
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mukta, sans-serif)',
                    color: 'var(--color-primary, #7b1c1c)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Previous Day
                </span>
              </button>

              <div
                className="hidden sm:block flex-shrink-0"
                style={{ width: '1px', height: '36px', background: '#e8dfc8', margin: '0 8px' }}
              />

              <div className="relative flex-shrink-0">
                <button
                  id="panchang-date-btn"
                  type="button"
                  onClick={() => setIsDatePickerOpen(o => !o)}
                  aria-label="Select date"
                  className="flex items-center justify-center hover:opacity-80 transition-opacity w-9 h-9 sm:w-11 sm:h-11"
                  style={{
                    background: '#f5ede0',
                    border: '1px solid #e8dfc8',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    color: 'var(--color-primary, #7b1c1c)',
                  }}
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
                <DatePickerDropdown
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                  onDateSelect={onDatePickerSelect}
                  value={dateToPickerValue(calendarDay)}
                  anchorId="panchang-date-btn"
                />
              </div>
            </div>

            {/* Center block — date + location, truly centered because both flanks are flex-1 */}
            <div className="flex flex-col items-center justify-center min-w-0 flex-shrink-0 px-2 order-first basis-full sm:order-none sm:basis-auto">
              <span
                className="text-base sm:text-lg md:text-xl font-extrabold whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-mukta, sans-serif)',
                  color: 'var(--color-primary, #7b1c1c)',
                  letterSpacing: '0.01em',
                }}
              >
                {displayDdMmYy}
              </span>
              <span
                className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm max-w-full"
                style={{
                  fontFamily: 'var(--font-mukta, sans-serif)',
                  color: 'var(--color-primary, #7b1c1c)',
                  opacity: 0.9,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <PinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 opacity-70" />
                <span className="truncate max-w-[110px] sm:max-w-[160px]">{city}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ml-0.5" />
              </span>
            </div>

            {/* Right group: Next Day + Today (equal-basis flank) */}
            <div className="flex items-center flex-1 min-w-0 justify-end">
              <div
                className="hidden sm:block flex-shrink-0"
                style={{ width: '1px', height: '36px', background: '#e8dfc8', margin: '0 8px' }}
              />

              <button
                type="button"
                onClick={() => shiftDay(1)}
                aria-label="Next day"
                className="flex flex-col items-center justify-center text-primary hover:opacity-70 transition-opacity flex-shrink-0"
                style={{
                  padding: '4px 6px',
                  gap: '2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowRight className="w-5 h-5" />
                <span
                  className="hidden md:inline"
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mukta, sans-serif)',
                    color: 'var(--color-primary, #7b1c1c)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Next Day
                </span>
              </button>

              <div
                className="hidden sm:block flex-shrink-0"
                style={{ width: '1px', height: '36px', background: '#e8dfc8', margin: '0 8px' }}
              />

              <button
                type="button"
                onClick={onTodayClick}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity py-2 px-3 sm:py-2.5 sm:px-5 text-xs sm:text-sm md:text-base flex-shrink-0"
                style={{
                  background: '#7b1c1c',
                  color: '#F8F3DF',
                  border: 'none',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-mukta, sans-serif)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 18px rgba(97,21,8,0.12)',
                }}
              >
                Today
              </button>
            </div>

          </div>
        </div>
        {/* ── End nav bar ── */}

        <div>
          <h2 className="text-[22px] leading-[30px] sm:text-[24px] sm:leading-[32px] md:text-[36px] md:leading-[44px] font-bold font-sahitya text-primary mb-5 sm:mb-6 md:mb-8">
            Panchangam for {displayDdMmYy}
          </h2>

          {loading && <p className="font-mukta text-[16px] text-[#555] mb-4">Loading panchanga…</p>}
          {error && (
            <p className="font-mukta text-[16px] text-red-700 mb-4" role="alert">
              {error}
            </p>
          )}

          {/* Three-column row: info box | panchang details | zodiac wheel */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-4 lg:gap-6 xl:gap-8 w-full">
            {/* Left — date details box (slightly wider rectangle) */}
            <div className="border border-Trinary rounded-lg w-full lg:w-[360px] xl:w-[400px] 2xl:w-[440px] lg:flex-shrink-0">
              <div className="px-4 md:px-5 pt-3 pb-2">
                <h3 className="text-[18px] leading-[24px] md:text-[22px] md:leading-[30px] font-mukta font-medium text-primary">
                  {titleLine}
                </h3>
              </div>
              <div className="border-b border-Trinary" />
              <div className="px-4 md:px-5 py-4">
                <p className="text-[18px] leading-[26px] sm:text-[20px] sm:leading-[28px] md:text-[26px] md:leading-[34px] text-[#7b1c1c] font-medium mb-2 md:mb-3">
                  {longDateLabelNoWeekday}
                </p>
                <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[26px] md:text-[24px] md:leading-[32px] text-[#7b1c1c] font-medium mb-2 md:mb-3">
                  {varaLabel}
                </p>
                <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[26px] md:text-[24px] md:leading-[32px] text-[#7b1c1c] font-medium">
                  {pakshaLine}
                </p>
              </div>
            </div>

            {/* Center — Nakshatra / Yoga / Karana / Rashi grid, shifted right to close the gap */}
            <div className="flex-1 flex items-start justify-start px-1 sm:px-2 md:px-4 lg:pl-8 xl:pl-14 2xl:pl-20 pt-1 lg:pt-3 min-w-0">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4 md:gap-x-10 md:gap-y-6 w-full max-w-[480px]">
                <p className="font-mukta text-[15px] leading-[22px] sm:text-[16px] sm:leading-[24px] md:text-[22px] md:leading-[32px]">
                  <span className="font-semibold text-Trinary">Nakshatra:</span>{' '}
                  <span className="text-primary">{nakshatra}</span>
                </p>
                <p className="font-mukta text-[15px] leading-[22px] sm:text-[16px] sm:leading-[24px] md:text-[22px] md:leading-[32px]">
                  <span className="font-semibold text-Trinary">Karana:</span>{' '}
                  <span className="text-primary">{karana}</span>
                </p>
                <p className="font-mukta text-[15px] leading-[22px] sm:text-[16px] sm:leading-[24px] md:text-[22px] md:leading-[32px]">
                  <span className="font-semibold text-Trinary">Yoga:</span>{' '}
                  <span className="text-primary">{yogaLbl}</span>
                </p>
                <p className="font-mukta text-[15px] leading-[22px] sm:text-[16px] sm:leading-[24px] md:text-[22px] md:leading-[32px]">
                  <span className="font-semibold text-Trinary">Rashi (Moon):</span>{' '}
                  <span className="text-primary">{moonRashi}</span>
                </p>
              </div>
            </div>

            {/* Right — zodiac wheel */}
            <div className="flex flex-shrink-0 self-center lg:self-start items-start justify-center lg:justify-end mx-auto lg:mx-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[340px] 2xl:w-[400px] aspect-square lg:-mt-10 xl:-mt-14">
              <Image
                src={PanchangCircleImage}
                alt="Panchang zodiac circle"
                className="h-full w-full object-contain object-top lg:-translate-y-12 xl:-translate-y-16"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <PanchangTimingStrip timings={timings} />
    </>
  );
};

export default PanchangTodaySection;
