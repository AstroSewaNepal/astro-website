'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import { createPortal } from 'react-dom';
import NepaliDate from 'nepali-date-converter';
import { fetchPanchangData, type PanchangData } from '@/lib/api/panchang';

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

const getAdjacentNepaliMonth = (year: number, month: number, offset: number) => {
  const dateRef = new NepaliDate(year, month, 1);
  dateRef.setMonth(month + offset);
  return { year: clampNepaliYear(dateRef.getYear()), month: dateRef.getMonth() };
};

const getCellDisplayDay = (cell: CalendarCell) => {
  const dateRef = new NepaliDate(cell.year, cell.month, cell.day);
  return dateRef.format('DD', 'np');
};

const NepaliCalendarPageContent: React.FC = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = NepaliDate.now();
    return { year: clampNepaliYear(today.getYear()), month: today.getMonth() };
  });

  const [selectedDate, setSelectedDate] = useState<CalendarCell | null>(null);
  const [calendarMode] = useState<'BS' | 'AD'>('BS');
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

    // compute calendar container bounds in document coordinates (if available)
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
      // document bounds
      containerTop = 0;
      containerLeft = 0;
      containerRight = document.documentElement.scrollWidth;
      containerBottom = document.documentElement.scrollHeight;
    }

    // Mobile: center horizontally and place below if possible
    const isMobile = window.innerWidth <= 640;

    let top: number;
    if (!isMobile) {
      // Try above
      top = rect.top - dRect.height - margin;
      if (top < margin) top = rect.bottom + margin;
    } else {
      // On mobile, prefer placing below the cell; if no space, place at margin
      top = rect.bottom + margin;
      if (top + dRect.height + margin > window.innerHeight) {
        top = Math.max(margin, window.innerHeight - dRect.height - margin);
      }
    }

    // Horizontal centering (viewport bounds)
    let left = rect.left + (rect.width - dRect.width) / 2;
    const viewportMinLeft = margin;
    const viewportMaxLeft = window.innerWidth - dRect.width - margin;
    if (left < viewportMinLeft) left = viewportMinLeft;
    if (left > viewportMaxLeft) left = viewportMaxLeft;

    // convert viewport coords to document coords so portal element scrolls with page
    let docTop = top + window.scrollY;
    let docLeft = left + window.scrollX;

    // Clamp within calendar container bounds (document coords)
    const minLeft = containerLeft + margin;
    const maxLeft = Math.max(containerLeft + margin, containerRight - dRect.width - margin);
    if (docLeft < minLeft) docLeft = minLeft;
    if (docLeft > maxLeft) docLeft = maxLeft;

    const minTop = containerTop + margin;
    const maxTop = Math.max(containerTop + margin, containerBottom - dRect.height - margin);
    if (docTop < minTop) docTop = Math.max(minTop, rect.bottom + window.scrollY + margin);
    if (docTop > maxTop) docTop = maxTop;

    // Only update if position changed significantly to avoid jitter
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

  const { yearNp, adRangeLabel, cells } = useMemo(() => {
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

    const monthStartAd = firstDay.toJsDate();
    const monthEndAd = new NepaliDate(visibleMonth.year, visibleMonth.month, totalDays).toJsDate();
    const adRangeLabel = `${monthStartAd.toLocaleString('en-US', { month: 'long' })} / ${monthEndAd.toLocaleString(
      'en-US',
      { month: 'long' },
    )} ${monthEndAd.getFullYear()}`;

    return {
      yearNp: firstDay.format('YYYY', 'np'),
      adRangeLabel,
      cells,
    };
  }, [today, visibleMonth.month, visibleMonth.year]);

  const handlePrevMonth = () => {
    setVisibleMonth(prev => getAdjacentNepaliMonth(prev.year, prev.month, -1));
  };

  const handleNextMonth = () => {
    setVisibleMonth(prev => getAdjacentNepaliMonth(prev.year, prev.month, 1));
  };

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

    // If clicking the same date that's already selected, ignore to avoid repositioning.
    if (selectedDate && selectedDate.key === cell.key) {
      return;
    }

    const rect = el.getBoundingClientRect();
    clickTargetRef.current = el;
    clickRectRef.current = rect;
    // hide dialog until placement computed to avoid flicker
    setDialogVisible(false);
    // set initial position using document coordinates so popup scrolls with page
    setDialogPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedDate(cell);
  };

  // Recompute dialog placement when opened or on resize/scroll
  useEffect(() => {
    if (!selectedDate) return;
    // initial compute (if dialog already mounted)
    computePlacement();

    // recompute only on window resize
    window.addEventListener('resize', computePlacement);
    return () => {
      window.removeEventListener('resize', computePlacement);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastDialogPosRef.current = null;
    };
  }, [selectedDate, computePlacement]);

  // Fetch panchang data when a date is selected
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
      <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <h1 className="break-words text-[22px] sm:text-[28px] md:text-[36px] lg:text-[42px] leading-[28px] sm:leading-[36px] md:leading-[44px] lg:leading-[52px] font-sahitya font-bold text-[#7b1c1c] mb-2 sm:mb-2 md:mb-3 lg:mb-4 tracking-wide">
          Nepali Calendar
        </h1>

        <p className="text-[14px] sm:text-[18px] md:text-[24px] lg:text-[26px] leading-[20px] sm:leading-[26px] md:leading-[30px] lg:leading-[36px] font-medium font-mukta text-[#141414] mb-3 sm:mb-4 md:mb-5 lg:mb-6 tracking-wide">
          Track Nepali dates, festivals, and auspicious timings
        </p>

        <hr className="border-t border-[#c0785a] mb-4 sm:mb-5 md:mb-6 lg:mb-8" />

        <h2 className="text-[18px] sm:text-[24px] md:text-[28px] lg:text-[32px] leading-[26px] sm:leading-[32px] md:leading-[38px] lg:leading-[44px] font-bold font-sahitya text-[#7b1c1c] mb-2 sm:mb-3 md:mb-4 lg:mb-5 tracking-wide">
          About Nepali Calendar
        </h2>

        <p className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] leading-[20px] sm:leading-[24px] md:leading-[28px] lg:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-6 sm:mb-7 md:mb-8 lg:mb-10 text-justify">
          The Nepali calendar (Bikram Sambat) is widely used in Nepal for everyday dates, festivals,
          and religious planning. It helps you follow local months, important occasions, and
          traditional timings while staying aligned with astrological guidance.
        </p>

        <section
          ref={calendarRef}
          className="rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#ead9cf] bg-white shadow-[0_10px_24px_rgba(97,21,8,0.1)] sm:shadow-[0_14px_32px_rgba(97,21,8,0.12)] md:shadow-[0_18px_40px_rgba(97,21,8,0.12)] overflow-hidden"
        >
          <div className="bg-[linear-gradient(135deg,#611508_0%,#7a2516_45%,#b04832_100%)] text-secondary px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
            {/* One-line Header Layout */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-1 sm:gap-2 md:gap-3 lg:gap-4 items-center">
              {/* Left: Year Display */}
              <div className="flex justify-start">
                <p className="font-mukta text-[12px] sm:text-[16px] md:text-[20px] lg:text-[26px] font-semibold text-[#fff5ee] opacity-95 whitespace-nowrap">
                  {calendarMode === 'BS' ? `वि.सं ${yearNp}` : `AD ${new Date().getFullYear()}`}
                </p>
              </div>

              {/* Center: Month Navigation */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 text-center">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Previous month"
                >
                  <ArrowLeft className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>
                <div className="flex items-center justify-center">
                  <p className="font-sahitya text-[18px] sm:text-[22px] md:text-[32px] lg:text-[44px] font-bold leading-tight text-[#fffaf5]">
                    {calendarMode === 'BS' ? nepaliMonthNames[visibleMonth.month] : adRangeLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Next month"
                >
                  <ArrowRight className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>
              </div>

              {/* Right: Year Controls + Today */}
              <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="inline-flex items-center justify-center rounded-full bg-[#f8f3df] px-2 sm:px-3 md:px-4 lg:px-5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 text-[10px] sm:text-[11px] md:text-[13px] lg:text-[15px] font-semibold text-[#611508] shadow-[0_2px_6px_rgba(97,21,8,0.1)] sm:shadow-[0_4px_10px_rgba(97,21,8,0.12)] md:shadow-[0_6px_14px_rgba(97,21,8,0.15)] lg:shadow-[0_8px_18px_rgba(97,21,8,0.18)] transition-colors hover:bg-white active:shadow-[0_1px_3px_rgba(97,21,8,0.15)] whitespace-nowrap"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Previous year"
                >
                  <ArrowLeft className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="flex h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 active:bg-white/25"
                  aria-label="Next year"
                >
                  <ArrowRight className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5" />
                </button>
              </div>
            </div>
          </div>

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
      </div>

      {/* Date Info Card Dialog */}
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
