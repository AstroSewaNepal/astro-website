'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import type { BirthTimeParts } from './birth-time-fields';

// ─── Types ───────────────────────────────────────────────────────────────────

type ClockTimePickerProps = {
  value: BirthTimeParts;
  onChange: (value: BirthTimeParts) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  variant?: 'default' | 'calculator';
  error?: string;
};

type ClockMode = 'hour' | 'minute';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function angleFromCenter(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let a = Math.atan2(clientY - cy, clientX - cx) + Math.PI / 2;
  if (a < 0) a += 2 * Math.PI;
  return a;
}

// ─── Clock Face ──────────────────────────────────────────────────────────────

const CLOCK_NUMBERS_HOUR = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CLOCK_NUMBERS_MINUTE = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const CX = 118;
const CY = 118;
const HOUR_R = 58;
const MIN_R = 90;
const NUM_R = 97;

type ClockFaceProps = {
  hour: number;
  minute: number;
  mode: ClockMode;
  onCommit: (value: number) => void;
};

function ClockFace({ hour, minute, mode, onCommit }: ClockFaceProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [liveAngle, setLiveAngle] = useState<number | null>(null);

  const computeValue = useCallback(
    (a: number): number => {
      if (mode === 'hour') {
        const h = Math.round((a / (2 * Math.PI)) * 12);
        return h === 0 ? 12 : h;
      }
      return Math.round((a / (2 * Math.PI)) * 60) % 60;
    },
    [mode],
  );

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const a = angleFromCenter(clientX, clientY, svgRef.current.getBoundingClientRect());
    setLiveAngle(a);
  }, []);

  const handleCommit = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return;
      const a = angleFromCenter(clientX, clientY, svgRef.current.getBoundingClientRect());
      onCommit(computeValue(a));
      setLiveAngle(null);
      dragging.current = false;
    },
    [computeValue, onCommit],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (dragging.current) handleCommit(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current && e.touches[0]) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (dragging.current) {
        const t = e.changedTouches[0];
        if (t) handleCommit(t.clientX, t.clientY);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMove, handleCommit]);

  const handAngle = (() => {
    if (liveAngle !== null) return liveAngle;
    const frac = mode === 'hour' ? (hour % 12 || 12) / 12 : minute / 60;
    return frac * 2 * Math.PI - Math.PI / 2 + Math.PI / 2;
  })();

  const radius = mode === 'hour' ? HOUR_R : MIN_R;
  const ex = CX + radius * Math.cos(handAngle - Math.PI / 2);
  const ey = CY + radius * Math.sin(handAngle - Math.PI / 2);

  const nums = mode === 'hour' ? CLOCK_NUMBERS_HOUR : CLOCK_NUMBERS_MINUTE;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 236 236"
      className="w-full h-full cursor-pointer touch-none select-none"
      onMouseDown={e => {
        dragging.current = true;
        handleMove(e.clientX, e.clientY);
      }}
      onTouchStart={e => {
        dragging.current = true;
        if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onClick={e => {
        if (!dragging.current) {
          handleCommit(e.clientX, e.clientY);
        }
      }}
      aria-label={`Clock face. Current ${mode}: ${mode === 'hour' ? hour : minute}`}
    >
      <circle cx={CX} cy={CY} r={115} style={{ fill: 'var(--secondary)' }} />
      {nums.map((n, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const x = CX + NUM_R * Math.cos(a);
        const y = CY + NUM_R * Math.sin(a);
        return (
          <text
            key={n}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontFamily="inherit"
            fill="#720A0B"
          >
            {n}
          </text>
        );
      })}
      <line
        x1={CX}
        y1={CY}
        x2={ex.toFixed(1)}
        y2={ey.toFixed(1)}
        style={{ stroke: 'hsl(359 84% 24%)' }}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={5} style={{ fill: 'hsl(359 84% 24%)' }} />
      <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r={11} style={{ fill: 'hsl(359 84% 24%)' }} />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClockTimePicker({
  value,
  onChange,
  disabled = false,
  label = 'Enter birth time',
  id = 'clock-time-picker',
  variant = 'default',
  error,
}: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [mode, setMode] = useState<ClockMode>('hour');
  const [draft, setDraft] = useState<BirthTimeParts>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const updatePlacement = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const pickerHeight = 380;
      const availableBelow = window.innerHeight - rect.bottom;
      const availableAbove = rect.top;
      setOpenAbove(availableBelow < pickerHeight && availableAbove > availableBelow);
    };

    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open]);

  const hour = parseInt(draft.hh || '12', 10) || 12;
  const minute = parseInt(draft.mm || '0', 10) || 0;

  const handleClockCommit = (val: number) => {
    if (mode === 'hour') {
      const next = { ...draft, hh: String(val), mm: draft.mm || '00' };
      setDraft(next);
      onChange(next);
      setMode('minute');
    } else {
      const next = { ...draft, mm: pad(val) };
      setDraft(next);
      onChange(next);
    }
  };

  const handleApply = () => {
    const next = {
      ...draft,
      hh: draft.hh || '12',
      mm: draft.mm || '00',
    };
    setDraft(next);
    onChange(next);
    setOpen(false);
  };

  const displayVal =
    draft.hh && draft.mm
      ? `${pad(hour)} : ${pad(minute)} ${draft.ampm.toUpperCase()}`
      : 'hh / mm / am';

  const labelClass =
    variant === 'calculator'
      ? 'mb-2 block font-mukta text-sm text-Trinary'
      : 'block font-mukta text-[14px] text-primary mb-1.5';

  const buttonClass = clsx(
    'w-full flex items-center justify-between transition-colors',
    variant === 'calculator'
      ? clsx(
          'box-border h-[52px] rounded-[32px] border bg-transparent px-[16px] font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-normal leading-[30px] tracking-normal',
          open
            ? 'border-[#BE7B71] ring-1 ring-[#BE7B71]/20'
            : error
              ? 'border-red-600'
              : 'border-[#BE7B71]',
          draft.hh && draft.mm ? 'text-[#2f2f2f]' : 'text-[#464646]',
        )
      : clsx(
          'rounded-full border px-4 py-2.5 font-mukta text-[15px]',
          open ? 'border-primary' : error ? 'border-red-500' : 'border-[#c9b9aa]',
          'text-primary font-medium',
        ),
    disabled && 'opacity-50 pointer-events-none',
  );

  return (
    <div ref={containerRef} className="relative" id={id}>
      <label className={labelClass}>{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={buttonClass}
      >
        <span
          className={
            variant === 'calculator' ? 'flex-1 text-left min-w-0' : 'text-primary font-medium'
          }
        >
          {displayVal}
        </span>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke={variant === 'calculator' ? 'currentColor' : '#720A0B'}
          strokeWidth="1.8"
          className={clsx('opacity-60', variant === 'calculator' && 'text-[#5D1409]')}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      {error ? (
        <p
          className="mt-1 sm:mt-2 font-mukta text-[12px] text-red-600 min-h-[16px] sm:min-h-[18px]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {open && (
        <div
          className={clsx(
            'absolute z-50',
            variant === 'calculator' ? 'left-0' : 'left-1/2 -translate-x-1/2',
            openAbove ? 'bottom-full mb-2' : 'top-full mt-2',
            'bg-white rounded-[20px] border border-[#61150833] shadow-lg',
            'p-5 flex flex-col items-center gap-4 w-[300px]',
          )}
          role="dialog"
          aria-label="Clock time picker"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('hour')}
              className={clsx(
                'w-[56px] h-[52px] rounded-[10px] text-[26px] font-semibold transition-colors',
                mode === 'hour' ? 'bg-primary text-secondary' : 'bg-secondary text-primary',
              )}
            >
              {pad(hour)}
            </button>

            <span className="text-[26px] font-semibold text-primary">:</span>

            <button
              type="button"
              onClick={() => setMode('minute')}
              className={clsx(
                'w-[56px] h-[52px] rounded-[10px] text-[26px] font-semibold transition-colors',
                mode === 'minute' ? 'bg-primary text-secondary' : 'bg-secondary text-primary',
              )}
            >
              {pad(minute)}
            </button>

            <div className="flex flex-col gap-1 ml-1">
              {(['AM', 'PM'] as const).map(ap => (
                <button
                  key={ap}
                  type="button"
                  onClick={() => {
                    const next = {
                      ...draft,
                      ampm: ap.toLowerCase(),
                      hh: draft.hh || '12',
                      mm: draft.mm || '00',
                    };
                    setDraft(next);
                    onChange(next);
                  }}
                  className={clsx(
                    'w-[44px] h-[22px] rounded-[6px] text-[12px] font-medium border transition-colors',
                    draft.ampm.toUpperCase() === ap
                      ? 'bg-primary text-secondary border-primary'
                      : 'bg-transparent text-primary border-[#ddd]',
                  )}
                >
                  {ap}
                </button>
              ))}
            </div>
          </div>

          <div className="w-[220px] h-[220px]">
            <ClockFace hour={hour} minute={minute} mode={mode} onCommit={handleClockCommit} />
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="mx-auto px-15 py-2 rounded-full bg-primary text-secondary text-[20px] font-semibold hover:bg-[#8e2f27] active:scale-[0.98] transition-all"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
