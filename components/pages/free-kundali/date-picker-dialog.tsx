'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: string) => void;
  value?: string;
}

const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  open,
  onOpenChange,
  onDateSelect,
  value,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [day, month, year] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
  });

  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setDisplayYear(displayYear - 10);
  };

  const handleNextYear = () => {
    setDisplayYear(displayYear + 10);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const formattedDate = `${String(day).padStart(2, '0')}-${String(displayMonth + 1).padStart(2, '0')}-${displayYear}`;
    onDateSelect(formattedDate);
    onOpenChange(false);
  };

  const handleMonthClick = (monthIndex: number) => {
    setDisplayMonth(monthIndex);
    setView('day');
  };

  const handleYearClick = (year: number) => {
    setDisplayYear(year);
    setView('month');
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100vw-2rem,20rem)] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:!left-8 md:!top-1/2 md:!translate-x-0 md:!translate-y-[-50%] md:!right-auto !p-3">
        <DialogHeader>
          <DialogTitle className="text-base">Select Date of Birth</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="p-2">
          {view === 'day' && (
            <div className="space-y-3">
              {/* Header with month/year and navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <button
                    onClick={() => setView('month')}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                    type="button"
                  >
                    {monthNames[displayMonth]} {displayYear}
                  </button>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 justify-items-center">
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-600 py-2 w-full"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 justify-items-center">
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    disabled={!day}
                    className={`w-full h-10 py-2 text-center rounded-full transition-colors text-sm ${
                      day
                        ? 'hover:bg-primary hover:text-white cursor-pointer'
                        : 'cursor-default text-gray-200'
                    } ${
                      day &&
                      value &&
                      parseInt(value.split('-')[0]) === day &&
                      displayMonth === parseInt(value.split('-')[1]) - 1 &&
                      displayYear === parseInt(value.split('-')[2])
                        ? 'bg-primary text-white font-semibold'
                        : ''
                    }`}
                    type="button"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'month' && (
            <div className="space-y-4">
              {/* Header with year and navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevYear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <button
                    onClick={() => setView('year')}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                    type="button"
                  >
                    {displayYear}
                  </button>
                </div>

                <button
                  onClick={handleNextYear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Months grid */}
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => handleMonthClick(idx)}
                    className={`py-2 px-1 text-center rounded transition-colors text-sm font-medium ${
                      idx === displayMonth
                        ? 'bg-primary text-white font-semibold'
                        : 'hover:bg-gray-100'
                    }`}
                    type="button"
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'year' && (
            <div className="space-y-4">
              {/* Header with range and navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevYear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold">
                    {displayYear} - {displayYear + 9}
                  </span>
                </div>

                <button
                  onClick={handleNextYear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Years grid */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 10 }, (_, i) => displayYear - 5 + i).map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={`py-2 text-center rounded transition-colors text-sm ${
                      year === displayYear
                        ? 'bg-primary text-white font-semibold'
                        : 'hover:bg-gray-100'
                    }`}
                    type="button"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatePickerDialog;
