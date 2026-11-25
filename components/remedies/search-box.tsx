'use client';

import { Search, X } from 'lucide-react';

/** The site's pill search box (as Astro Connect). */
export function SearchBox({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-11 font-app text-[16px] text-[#4a1a1a] outline-none focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <Search
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary"
          aria-hidden
        />
      )}
    </label>
  );
}
