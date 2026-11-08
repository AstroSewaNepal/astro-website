'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';

import { SORT_OPTIONS, type SortOption } from '@/lib/booking/consultations';

export type SortFilter<T extends string = SortOption> = { sort: T; from: string; to: string };

/**
 * The app's ConsultationSortBottomSheet: sort order and a date range, applied together. Phones: a sheet from the
 * bottom; desktop: a dialog. `active` marks the button when anything differs from the tab's default.
 * `options` swaps the sort list for another single choice (My Payments: the kind of payment).
 */
export function SortSheet<T extends string = SortOption>({
  value,
  defaultSort,
  active,
  onApply,
  options = SORT_OPTIONS as unknown as { id: T; label: string }[],
  title = 'Sort & Filter',
  choiceLabel = 'Sort by',
}: {
  value: SortFilter<T>;
  defaultSort: T;
  active: boolean;
  onApply: (next: SortFilter<T>) => void;
  options?: { id: T; label: string }[];
  title?: string;
  choiceLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const openChange = (next: boolean) => {
    // Each opening starts from what's applied, like the app.
    if (next) setDraft(value);
    setOpen(next);
  };
  const apply = (next: SortFilter<T>) => {
    onApply(next);
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={openChange}>
      <DialogPrimitive.Trigger
        aria-label={title === 'Sort & Filter' ? 'Sort and filter' : title}
        className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border border-[#c9837a] text-primary lg:h-11 lg:w-11 lg:border-primary lg:bg-[#F8F3DF]"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
        {active ? (
          <span
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary"
            aria-hidden
          />
        ) : null}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/20 data-[state=closed]:animate-[drawer-fade-out_300ms_ease-out] data-[state=open]:animate-[drawer-fade-in_300ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={clsx(
            'fixed z-[71] flex max-h-[85vh] flex-col bg-[#FFFAE6] outline-none',
            // Phones: bottom sheet. Desktop: centred dialog.
            'inset-x-0 bottom-0 rounded-t-[24px] pb-[env(safe-area-inset-bottom)] data-[state=closed]:animate-[sheet-out_300ms_ease-out] data-[state=open]:animate-[sheet-in_300ms_ease-out]',
            'lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[440px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[24px] lg:pb-0 lg:shadow-xl lg:data-[state=closed]:animate-[drawer-fade-out_200ms_ease-out] lg:data-[state=open]:animate-[drawer-fade-in_200ms_ease-out]',
            'motion-reduce:animate-none',
          )}
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <DialogPrimitive.Title className="font-raleway text-[20px] font-semibold text-primary">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="Close" className="text-primary">
              <X className="h-6 w-6" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
            <fieldset className="flex flex-col gap-4">
              <legend className="sr-only">{choiceLabel}</legend>
              {options.map(o => (
                <label key={o.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name={`sheet-${choiceLabel}`}
                    value={o.id}
                    checked={draft.sort === o.id}
                    onChange={() => setDraft(d => ({ ...d, sort: o.id }))}
                    className="h-5 w-5 accent-[#611508]"
                  />
                  <span className="font-app text-[16px] font-medium text-[#1C1C1C]">{o.label}</span>
                </label>
              ))}
            </fieldset>

            <p className="mb-3 mt-6 font-app text-[16px] font-medium text-primary">Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              <DateField
                label="From date"
                value={draft.from}
                max={draft.to || undefined}
                onChange={from => setDraft(d => ({ ...d, from }))}
              />
              <DateField
                label="To date"
                value={draft.to}
                min={draft.from || undefined}
                onChange={to => setDraft(d => ({ ...d, to }))}
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-[#e8ddd0] px-5 py-4">
            <button
              type="button"
              onClick={() => apply({ sort: defaultSort, from: '', to: '' })}
              className="h-12 flex-1 rounded-full border border-primary font-app text-[16px] text-primary"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => apply(draft)}
              className="h-12 flex-1 rounded-full bg-primary font-app text-[16px] text-white"
            >
              Apply
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-app text-[13px] text-[#6d6d6d]">{label}</span>
      <input
        type="date"
        value={value}
        min={min ?? '2000-01-01'}
        max={max}
        onChange={e => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-[#c9837a] bg-white px-3 font-app text-[16px] text-[#1C1C1C] outline-none focus:border-primary"
      />
    </label>
  );
}
