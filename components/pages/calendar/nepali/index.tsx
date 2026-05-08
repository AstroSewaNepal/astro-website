'use client';

import React, { useEffect, useMemo, useState } from 'react';
import NepaliDate from 'nepali-date-converter';
import {
  PANCHANG_DEFAULT_GEO,
  extractPanchangaResult,
  formatDdMmYyyy,
  getCandidateBackendBases,
  nestedString,
  utcOffsetHmFromLocalDate,
} from '../panchang/panchang-utils';

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

type SelectedPanchangaData = {
  tithi: string;
  festival: string;
  paksha: string;
};

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
  if (monthOffset !== 0) dateRef.setMonth(monthOffset);
  dateRef.setDate(day);
  return dateRef;
};

const tithiNames = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima / Aunsi',
];

const getTithiAndFestival = (cell: CalendarCell) => {
  const tithi = tithiNames[(cell.day - 1) % tithiNames.length];
  const weekdayFestivalMap: Record<number, string> = {
    0: 'Surya Aradhana',
    1: 'Shiv Puja',
    2: 'Hanuman Puja',
    3: 'Budha Smaran',
    4: 'Guru Puja',
    5: 'Laxmi Puja',
    6: 'Shani Aradhana',
  };

  return {
    tithi,
    festival: weekdayFestivalMap[cell.weekDay] ?? 'Auspicious Day',
  };
};

const getCellDisplayDay = (cell: CalendarCell) => {
  const dateRef = new NepaliDate(cell.year, cell.month, cell.day);
  return dateRef.format('DD', 'np');
};

const buildFestivalLabelFromTable = (table: Record<string, unknown>) => {
  const preferredKeys = ['Festival', 'Festivals', 'Vrat', 'Parva', 'Speciality'];
  for (const key of preferredKeys) {
    const value = nestedString(table, key);
    if (value.trim()) return value;
  }
  return '—';
};

async function fetchPanchangaForADDate(calendarDay: Date): Promise<SelectedPanchangaData> {
  const params = new URLSearchParams({
    lat: String(PANCHANG_DEFAULT_GEO.lat),
    lon: String(PANCHANG_DEFAULT_GEO.lon),
    date: formatDdMmYyyy(calendarDay),
    time: '12:00',
    offset: utcOffsetHmFromLocalDate(calendarDay),
    location: PANCHANG_DEFAULT_GEO.label,
  });

  const attemptErrors: string[] = [];

  for (const base of getCandidateBackendBases()) {
    const url = `${base}api/v1/vedastro/proxy/panchanga?${params.toString()}`;
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

      const tithiObj = parsed.table.Tithi as Record<string, unknown> | undefined;
      const tithiName = nestedString(tithiObj, 'Name') || nestedString(tithiObj, 'name') || '—';
      const paksha = nestedString(tithiObj, 'Paksha') || nestedString(tithiObj, 'paksha') || '—';

      return {
        tithi: tithiName,
        paksha,
        festival: buildFestivalLabelFromTable(parsed.table),
      };
    } catch (error) {
      attemptErrors.push(error instanceof Error ? error.message : 'Network error');
    }
  }

  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Failed to load panchanga.');
}

