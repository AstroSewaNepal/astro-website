'use client';

import React, { useMemo, useState } from 'react';
import NepaliDate from 'nepali-date-converter';

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

const getFestivalLabel = (cell: CalendarCell) => {
  const weekdayFestivalMap: Record<number, string> = {
    0: 'Surya Aradhana',
    1: 'Shiv Puja',
    2: 'Hanuman Puja',
    3: 'Budha Smaran',
    4: 'Guru Puja',
    5: 'Laxmi Puja',
    6: 'Shani Aradhana',
  };
  return weekdayFestivalMap[cell.weekDay] ?? 'Auspicious Day';
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

  return (
    <div className="min-h-screen pt-2 pb-10 text-[#2a1f1a]">
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
                  className={`min-h-[88px] md:min-h-[120px] border-r border-b border-[#d9d9d9] last:border-r-0 p-1.5 md:p-2 flex flex-col justify-between text-left ${
                    date.isToday
                      ? 'bg-[#1f6c1f] border border-[#145a19] text-white shadow-[0_8px_24px_rgba(31,108,31,0.18)]'
                      : date.monthOffset === 0
                        ? 'bg-white'
                        : 'bg-[rgba(31,108,31,0.04)] text-[#7d7d7d]'
                  }`}
                >
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
    </div>
  );
};

export default NepaliCalendarPageContent;
