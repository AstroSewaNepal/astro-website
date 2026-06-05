'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
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

const getAdjacentNepaliMonth = (year: number, month: number, offset: number) => {
  const dateRef = new NepaliDate(year, month, 1);
  dateRef.setMonth(month + offset);
  return { year: dateRef.getYear(), month: dateRef.getMonth() };
};

const getCellDisplayDay = (cell: CalendarCell) => {
  const dateRef = new NepaliDate(cell.year, cell.month, cell.day);
  return dateRef.format('DD', 'np');
};

const NepaliCalendarPageContent: React.FC = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = NepaliDate.now();
    return { year: today.getYear(), month: today.getMonth() };
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
  const computePlacement = () => {
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
  };
  const lastDialogPosRef = useRef<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const today = useMemo(() => NepaliDate.now(), []);

  const { title, monthNp, yearNp, adRangeLabel, cells } = useMemo(() => {
    const firstDay = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
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
    const monthTitle = firstDay.format('MMMM YYYY', 'np');

    const monthStartAd = firstDay.toJsDate();
    const monthEndAd = new NepaliDate(visibleMonth.year, visibleMonth.month, totalDays).toJsDate();
    const adRangeLabel = `${monthStartAd.toLocaleString('en-US', { month: 'long' })} / ${monthEndAd.toLocaleString(
      'en-US',
      { month: 'long' },
    )} ${monthEndAd.getFullYear()}`;

    return {
      title: monthTitle,
      monthNp: firstDay.format('MMMM', 'np'),
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
  }, [selectedDate]);

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
    <div className="min-h-screen pt-2 pb-10 text-[#2a1f1a] relative">
      <div className="container mx-auto px-6 lg:px-0">
        <h1 className="break-words text-[24px] leading-[30px] md:text-[36px] md:leading-[44px] font-sahitya font-bold text-[#7b1c1c] mb-1 tracking-wide">
          Nepali Calendar
        </h1>

        <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[30px] font-medium font-mukta text-[#141414] mb-3 tracking-wide">
          Track Nepali dates, festivals, and auspicious timings
        </p>

        <hr className="border-t border-[#c0785a] mb-6" />

        <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
          About Nepali Calendar
        </h2>

        <p className="text-[16px] leading-6 md:text-[24px] md:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-8 text-justify">
          The Nepali calendar (Bikram Sambat) is widely used in Nepal for everyday dates, festivals,
          and religious planning. It helps you follow local months, important occasions, and
          traditional timings while staying aligned with astrological guidance.
        </p>

        <section ref={calendarRef} className="rounded-xl border border-[#c7c7c7] bg-white shadow-[0_10px_26px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="bg-[#d91515] text-white px-4 md:px-5 py-2.5 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="font-mukta font-bold text-[20px] md:text-[24px] leading-tight">
              वि.सं {yearNp}
            </p>
            <h3 className="font-sahitya font-bold text-[28px] md:text-[36px] leading-none tracking-wide text-center">
              {monthNp}
            </h3>
            <p className="font-mukta font-semibold text-[16px] md:text-[20px] leading-tight">
              {adRangeLabel}
            </p>
          </div>

          <div className="px-4 md:px-5 py-3 border-b border-[#e8d8d8] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="font-mukta text-[15px] md:text-[18px] text-[#6a1717] font-semibold">
              {title}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-lg bg-[#7b1c1c] text-white font-mukta shadow-sm hover:bg-[#691709] transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-3 py-1.5 rounded-lg border border-[#d29276] text-[#7b1c1c] bg-white font-mukta hover:bg-[#fef0e7] transition-colors"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-3 py-1.5 rounded-lg border border-[#d29276] text-[#7b1c1c] bg-white font-mukta hover:bg-[#fef0e7] transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 border-b border-[#c7c7c7]">
              {weekDays.map(weekDay => (
                <div
                  key={weekDay.en}
                  className="bg-[#123b8f] border-r border-[#9db5e6] last:border-r-0 text-white text-center py-2 md:py-2.5"
                >
                  <p className="font-mukta font-semibold text-[11px] md:text-[15px] leading-tight">
                    {weekDay.np}
                  </p>
                  <p className="font-mukta text-[10px] md:text-[13px] leading-tight opacity-95">
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
                  onClick={(e) => handleDateClick(date, e)}
                  className={`min-h-[88px] md:min-h-[120px] border-r border-b border-[#d9d9d9] last:border-r-0 p-1.5 md:p-2 flex flex-col justify-between text-left cursor-pointer transition-all ${!date.isToday ? 'hover:bg-[rgba(31,108,31,0.1)]' : ''} ${
                    date.isToday
                      ? 'bg-[#1f6c1f] border border-[#145a19] text-white shadow-[0_8px_24px_rgba(31,108,31,0.18)]'
                      : date.monthOffset === 0
                        ? 'bg-white'
                        : 'bg-[rgba(31,108,31,0.04)] text-[#7d7d7d]'
                  }`}>
                  <span
                    className={`font-mukta text-[32px] md:text-[46px] leading-none font-bold ${
                      date.isToday
                        ? 'text-white'
                        : date.monthOffset === 0 && date.weekDay === 6
                          ? 'text-[#d91515]'
                          : date.monthOffset === 0
                            ? 'text-[#101010]'
                            : 'text-[#7d7d7d] opacity-30'
                    }`}
                  >
                    {getCellDisplayDay(date)}
                  </span>
                  <span
                    className={`font-mukta text-[10px] md:text-[12px] ${date.isToday ? 'text-[#dfe9df]' : date.monthOffset === 0 ? 'text-[#444]' : 'text-[#7d7d7d] opacity-30'}`}
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
      {selectedDate && typeof document !== 'undefined' && createPortal(
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
            ref={(el) => { dialogRef.current = el; if (el) computePlacement(); }}
            className="bg-white rounded-lg shadow-2xl w-96 max-w-[90vw] p-5 relative border border-gray-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseDialog}
              className="absolute top-3 right-3 text-gray-700 bg-white rounded-full w-9 h-9 flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Two-column boxed layout: left date box, right details */}
            <div className="flex gap-6 items-start">
              <div className="w-24 flex-none border border-[#e6e6e6] rounded-md p-3 text-center bg-[#f5f5f4]">
                <div className="text-[12px] font-mukta text-[#666]">{selectedDate.adDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}</div>
                <div className="mt-2 text-4xl font-sahitya font-extrabold text-[#222] leading-none">{selectedDate.day}</div>
                <div className="mt-1 text-[12px] text-[#666]">{selectedDate.year}</div>
              </div>

              <div className="flex-1">
                <div className="mb-1">
                  <div className="text-[13px] md:text-[14px] text-[#666] font-medium">नेपाली मिति</div>
                  <div className="font-sahitya text-2xl md:text-3xl font-extrabold text-[#111] leading-tight mt-1">
                    {new NepaliDate(selectedDate.year, selectedDate.month, selectedDate.day).format('DD MMMM YYYY', 'np')}
                  </div>
                </div>

                <div className="text-base md:text-xl text-[#444] mt-2 font-medium">
                  {getWeekDayName(selectedDate.weekDay).np}, {selectedDate.adDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Panchang Details Section */}
                <div className="mt-4 pt-4 border-t border-[#e8d8d8]">
                  {panchangLoading && (
                    <div className="text-sm text-[#666] font-mukta animate-pulse">
                      Loading panchang data...
                    </div>
                  )}
                  
                  {panchangError && (
                    <div className="text-sm text-red-600 font-mukta">
                      {panchangError}
                    </div>
                  )}

                  {panchangData && !panchangLoading && (
                    <div className="space-y-2 text-sm font-mukta">
                      {/* Tithi (Lunar Day) */}
                      {panchangData.table.Tithi?.Name && (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#888] uppercase font-semibold">Tithi</span>
                          <span className="text-[14px] text-[#222] font-medium">{panchangData.table.Tithi.Name}</span>
                        </div>
                      )}

                      {/* Nakshatra (Star) */}
                      {panchangData.table.NakshatraName && (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#888] uppercase font-semibold">Nakshatra</span>
                          <span className="text-[14px] text-[#222] font-medium">{panchangData.table.NakshatraName}</span>
                        </div>
                      )}

                      {/* Yoga */}
                      {panchangData.table.Yoga?.Name && (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#888] uppercase font-semibold">Yoga</span>
                          <span className="text-[14px] text-[#222] font-medium">{panchangData.table.Yoga.Name}</span>
                        </div>
                      )}

                      {/* Karana */}
                      {panchangData.table.Karana?.Name && (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#888] uppercase font-semibold">Karana</span>
                          <span className="text-[14px] text-[#222] font-medium">{panchangData.table.Karana.Name}</span>
                        </div>
                      )}

                      {/* Rashi (Moon Sign) */}
                      {panchangData.moonSign && (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#888] uppercase font-semibold">Rashi (Moon)</span>
                          <span className="text-[14px] text-[#222] font-medium">{panchangData.moonSign}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NepaliCalendarPageContent;
