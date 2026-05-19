'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: string) => void;
  value?: string;
}

const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  open,
  onOpenChange,
  onDateSelect,
  value,
}) => {
  const today = new Date();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [positionAbove, setPositionAbove] = useState(false);

  const [currentDate] = useState(() => {
    if (value) {
      const [day, month, year] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
  });

  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');

  const todayDate  = new Date();
  const todayDay   = todayDate.getDate();
  const todayMonth = todayDate.getMonth();
  const todayYear  = todayDate.getFullYear();

  useEffect(() => {
    if (open) {
      const t = new Date();
      setDisplayYear(t.getFullYear());
      setDisplayMonth(t.getMonth());
      setView('day');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const check = () => {
      const el = dropdownRef.current;
      if (!el?.parentElement) return;
      const pr = el.parentElement.getBoundingClientRect();
      const dr = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setPositionAbove(vh - pr.bottom < dr.height && pr.top > vh - pr.bottom);
    };
    const t = setTimeout(check, 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (dropdownRef.current.parentElement?.contains(e.target as Node)) return;
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpenChange]);

  const handlePrevMonth = () => displayMonth === 0  ? (setDisplayMonth(11), setDisplayYear(y => y - 1)) : setDisplayMonth(m => m - 1);
  const handleNextMonth = () => displayMonth === 11 ? (setDisplayMonth(0),  setDisplayYear(y => y + 1)) : setDisplayMonth(m => m + 1);
  const handlePrevYear  = () => setDisplayYear(y => y - 10);
  const handleNextYear  = () => setDisplayYear(y => y + 10);

  const handleDayClick   = (day: number) => {
    onDateSelect(`${String(day).padStart(2,'0')}-${String(displayMonth+1).padStart(2,'0')}-${displayYear}`);
    onOpenChange(false);
  };
  const handleMonthClick = (idx: number) => { setDisplayMonth(idx); setView('day'); };
  const handleYearClick  = (yr: number)  => { setDisplayYear(yr);   setView('month'); };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDay    = new Date(displayYear, displayMonth, 1).getDay();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames   = ['S','M','T','W','T','F','S'];

  // ── Design tokens ──────────────────────────────
  const cream       = '#f5f0e6';
  const maroon      = '#7a1c1c';
  const maroonFaint = `${maroon}20`;

  // ── Exact typography spec for all numbers & labels ──
  const numberStyle: React.CSSProperties = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 500,
    fontSize: 15.72,
    lineHeight: '100%',
    letterSpacing: 0,
    textAlign: 'center',
  };

  const isSelected = (d: number) =>
    !!value &&
    parseInt(value.split('-')[0]) === d &&
    displayMonth === parseInt(value.split('-')[1]) - 1 &&
    displayYear  === parseInt(value.split('-')[2]);

  const isToday = (d: number) =>
    d === todayDay && displayMonth === todayMonth && displayYear === todayYear;

  const navBtn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: '50%',
    background: maroon, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: cream, flexShrink: 0,
  };
  // ───────────────────────────────────────────────

  if (!open) return null;

  return (
    <>
      {/* Load Nunito from Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          zIndex: 50,
          width: 409,
          height: 325,
          borderRadius: 24,
          border: `1px solid ${maroon}30`,
          opacity: 1,
          backgroundColor: cream,
          boxShadow: '0 8px 32px rgba(122,28,28,0.13)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...(positionAbove
            ? { bottom: '100%', marginBottom: 8 }
            : { top: '100%',    marginTop: 8 }),
        }}
      >
        <div style={{
          width: '100%', height: '100%',
          padding: '18px 22px 16px',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* ══ DAY VIEW ══ */}
          {view === 'day' && <>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 7 }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke={maroon} strokeWidth="1.4"/>
                  <path d="M1.5 7h15" stroke={maroon} strokeWidth="1.4"/>
                  <path d="M5.25 1.5v3M12.75 1.5v3" stroke={maroon} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <button onClick={() => setView('month')} type="button"
                  style={{
                    ...numberStyle,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: maroon, padding: 0, fontWeight: 700,
                  }}>
                  {monthNames[displayMonth]} {displayYear}
                </button>
              </div>
              <div style={{ display:'flex', gap: 5 }}>
                <button onClick={handlePrevMonth} type="button" style={navBtn}><ChevronLeft  size={13}/></button>
                <button onClick={handleNextMonth} type="button" style={navBtn}><ChevronRight size={13}/></button>
              </div>
            </div>

            {/* Dashed rule */}
            <div style={{ borderTop:`1.5px dashed ${maroon}50`, marginBottom: 8 }}/>

            {/* Weekday labels */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom: 2 }}>
              {dayNames.map((d, i) => (
                <div key={i} style={{
                  ...numberStyle,
                  color: maroon,
                  fontWeight: 700,
                  padding: '2px 0 4px',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', flex:1, alignContent:'space-evenly' }}>
              {days.map((day, idx) => {
                const sel = day ? isSelected(day) : false;
                const td  = day ? isToday(day)    : false;
                const hl  = sel || td;
                return (
                  <button key={idx} onClick={() => day && handleDayClick(day)} disabled={!day} type="button"
                    style={{
                      ...numberStyle,
                      background: hl ? maroon : 'transparent',
                      color: !day ? `${maroon}35` : hl ? cream : maroon,
                      border: 'none', borderRadius: '50%',
                      width: 34, height: 34, margin: '0 auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: hl ? 700 : 500,
                      cursor: day ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (day && !hl) (e.currentTarget as HTMLButtonElement).style.background = maroonFaint; }}
                    onMouseLeave={e => { if (day && !hl) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    {day ?? ''}
                  </button>
                );
              })}
            </div>
          </>}

          {/* ══ MONTH VIEW ══ */}
          {view === 'month' && <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
              <button onClick={() => setView('year')} type="button"
                style={{ ...numberStyle, background:'none', border:'none', cursor:'pointer', color:maroon, padding:0, fontWeight:700 }}>
                {displayYear}
              </button>
              <div style={{ display:'flex', gap:5 }}>
                <button onClick={handlePrevYear} type="button" style={navBtn}><ChevronLeft  size={13}/></button>
                <button onClick={handleNextYear} type="button" style={navBtn}><ChevronRight size={13}/></button>
              </div>
            </div>
            <div style={{ borderTop:`1.5px dashed ${maroon}50`, marginBottom:12 }}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, flex:1, alignContent:'space-evenly' }}>
              {monthNames.map((month, idx) => (
                <button key={month} onClick={() => handleMonthClick(idx)} type="button"
                  style={{
                    ...numberStyle,
                    background: idx === displayMonth ? maroon : 'transparent',
                    color: idx === displayMonth ? cream : maroon,
                    border:'none', borderRadius:8, padding:'8px 4px',
                    fontWeight: idx === displayMonth ? 700 : 500,
                    cursor:'pointer', transition:'background 0.12s',
                  }}
                  onMouseEnter={e => { if (idx !== displayMonth) (e.currentTarget as HTMLButtonElement).style.background = maroonFaint; }}
                  onMouseLeave={e => { if (idx !== displayMonth) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {month.slice(0,3)}
                </button>
              ))}
            </div>
          </>}

          {/* ══ YEAR VIEW ══ */}
          {view === 'year' && <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
              <span style={{ ...numberStyle, color:maroon, fontWeight:700 }}>
                {displayYear - 5} – {displayYear + 4}
              </span>
              <div style={{ display:'flex', gap:5 }}>
                <button onClick={handlePrevYear} type="button" style={navBtn}><ChevronLeft  size={13}/></button>
                <button onClick={handleNextYear} type="button" style={navBtn}><ChevronRight size={13}/></button>
              </div>
            </div>
            <div style={{ borderTop:`1.5px dashed ${maroon}50`, marginBottom:12 }}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, flex:1, alignContent:'space-evenly' }}>
              {Array.from({ length:10 }, (_, i) => displayYear - 5 + i).map(year => (
                <button key={year} onClick={() => handleYearClick(year)} type="button"
                  style={{
                    ...numberStyle,
                    background: year === displayYear ? maroon : 'transparent',
                    color: year === displayYear ? cream : maroon,
                    border:'none', borderRadius:8, padding:'8px 0',
                    fontWeight: year === displayYear ? 700 : 500,
                    cursor:'pointer', transition:'background 0.12s',
                  }}
                  onMouseEnter={e => { if (year !== displayYear) (e.currentTarget as HTMLButtonElement).style.background = maroonFaint; }}
                  onMouseLeave={e => { if (year !== displayYear) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {year}
                </button>
              ))}
            </div>
          </>}

        </div>
      </div>
    </>
  );
};

export default DatePickerDropdown;