const NepaliCalendarPageContent: React.FC = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = NepaliDate.now();
    return { year: today.getYear(), month: today.getMonth() };
  });

  const today = useMemo(() => NepaliDate.now(), []);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { title, monthNp, yearNp, adRangeLabel, cells } = useMemo(() => {
    const firstDay = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
    const firstWeekDay = firstDay.getDay();
    const totalDays = getMonthTotalDays(visibleMonth.year, visibleMonth.month);

    const prevMonthRef = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
    prevMonthRef.setMonth(-1);
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
    const target = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
    target.setMonth(-1);
    setVisibleMonth({ year: target.getYear(), month: target.getMonth() });
  };

  const handleNextMonth = () => {
    const target = new NepaliDate(visibleMonth.year, visibleMonth.month, 1);
    target.setMonth(1);
    setVisibleMonth({ year: target.getYear(), month: target.getMonth() });
  };

  const handleGoToToday = () => {
    const currentToday = NepaliDate.now();
    setVisibleMonth({ year: currentToday.getYear(), month: currentToday.getMonth() });
    setIsDialogOpen(false);
  };

  const selectedCell = selectedKey ? (cells.find(cell => cell.key === selectedKey) ?? null) : null;
  const [selectedPanchanga, setSelectedPanchanga] = useState<SelectedPanchangaData | null>(null);
  const [loadingPanchanga, setLoadingPanchanga] = useState(false);
  const [panchangaError, setPanchangaError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCell) return;
    let isCancelled = false;

    const loadSelectedPanchanga = async () => {
      setLoadingPanchanga(true);
      setPanchangaError(null);
      try {
        const data = await fetchPanchangaForADDate(selectedCell.adDate);
        if (!isCancelled) setSelectedPanchanga(data);
      } catch (error) {
        if (!isCancelled) {
          setSelectedPanchanga(null);
          setPanchangaError(error instanceof Error ? error.message : 'Failed to load panchanga');
        }
      } finally {
        if (!isCancelled) setLoadingPanchanga(false);
      }
    };

    void loadSelectedPanchanga();

    return () => {
      isCancelled = true;
    };
  }, [selectedCell]);

  const fallbackMeta = selectedCell ? getTithiAndFestival(selectedCell) : null;

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen px-4 md:px-8 pt-2 pb-10 text-[#2a1f1a]">
      <h1 className="text-[24px] leading-[30px] md:text-[36px] md:leading-[44px] font-sahitya font-bold text-[#7b1c1c] mb-1 tracking-wide">
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

      <section className="rounded-xl border border-[#c7c7c7] bg-white shadow-[0_10px_26px_rgba(0,0,0,0.1)] overflow-hidden">
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

        <div className="grid grid-cols-7">
          {cells.map((date, idx) => (
            <button
              key={`${date.key}-${idx}`}
              type="button"
              onClick={() => {
                setSelectedKey(date.key);
                setIsDialogOpen(true);
              }}
              className={`min-h-[88px] md:min-h-[120px] border-r border-b border-[#d9d9d9] last:border-r-0 p-1.5 md:p-2 flex flex-col justify-between text-left transition-colors duration-150 ${
                date.isToday
                  ? 'bg-[#fff1cf]'
                  : date.monthOffset === 0
                    ? 'bg-white hover:bg-[#f9fbff]'
                    : 'bg-[#f8f8f8] hover:bg-[#f2f2f2]'
              } ${selectedKey === date.key ? 'ring-2 ring-[#cc1f1f]/40 ring-inset bg-[#fff1cf]' : ''}`}
            >
              <span
                className={`font-mukta text-[32px] md:text-[46px] leading-none font-bold ${
                  date.weekDay === 6
                    ? 'text-[#d91515]'
                    : date.monthOffset === 0
                      ? 'text-[#101010]'
                      : 'text-[#9b9b9b]'
                }`}
              >
                {getCellDisplayDay(date)}
              </span>
              <span className="font-mukta text-[10px] md:text-[12px] text-[#444]">
                AD {date.adDate.getDate()}
              </span>
              <span className="font-mukta text-[10px] md:text-[12px] text-[#7f2d2d] truncate">
                {getTithiAndFestival(date).tithi}
              </span>
            </button>
          ))}
        </div>
      </section>

      {isDialogOpen && selectedCell ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close calendar details dialog"
            onClick={closeDialog}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[560px] rounded-2xl border border-[#d9a18d] bg-[#fff8f2] p-5 md:p-6 shadow-[0_20px_55px_rgba(85,24,14,0.28)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sahitya text-[24px] leading-[30px] text-[#7b1c1c] font-bold">
                Date Details
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                className="h-8 w-8 rounded-full border border-[#c0785a] text-[#7b1c1c] hover:bg-[#ffe8cc]"
              >
                x
              </button>
            </div>
            <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f]">
              Selected Date:{' '}
              <span className="font-semibold text-[#7b1c1c]">
                {new NepaliDate(selectedCell.year, selectedCell.month, selectedCell.day).format(
                  'ddd, DD MMMM YYYY',
                  'np',
                )}
              </span>
            </p>
            <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f] mt-1">
              AD Date:{' '}
              <span className="font-semibold text-[#7b1c1c]">
                {selectedCell.adDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
            {loadingPanchanga ? (
              <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f] mt-1">
                Loading panchanga details...
              </p>
            ) : null}
            {panchangaError ? (
              <p className="font-mukta text-[14px] md:text-[16px] text-[#b42318] mt-1">
                {panchangaError}
              </p>
            ) : null}
            <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f] mt-1">
              Tithi:{' '}
              <span className="font-semibold text-[#7b1c1c]">
                {selectedPanchanga?.tithi ?? fallbackMeta?.tithi ?? '—'}
              </span>
            </p>
            <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f] mt-1">
              Paksha:{' '}
              <span className="font-semibold text-[#7b1c1c]">
                {selectedPanchanga?.paksha ?? '—'}
              </span>
            </p>
            <p className="font-mukta text-[14px] md:text-[16px] text-[#5b463f] mt-1">
              Festival / Observance:{' '}
              <span className="font-semibold text-[#7b1c1c]">
                {selectedPanchanga?.festival ?? fallbackMeta?.festival ?? '—'}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NepaliCalendarPageContent;
