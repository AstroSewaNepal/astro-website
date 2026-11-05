'use client';

import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  COUNTRY_STORAGE_KEY,
  KNOWN_COUNTRY_RECHECK_MS,
  parseStoredCountry,
  type StoredCountry,
  UNKNOWN_COUNTRY_RECHECK_MS,
} from '@/lib/geo/country';

function readStored(): StoredCountry | null {
  try {
    return parseStoredCountry(window.localStorage.getItem(COUNTRY_STORAGE_KEY));
  } catch {
    return null; // private mode or blocked storage: just ask the server
  }
}

const noSubscribe = () => () => {};

async function fetchCountry(): Promise<string | null> {
  const res = await fetch('/api/geo/country', { cache: 'no-store' });
  if (!res.ok) throw new Error(`country lookup failed (${res.status})`);
  const { countryCode } = (await res.json()) as { countryCode?: string | null };
  if (!countryCode) return null;
  try {
    window.localStorage.setItem(
      COUNTRY_STORAGE_KEY,
      JSON.stringify({ countryCode, checkedAt: Date.now() } satisfies StoredCountry),
    );
  } catch {
    // not saved: asked again next visit
  }
  return countryCode;
}

/**
 * The buyer's country code for prices, or null when unknown (the backend then uses its default currency), as the
 * app's useUserLocation. A saved country is used straight away and re-checked in the background, so travel lands.
 * Price queries should key on the code and wait for `isResolved`, so they aren't fetched twice.
 */
export function useBuyerCountry() {
  const { data, isPending } = useQuery({
    queryKey: ['buyer-country'],
    queryFn: fetchCountry,
    initialData: () => readStored()?.countryCode,
    initialDataUpdatedAt: () => readStored()?.checkedAt,
    staleTime: query => (query.state.data ? KNOWN_COUNTRY_RECHECK_MS : UNKNOWN_COUNTRY_RECHECK_MS),
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  // The server render (and the hydration pass) can't see localStorage: report "not yet" there, so the HTML matches.
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return { countryCode: null, isResolved: false };
  return { countryCode: data ?? null, isResolved: !isPending };
}
