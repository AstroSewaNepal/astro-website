'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import { createPortal } from 'react-dom';
import NepaliDate from 'nepali-date-converter';
import { fetchPanchangData, type PanchangData } from '@/lib/api/panchang';
import QNASComponent from '@/components/common/qnas-component';

type CalendarCell = {
  key: string;
  year: number;
  month: number;
  day: number;
  monthOffset: -1 | 0 | 1;
  isToday: boolean;
  weekDay: number;
  adDate: Date;
};

const weekDays = [
  { np: 'आइतबार', en: 'Sunday' },
  { np: 'सोमबार', en: 'Monday' },
  { np: 'मंगलबार', en: 'Tuesday' },
  { np: 'बुधबार', en: 'Wednesday' },
  { np: 'बिहिबार', en: 'Thursday' },
  { np: 'शुक्रबार', en: 'Friday' },
  { np: 'शनिबार', en: 'Saturday' },
];

const nepaliMonthNames = [
  'बैशाख',
  'जेठ',
  'असार',
  'श्रावण',
  'भाद्र',
  'आश्विन',
  'कार्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फाल्गुण',
  'चैत',
];

const getMonthTotalDays = (year: number, monthIndex: number) => {
  let date = 1;
  while (true) {
    const monthDate = new NepaliDate(year, monthIndex, date);
    if (monthDate.getMonth() !== monthIndex) {
      return date - 1;
    }
    date += 1;
  }
};

const getCellDate = (year: number, month: number, monthOffset: -1 | 0 | 1, day: number) => {
  const dateRef = new NepaliDate(year, month, 1);
  if (monthOffset !== 0) dateRef.setMonth(month + monthOffset);
  dateRef.setDate(day);
  return dateRef;
};

const MIN_NEPALI_YEAR = 2000;
const MAX_NEPALI_YEAR = 2090;

const clampNepaliYear = (year: number) =>
  Math.min(MAX_NEPALI_YEAR, Math.max(MIN_NEPALI_YEAR, year));

const getCellDisplayDay = (cell: CalendarCell) => {
  const dateRef = new NepaliDate(cell.year, cell.month, cell.day);
  return dateRef.format('DD', 'np');
};

const nepaliYears = Array.from(
  { length: MAX_NEPALI_YEAR - MIN_NEPALI_YEAR + 1 },
  (_, i) => MIN_NEPALI_YEAR + i,
);

