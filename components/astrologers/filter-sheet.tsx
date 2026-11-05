'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';

import {
  activeFilterCount,
  DEFAULT_FILTERS,
  type ListFilters,
  SORT_OPTIONS,
  type SortId,
} from '@/lib/astrologers/list';

type Option = { value: string; label: string };
type Tab = 'sort' | 'language' | 'gender';
type Draft = Pick<ListFilters, 'sort' | 'languages' | 'gender'>;

const TABS: { id: Tab; label: string }[] = [
  { id: 'sort', label: 'Sort by' },
  { id: 'language', label: 'Language' },
  { id: 'gender', label: 'Gender' },
];

/**
 * Filter button + "Sort & Filter" sheet (Figma Astro-Connect/Sort-by; the app's FilterBottomSheet): choices are drafts
 * until Apply. A bottom sheet on phones, a dialog on desktop.
 */
export function FilterSheet({
  filters,
  languages,
  genders,
  onApply,
}: {
  filters: ListFilters;
  languages: Option[];
  genders: Option[];
  onApply: (next: Draft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('sort');
  const [draft, setDraft] = useState<Draft>(filters);
  const count = activeFilterCount(filters);

  const openSheet = (next: boolean) => {
    if (next)
      setDraft({ sort: filters.sort, languages: filters.languages, gender: filters.gender });
    setOpen(next);
  };
  const apply = (next: Draft) => {
    onApply(next);
    setOpen(false);
  };
  const toggleLanguage = (name: string) =>
    setDraft(d => ({
      ...d,
      languages: d.languages.includes(name)
        ? d.languages.filter(l => l !== name)
        : [...d.languages, name],
    }));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={openSheet}>
      <DialogPrimitive.Trigger className="flex h-[48px] shrink-0 items-center gap-2 rounded-full border border-[#c9837a] px-5 font-mukta text-[16px] text-primary">
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
        Filter
        {count ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
            {count}
          </span>
        ) : null}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[81] flex max-h-[85vh] flex-col rounded-t-[24px] bg-[#f8f0dc] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:pb-5"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-mukta text-[18px] font-semibold text-[#720A0B]">
              Sort &amp; Filter
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#720A0B] text-white"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'shrink-0 rounded-full border px-4 py-1.5 font-mukta text-[15px]',
                  tab === t.id
                    ? 'border-[#720A0B] bg-[#720A0B] text-white'
                    : 'border-[#BE7B71] text-[#720A0B]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-3 min-h-[220px] flex-1 overflow-y-auto" role="tabpanel">
            {tab === 'sort'
              ? SORT_OPTIONS.map(o => (
                  <Choice
                    key={o.id}
                    type="radio"
                    label={o.label}
                    checked={draft.sort === o.id}
                    onChange={() => setDraft(d => ({ ...d, sort: o.id as SortId }))}
                  />
                ))
              : null}
            {tab === 'language'
              ? languages.map(o => (
                  <Choice
                    key={o.value}
                    type="checkbox"
                    label={o.label}
                    checked={draft.languages.includes(o.value)}
                    onChange={() => toggleLanguage(o.value)}
                  />
                ))
              : null}
            {tab === 'gender'
              ? genders.map(o => (
                  <Choice
                    key={o.value}
                    type="radio"
                    label={o.label}
                    checked={draft.gender === o.value}
                    // The app lets a second tap clear the gender.
                    onChange={() =>
                      setDraft(d => ({ ...d, gender: d.gender === o.value ? '' : o.value }))
                    }
                  />
                ))
              : null}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() =>
                apply({
                  sort: DEFAULT_FILTERS.sort,
                  languages: DEFAULT_FILTERS.languages,
                  gender: DEFAULT_FILTERS.gender,
                })
              }
              className="h-[48px] flex-1 rounded-full border border-[#720A0B] font-mukta text-[17px] text-[#720A0B]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => apply(draft)}
              className="h-[48px] flex-1 rounded-full bg-[#720A0B] font-mukta text-[17px] text-white"
            >
              Apply
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Choice({
  type,
  label,
  checked,
  onChange,
}: {
  type: 'radio' | 'checkbox';
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center gap-4 py-2.5 text-left font-mukta text-[17px] text-[#720A0B]"
    >
      <span
        aria-hidden
        className={clsx(
          'flex h-5 w-5 shrink-0 items-center justify-center border',
          type === 'radio' ? 'rounded-full' : 'rounded-[5px]',
          checked ? 'border-[#720A0B]' : 'border-[#BE7B71]',
          checked && type === 'checkbox' && 'bg-[#720A0B] text-white',
        )}
      >
        {checked && type === 'radio' ? (
          <span className="h-2.5 w-2.5 rounded-full bg-[#720A0B]" />
        ) : null}
        {checked && type === 'checkbox' ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      {label}
    </button>
  );
}
