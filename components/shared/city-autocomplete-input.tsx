'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { IoLocationOutline } from 'react-icons/io5';

import { formatCityLabel, searchCities, type CitySearchResult } from '@/lib/city-search-api';

export type CityAutocompleteInputProps = {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onCitySelect: (city: CitySearchResult) => void;
  error?: string;
  disabled?: boolean;
};

export const CityAutocompleteInput = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onCitySelect,
  error,
  disabled,
}: CityAutocompleteInputProps) => {
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const requestSequenceRef = useRef(0);
  const skipNextSearchRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const requestId = ++requestSequenceRef.current;
      setIsLoading(true);
      setHasSearched(false);

      try {
        const results = await searchCities(query);
        if (requestId !== requestSequenceRef.current || controller.signal.aborted) return;
        setSuggestions(results);
        setIsOpen(true);
        setHasSearched(true);
        setActiveIndex(results.length ? 0 : -1);
      } finally {
        if (requestId === requestSequenceRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [disabled, value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const selectCity = (city: CitySearchResult) => {
    skipNextSearchRef.current = true;
    onChange(formatCityLabel(city));
    onCitySelect(city);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setHasSearched(false);
  };

  const showDropdown =
    isOpen && value.trim().length >= 2 && (isLoading || suggestions.length > 0 || hasSearched);

  return (
    <div ref={rootRef}>
      {label ? (
        <label htmlFor={id} className="block font-mukta text-sm text-Trinary mb-2">
          {label}
        </label>
      ) : null}
      <div
        className={clsx(
          'flex h-[52px] box-border items-center justify-between overflow-hidden rounded-[32px] border bg-transparent px-[16px] transition-colors duration-200 focus-within:ring-1 focus-within:ring-Trinary/20',
          error ? 'border-red-500 focus-within:border-red-500' : 'border-Trinary focus-within:border-Trinary',
        )}
      >
        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={event => {
            const nextValue = event.currentTarget.value.replace(/[^A-Za-z\s,.'-]/g, '');
            onChange(nextValue);
          }}
          onFocus={() => {
            if (value.trim().length >= 2 && (suggestions.length > 0 || hasSearched || isLoading)) {
              setIsOpen(true);
            }
          }}
          onKeyDown={event => {
            if (!showDropdown) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (suggestions.length === 0) return;
              setActiveIndex(prev => (prev + 1) % suggestions.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (suggestions.length === 0) return;
              setActiveIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
            } else if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
              event.preventDefault();
              selectCity(suggestions[activeIndex]);
            } else if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-item-${activeIndex}` : undefined}
          autoComplete="off"
          className="flex-1 min-w-0 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-[#2f2f2f] placeholder:text-[#464646] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <IoLocationOutline className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-primary" aria-hidden />
      </div>

      {showDropdown ? (
        <div
          id={listId}
          role="listbox"
          className="mt-1 max-h-52 overflow-auto rounded-xl border border-primary/20 bg-white shadow-md"
        >
          {isLoading ? (
            <p className="px-3 py-2 font-mukta text-sm text-[#6c5a58]">Searching cities...</p>
          ) : suggestions.length === 0 ? (
            <p className="px-3 py-2 font-mukta text-sm text-[#6c5a58]">No cities found</p>
          ) : (
            suggestions.map((city, index) => (
              <button
                key={`${city.id}-${index}`}
                id={`${listId}-item-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={clsx(
                  'w-full px-3 py-2 text-left font-mukta text-sm md:text-base text-[#141414] transition-colors',
                  index === activeIndex ? 'bg-[#fbf5ec]' : 'hover:bg-[#fbf5ec]/70',
                )}
                onMouseDown={event => {
                  event.preventDefault();
                  selectCity(city);
                }}
              >
                {formatCityLabel(city)}
              </button>
            ))
          )}
        </div>
      ) : null}

      {error ? (
        <span className="block mt-1.5 px-1 font-mukta text-xs text-red-600 leading-tight">
          {error}
        </span>
      ) : null}
    </div>
  );
};
