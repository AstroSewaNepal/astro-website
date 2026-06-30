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
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
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
  const [city] = useState<string>(PANCHANG_DEFAULT_GEO.label);
  const cityRef = useRef(city);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
      <section className="w-full max-w-full box-border min-h-[580px] min-w-0 flex flex-col lg:flex-row items-start gap-8 md:gap-10 opacity-100">
        <div className="w-full min-w-0 min-h-[580px] flex flex-col gap-7 md:gap-10 opacity-100">

          {/* ── Unified nav bar ── */}
          <div className="w-full flex justify-start">
            <div
              className="flex items-center w-full max-w-[620px] px-2 py-1.5 sm:px-4 sm:py-2.5"
              style={{
                background: '#fbf6ef',
                borderRadius: '999px',
                border: '1px solid #e8dfc8',
                gap: '0',
                boxShadow: '0 2px 6px 0 rgba(97,21,8,0.06)',
              }}
            >
              {/* Previous Day */}
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                aria-label="Previous day"
                className="flex flex-col items-center justify-center text-primary hover:opacity-70 transition-opacity min-w-[32px] sm:min-w-[56px]"
                style={{ padding: '4px 8px', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline" style={{ fontSize: '11px', fontFamily: 'var(--font-mukta, sans-serif)', color: 'var(--color-primary, #7b1c1c)', lineHeight: 1.2 }}>
                  Previous Day
                </span>
              </button>

              {/* Divider */}
              <div className="hidden sm:block" style={{ width: '1px', height: '36px', background: '#e8dfc8', flexShrink: 0, margin: '0 12px' }} />

              {/* Calendar icon pill (tappable, opens date picker) */}
              <div className="relative">
                <button
                  id="panchang-date-btn"
                  type="button"
                  onClick={() => setIsDatePickerOpen(o => !o)}
                  aria-label="Select date"
                  className="flex items-center justify-center hover:opacity-80 transition-opacity w-9 h-9 sm:w-12 sm:h-12 ml-1 mr-2 sm:ml-2 sm:mr-3"
                  style={{
                    background: '#f5ede0',
                    border: '1px solid #e8dfc8',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    color: 'var(--color-primary, #7b1c1c)',
                    flexShrink: 0,
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

              {/* Date + location centre block — centered, do not expand */}
              <div
                className="flex flex-col items-start justify-center min-w-0"
                style={{ padding: '0 8px', margin: '0 auto' }}
              >
                {/* Bold date */}
                <span
                  className="text-base sm:text-xl font-extrabold whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-mukta, sans-serif)',
                    color: 'var(--color-primary, #7b1c1c)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {displayDdMmYy}
                </span>
                {/* Location row */}
                <span
                  className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm"
                  style={{
                    fontFamily: 'var(--font-mukta, sans-serif)',
                    color: 'var(--color-primary, #7b1c1c)',
                    opacity: 0.9,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  <PinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 opacity-70" />
                  {city}
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ml-0.5" />
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block" style={{ width: '1px', height: '36px', background: '#e8dfc8', flexShrink: 0, margin: '0 8px' }} />

              {/* Next Day */}
              <button
                type="button"
                onClick={() => shiftDay(1)}
                aria-label="Next day"
                className="flex flex-col items-center justify-center text-primary hover:opacity-70 transition-opacity min-w-[32px] sm:min-w-[56px]"
                style={{ padding: '4px 8px', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ArrowRight className="w-5 h-5" />
                <span className="hidden sm:inline" style={{ fontSize: '11px', fontFamily: 'var(--font-mukta, sans-serif)', color: 'var(--color-primary, #7b1c1c)', lineHeight: 1.2 }}>
                  Next Day
                </span>
              </button>

              {/* Divider */}
              <div className="hidden sm:block" style={{ width: '1px', height: '36px', background: '#e8dfc8', flexShrink: 0, margin: '0 8px' }} />

              {/* Today button */}
              <button
                type="button"
                onClick={onTodayClick}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity py-2 px-3 sm:py-3 sm:px-7 text-sm sm:text-base ml-1 sm:ml-3 mr-1"
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
                  flexShrink: 0,
                }}
              >
                Today
              </button>
            </div>
          </div>
          {/* ── End nav bar ── */}

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

            <div className="border border-Trinary rounded-lg w-full mt-5 md:mt-8">
              <div className="px-4 md:px-6 pt-2 pb-2">
                <h3 className="text-[18px] leading-[24px] md:text-[26px] md:leading-[34px] font-mukta font-medium text-primary">
                  {titleLine}
                </h3>
              </div>
              <div className="border-b border-Trinary"></div>
              <div className="px-4 md:px-6 py-4">
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-[#7b1c1c] font-medium mb-2 md:mb-3">
                  {longDateLabelNoWeekday}
                </p>
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium mb-2 md:mb-3">
                  {varaLabel}
                </p>
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium">
                  {pakshaLine}
                </p>
              </div>
            </div>

            <div className="w-full max-w-full mt-3 md:mt-4 px-2 md:px-6 py-4">
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
    </>
  );
};

export default PanchangTodaySection;