const NepaliCalendarPageContent: React.FC = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = NepaliDate.now();
    return { year: clampNepaliYear(today.getYear()), month: today.getMonth() };
  });

  const [selectedDate, setSelectedDate] = useState<CalendarCell | null>(null);
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [panchangLoading, setPanchangLoading] = useState(false);
  const [panchangError, setPanchangError] = useState<string | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [dialogVisible, setDialogVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const clickRectRef = useRef<DOMRect | null>(null);
  const clickTargetRef = useRef<HTMLElement | null>(null);
  const calendarRef = useRef<HTMLElement | null>(null);

  const computePlacement = useCallback(() => {
    if (!selectedDate || !dialogRef.current || !clickRectRef.current) return;

    const rect = clickRectRef.current as DOMRect;
    const dRect = dialogRef.current!.getBoundingClientRect();
    const margin = 12;

    let containerTop = 0;
    let containerLeft = 0;
    let containerRight = document.documentElement.clientWidth;
    let containerBottom = document.documentElement.clientHeight;
    if (calendarRef.current) {
      const c = calendarRef.current.getBoundingClientRect();
      containerTop = c.top + window.scrollY;
      containerLeft = c.left + window.scrollX;
      containerRight = containerLeft + c.width;
      containerBottom = containerTop + c.height;
    } else {
      containerTop = 0;
      containerLeft = 0;
      containerRight = document.documentElement.scrollWidth;
      containerBottom = document.documentElement.scrollHeight;
    }

    const isMobile = window.innerWidth <= 640;

    let top: number;
    if (!isMobile) {
      top = rect.top - dRect.height - margin;
      if (top < margin) top = rect.bottom + margin;
    } else {
      top = rect.bottom + margin;
      if (top + dRect.height + margin > window.innerHeight) {
        top = Math.max(margin, window.innerHeight - dRect.height - margin);
      }
    }

    let left = rect.left + (rect.width - dRect.width) / 2;
    const viewportMinLeft = margin;
    const viewportMaxLeft = window.innerWidth - dRect.width - margin;
    if (left < viewportMinLeft) left = viewportMinLeft;
    if (left > viewportMaxLeft) left = viewportMaxLeft;

    let docTop = top + window.scrollY;
    let docLeft = left + window.scrollX;

    const minLeft = containerLeft + margin;
    const maxLeft = Math.max(containerLeft + margin, containerRight - dRect.width - margin);
    if (docLeft < minLeft) docLeft = minLeft;
    if (docLeft > maxLeft) docLeft = maxLeft;

    const minTop = containerTop + margin;
    const maxTop = Math.max(containerTop + margin, containerBottom - dRect.height - margin);
    if (docTop < minTop) docTop = Math.max(minTop, rect.bottom + window.scrollY + margin);
    if (docTop > maxTop) docTop = maxTop;

    const prev = lastDialogPosRef.current;
    const changed = !prev || Math.abs(prev.top - docTop) > 1 || Math.abs(prev.left - docLeft) > 1;
    if (changed) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setDialogPosition({ top: docTop, left: docLeft });
        lastDialogPosRef.current = { top: docTop, left: docLeft };
        setDialogVisible(true);
        rafRef.current = null;
      });
    }
  }, [selectedDate]);

  const lastDialogPosRef = useRef<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const today = useMemo(() => NepaliDate.now(), []);

  const { adRangeLabel, cells } = useMemo(() => {
    const safeYear = clampNepaliYear(visibleMonth.year);
    const firstDay = new NepaliDate(safeYear, visibleMonth.month, 1);
    const firstWeekDay = firstDay.getDay();
    const totalDays = getMonthTotalDays(visibleMonth.year, visibleMonth.month);

    const prevMonthRef = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
    prevMonthRef.setMonth(visibleMonth.month - 1);
    const prevMonthTotalDays = getMonthTotalDays(prevMonthRef.getYear(), prevMonthRef.getMonth());

    const prevCells: CalendarCell[] = Array.from({ length: firstWeekDay }, (_, idx) => {
      const day = prevMonthTotalDays - firstWeekDay + idx + 1;
      const dateRef = getCellDate(visibleMonth.year, visibleMonth.month, -1, day);
      return {
        key: `${dateRef.getYear()}-${dateRef.getMonth()}-${dateRef.getDate()}`,
        year: dateRef.getYear(),
        month: dateRef.getMonth(),
        day: dateRef.getDate(),
        monthOffset: -1,
        isToday: false,
        weekDay: dateRef.getDay(),
        adDate: dateRef.toJsDate(),
      };
    });

    const currentCells: CalendarCell[] = Array.from({ length: totalDays }, (_, idx) => {
      const day = idx + 1;
      const dateRef = new NepaliDate(visibleMonth.year, visibleMonth.month, day);
      const isToday =
        today.getYear() === visibleMonth.year &&
        today.getMonth() === visibleMonth.month &&
        today.getDate() === day;

      return {
        key: `${dateRef.getYear()}-${dateRef.getMonth()}-${dateRef.getDate()}`,
        year: dateRef.getYear(),
        month: dateRef.getMonth(),
        day: dateRef.getDate(),
        monthOffset: 0,
        isToday,
        weekDay: dateRef.getDay(),
        adDate: dateRef.toJsDate(),
      };
    });

    const usedCells = prevCells.length + currentCells.length;
    const tailCount = usedCells % 7 === 0 ? 0 : 7 - (usedCells % 7);
    const nextCells: CalendarCell[] = Array.from({ length: tailCount }, (_, idx) => {
      const day = idx + 1;
      const dateRef = getCellDate(visibleMonth.year, visibleMonth.month, 1, day);
      return {
        key: `${dateRef.getYear()}-${dateRef.getMonth()}-${dateRef.getDate()}`,
        year: dateRef.getYear(),
        month: dateRef.getMonth(),
        day: dateRef.getDate(),
        monthOffset: 1,
        isToday: false,
        weekDay: dateRef.getDay(),
        adDate: dateRef.toJsDate(),
      };
    });

    const cells = [...prevCells, ...currentCells, ...nextCells];

    // Build AD range label: e.g. "Jun / Jul 2026"
    const monthStartAd = firstDay.toJsDate();
    const monthEndAd = new NepaliDate(visibleMonth.year, visibleMonth.month, totalDays).toJsDate();
    const startMonthStr = monthStartAd.toLocaleString('en-US', { month: 'short' });
    const endMonthStr = monthEndAd.toLocaleString('en-US', { month: 'short' });
    const endYear = monthEndAd.getFullYear();
    const adRangeLabel =
      startMonthStr === endMonthStr
        ? `${startMonthStr} ${endYear}`
        : `${startMonthStr} / ${endMonthStr} ${endYear}`;

    return { adRangeLabel, cells };
  }, [today, visibleMonth.month, visibleMonth.year]);

  const handlePrevYear = () => {
    setVisibleMonth(prev => ({ year: clampNepaliYear(prev.year - 1), month: prev.month }));
  };

  const handleNextYear = () => {
    setVisibleMonth(prev => ({ year: clampNepaliYear(prev.year + 1), month: prev.month }));
  };

  const handleGoToToday = () => {
    const currentToday = NepaliDate.now();
    setVisibleMonth({ year: currentToday.getYear(), month: currentToday.getMonth() });
  };

  const handleDateClick = (cell: CalendarCell, event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget as HTMLElement;

    if (selectedDate && selectedDate.key === cell.key) {
      return;
    }

    const rect = el.getBoundingClientRect();
    clickTargetRef.current = el;
    clickRectRef.current = rect;
    setDialogVisible(false);
    setDialogPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedDate(cell);
  };

  useEffect(() => {
    if (!selectedDate) return;
    computePlacement();
    window.addEventListener('resize', computePlacement);
    return () => {
      window.removeEventListener('resize', computePlacement);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastDialogPosRef.current = null;
    };
  }, [selectedDate, computePlacement]);

  useEffect(() => {
    if (!selectedDate) {
      setPanchangData(null);
      setPanchangError(null);
      return;
    }

    const loadPanchangData = async () => {
      setPanchangLoading(true);
      setPanchangError(null);
      try {
        const data = await fetchPanchangData(selectedDate.adDate);
        setPanchangData(data);
        if (!data) {
          setPanchangError('Unable to fetch panchang data');
        }
      } catch (err) {
        setPanchangError('Error loading panchang data');
        console.error(err);
      } finally {
        setPanchangLoading(false);
      }
    };

    loadPanchangData();
  }, [selectedDate]);

  const handleCloseDialog = () => {
    setDialogVisible(false);
    setSelectedDate(null);
    setPanchangData(null);
    clickTargetRef.current = null;
    clickRectRef.current = null;
  };

  const getWeekDayName = (weekDay: number) => {
    return weekDays[weekDay] || { np: 'Unknown', en: 'Unknown' };
  };

  return (
    <div className="min-h-screen pt-2 sm:pt-4 md:pt-6 pb-8 sm:pb-10 md:pb-12 text-[#2a1f1a] relative">
      <div className="w-full">
        <h1 className="break-words text-[22px] sm:text-[28px] md:text-[36px] lg:text-[42px] leading-[28px] sm:leading-[36px] md:leading-[44px] lg:leading-[52px] font-sahitya font-bold text-[#7b1c1c] mb-2 sm:mb-2 md:mb-3 lg:mb-4 tracking-wide">
          Nepali Calendar 2083 BS: Bikram Sambat Dates and Festivals
        </h1>

        <p className="text-[14px] sm:text-[18px] md:text-[24px] lg:text-[26px] leading-[20px] sm:leading-[26px] md:leading-[30px] lg:leading-[36px] font-medium font-mukta text-[#141414] mb-3 sm:mb-4 md:mb-5 lg:mb-6 tracking-wide">
          Browse Bikram Sambat dates alongside Gregorian equivalents, track Nepali festivals, and find auspicious timings aligned with the Vedic calendar.
        </p>

        <hr className="border-t border-[#c0785a] mb-4 sm:mb-5 md:mb-6 lg:mb-8" />

        <h2 className="text-[18px] sm:text-[24px] md:text-[28px] lg:text-[32px] leading-[26px] sm:leading-[32px] md:leading-[38px] lg:leading-[44px] font-bold font-sahitya text-[#7b1c1c] mb-2 sm:mb-3 md:mb-4 lg:mb-5 tracking-wide">
          About the Nepali Calendar
        </h2>

        <p className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] leading-[20px] sm:leading-[24px] md:leading-[28px] lg:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-6 sm:mb-7 md:mb-8 lg:mb-10 text-justify">
          The Nepali calendar uses the Bikram Sambat (BS) system, a lunisolar calendar that runs
          approximately 56 years and 8 months ahead of the Gregorian calendar. It is Nepal&apos;s
          official civil calendar and is used for government, religion, and everyday life. Each BS
          month begins when the Sun enters a new zodiac sign, which is called Sankranti. The month
          names correspond to the Nakshatra where the full moon typically falls during that period.
          AstroSewa shows BS and Gregorian dates side by side so you can track festivals, convert
          dates, and find auspicious timings without manual conversion.
        </p>

        {/* BS Months Guide moved below calendar for better visibility */}

        <section
          ref={calendarRef}
          className="rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#ead9cf] bg-white shadow-[0_10px_24px_rgba(97,21,8,0.1)] sm:shadow-[0_14px_32px_rgba(97,21,8,0.12)] md:shadow-[0_18px_40px_rgba(97,21,8,0.12)] overflow-hidden"
        >
          {/* ── Calendar Header ── */}
          <div className="bg-[linear-gradient(135deg,#611508_0%,#7a2516_45%,#b04832_100%)] px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">

              {/* Left: AD date range */}
              <div className="flex items-center justify-start">
                <p className="font-mukta text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-[#fff5ee] opacity-90 whitespace-nowrap">
                  {adRangeLabel}
                </p>
              </div>

              {/* Center: < Year▼ Month▼ > */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">

                {/* < Prev Year */}
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Previous year"
                >
                  <ArrowLeft className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>

                {/* Year dropdown */}
                <div className="relative">
                  <select
                    value={visibleMonth.year}
                    onChange={e =>
                      setVisibleMonth(prev => ({ ...prev, year: Number(e.target.value) }))
                    }
                    className="appearance-none bg-white/15 border border-white/30 text-white rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-7 py-1 sm:py-1.5 font-mukta text-[13px] sm:text-[16px] md:text-[19px] font-semibold cursor-pointer hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                    style={{ colorScheme: 'dark' }}
                  >
                    {nepaliYears.map(yr => {
                      const npYr = new NepaliDate(yr, 0, 1).format('YYYY', 'np');
                      return (
                        <option key={yr} value={yr} className="bg-[#7a2516] text-white">
                          {npYr}
                        </option>
                      );
                    })}
                  </select>
                  <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/80" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {/* Month dropdown */}
                <div className="relative">
                  <select
                    value={visibleMonth.month}
                    onChange={e =>
                      setVisibleMonth(prev => ({ ...prev, month: Number(e.target.value) }))
                    }
                    className="appearance-none bg-white/15 border border-white/30 text-white rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-7 py-1 sm:py-1.5 font-sahitya text-[14px] sm:text-[18px] md:text-[22px] font-bold cursor-pointer hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                    style={{ colorScheme: 'dark' }}
                  >
                    {nepaliMonthNames.map((name, idx) => (
                      <option
                        key={idx}
                        value={idx}
                        className="bg-[#7a2516] text-white font-normal text-base"
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/80" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {/* > Next Year */}
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Next year"
                >
                  <ArrowRight className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>

              </div>

              {/* Right: Today button */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="inline-flex items-center justify-center rounded-full bg-[#f8f3df] px-2 sm:px-3 md:px-4 lg:px-5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 text-[10px] sm:text-[11px] md:text-[13px] lg:text-[15px] font-semibold text-[#611508] shadow-[0_2px_6px_rgba(97,21,8,0.1)] sm:shadow-[0_4px_10px_rgba(97,21,8,0.12)] md:shadow-[0_6px_14px_rgba(97,21,8,0.15)] lg:shadow-[0_8px_18px_rgba(97,21,8,0.18)] transition-colors hover:bg-white active:shadow-[0_1px_3px_rgba(97,21,8,0.15)] whitespace-nowrap"
                >
                  Today
                </button>
              </div>

            </div>
          </div>

          {/* ── Week Day Headers ── */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 border-b border-[#c7c7c7]">
              {weekDays.map(weekDay => (
                <div
                  key={weekDay.en}
                  className="bg-primary border-r border-[#d9c1b2] last:border-r-0 text-secondary text-center py-1.5 sm:py-2 md:py-2.5 lg:py-3 px-1 sm:px-2"
                >
                  <p className="font-mukta font-semibold text-[16px] sm:text-[20px] md:text-[26px] lg:text-[30px] leading-tight">
                    {weekDay.np}
                  </p>
                  <p className="font-mukta text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] leading-tight opacity-95">
                    {weekDay.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Calendar Grid ── */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7">
              {cells.map((date, idx) => (
                <div
                  key={`${date.key}-${idx}`}
                  onClick={e => handleDateClick(date, e)}
                  className={`min-h-[72px] sm:min-h-[88px] md:min-h-[110px] lg:min-h-[120px] border-r border-b border-[#efe1d7] last:border-r-0 p-1 sm:p-1.5 md:p-2 lg:p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${!date.isToday ? 'hover:bg-[#fff6ee]' : ''} ${
                    date.isToday
                      ? 'bg-primary border border-[#611508] text-secondary shadow-[0_6px_14px_rgba(97,21,8,0.12)] sm:shadow-[0_8px_18px_rgba(97,21,8,0.15)] md:shadow-[0_10px_24px_rgba(97,21,8,0.18)]'
                      : date.monthOffset === 0
                        ? 'bg-white'
                        : 'bg-[rgba(31,108,31,0.04)] text-[#7d7d7d]'
                  }`}
                >
                  <span
                    className={`font-mukta text-[24px] sm:text-[32px] md:text-[40px] lg:text-[46px] leading-none font-bold ${
                      date.isToday
                        ? 'text-white'
                        : date.monthOffset === 0 && date.weekDay === 6
                          ? 'text-[#611508]'
                          : date.monthOffset === 0
                            ? 'text-[#101010]'
                            : 'text-[#7d7d7d] opacity-30'
                    }`}
                  >
                    {getCellDisplayDay(date)}
                  </span>
                  <span
                    className={`font-mukta text-[8px] sm:text-[9px] md:text-[11px] lg:text-[12px] leading-tight ${date.isToday ? 'text-[#dfe9df]' : date.monthOffset === 0 ? 'text-[#444]' : 'text-[#7d7d7d] opacity-30'}`}
                  >
                    {date.adDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 mb-6">
          <h2 className="text-[26px] sm:text-[30px] md:text-[36px] lg:text-[40px] font-extrabold font-sahitya text-[#7b1c1c] mb-3">
            BS Months Guide
          </h2>

          <h3 className="text-[18px] sm:text-[22px] md:text-[24px] font-semibold font-sahitya text-[#7b1c1c] mb-3">
            The 12 Months of Bikram Sambat
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Baishakh (April to May):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">New Year month. A time of new beginnings across Nepal.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Jestha (May to June):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">The start of the monsoon approach.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Ashadh (June to July):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Pre-monsoon rains begin.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Shrawan (July to August):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Full monsoon season. This is the month of Shrawan Somvar fasting for Lord Shiva.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Bhadra (August to September):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Gai Jatra and Teej festivals fall in this month.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Ashwin (September to October):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Autumn begins. Dashain, Nepal&apos;s biggest festival, falls in Ashwin.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Kartik (October to November):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Tihar falls in Kartik.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Mangsir (November to December):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Winter sets in.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Poush (December to January):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Poush Purnima falls here.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Magh (January to February):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Maghe Sankranti, a major Nepali festival.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Falgun (February to March):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">Holi is celebrated in Falgun.</p>
            </div>
            <div>
              <p className="font-mukta text-base md:text-lg lg:text-xl text-[#7b1c1c] font-semibold">Chaitra (March to April):</p>
              <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-1">End of the year. Ram Navami falls in Chaitra.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-0 border-b border-b-[#79787A] pb-[60px] pt-8 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
            <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
              Frequently Asked Questions
            </h2>
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
              Find quick answers to common questions about the Nepali calendar, BS-to-Gregorian conversions, and festival dates.
            </p>
          </div>

          <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
            <QNASComponent
              question="How Do I Convert BS Dates to Gregorian?"
              answer={`The Bikram Sambat year runs approximately 56 years and 8 months ahead of the Gregorian year. So 2083 BS corresponds roughly to 2026 to 2027 AD. However, because the two calendars use different systems for counting months and days, the conversion is not a simple subtraction. The AstroSewa Nepali Calendar shows both dates side by side automatically, so you do not need to convert manually.`}
              isDefaultOpen={true}
            />

            <QNASComponent
              question="When Does the Nepali New Year Start?"
              answer={`The Nepali New Year begins on the first day of Baishakh in the Bikram Sambat calendar. This usually falls in mid-April in the Gregorian calendar. The exact date changes slightly each year. New Year is one of the major celebrations in Nepal and marks the beginning of the first month of the BS year.`}
            />

            <QNASComponent
              question="Is the Nepali Calendar the Same as the Hindu Calendar?"
              answer={`The Bikram Sambat is a Hindu calendar system but it is specifically the official civil calendar of Nepal. India uses several regional Hindu calendar systems, and while they share some similarities with BS, they are not identical. The BS calendar is distinct in its month start dates, which are based on the Sun's entry into each zodiac sign (Sankranti), and in some of its festival dates.`}
            />
          </div>
        </section>

      </div>

      {/* ── Date Info Card Dialog ── */}
      {selectedDate &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              top: `${dialogPosition.top}px`,
              left: `${dialogPosition.left}px`,
              visibility: dialogVisible ? 'visible' : 'hidden',
            }}
            onClick={handleCloseDialog}
          >
            <div
              ref={el => {
                dialogRef.current = el;
                if (el) computePlacement();
              }}
              className="bg-[#f8f3df] rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl w-[300px] sm:w-[340px] md:w-[380px] h-auto max-w-[85vw] sm:max-w-[90vw] max-h-[75vh] sm:max-h-[80vh] p-3 sm:p-4 md:p-5 relative border border-[#ead9cf] pointer-events-auto overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseDialog}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[#611508] bg-transparent rounded-full w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
              >
                <svg
                  className="w-3.5 sm:w-4 h-3.5 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center flex flex-col justify-start items-center gap-2 sm:gap-3 md:gap-3.5 w-full">
                <div className="font-sahitya text-[24px] sm:text-[28px] md:text-[36px] lg:text-[40px] font-extrabold text-[#611508] leading-snug">
                  {new NepaliDate(selectedDate.year, selectedDate.month, selectedDate.day).format(
                    'DD MMMM YYYY',
                    'np',
                  )}
                </div>
                <div className="text-[12px] sm:text-[13px] md:text-[15px] lg:text-[16px] text-[#7b1c1c] font-semibold leading-tight sm:leading-snug flex items-center justify-center gap-2 flex-wrap">
                  <div className="font-sahitya">{getWeekDayName(selectedDate.weekDay).np}</div>
                  <span className="text-[#999]">•</span>
                  <div className="text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px]">
                    {selectedDate.adDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="my-1.5 sm:my-2 md:my-2.5 h-px w-4/5 bg-[#e8d4c8]" />

                <div className="text-[11px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-[#222] w-full px-1 sm:px-2 font-mukta">
                  {panchangLoading && (
                    <span className="text-[#666] opacity-75 animate-pulse text-center block">
                      Loading...
                    </span>
                  )}
                  {panchangError && (
                    <span className="text-red-600 text-center text-[10px] sm:text-xs block">
                      {panchangError}
                    </span>
                  )}

                  {panchangData && !panchangLoading && (
                    <div className="text-center text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-relaxed sm:leading-loose flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                      {panchangData.table.Tithi?.Name && (
                        <span>
                          <span className="font-semibold text-[#611508]">Tithi:</span>{' '}
                          {panchangData.table.Tithi.Name}
                        </span>
                      )}
                      {panchangData.table.Tithi?.Name &&
                        (panchangData.table.Yoga?.Name || panchangData.moonSign) && (
                          <span className="text-[#999]">|</span>
                        )}
                      {panchangData.table.Yoga?.Name && (
                        <span>
                          <span className="font-semibold text-[#611508]">Yoga:</span>{' '}
                          {panchangData.table.Yoga.Name}
                        </span>
                      )}
                      {panchangData.table.Yoga?.Name && panchangData.moonSign && (
                        <span className="text-[#999]">|</span>
                      )}
                      {panchangData.moonSign && (
                        <span>
                          <span className="font-semibold text-[#611508]">Rashi:</span>{' '}
                          {panchangData.moonSign}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default NepaliCalendarPageContent;