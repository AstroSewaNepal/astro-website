'use client';

import { useCallback, useState } from 'react';

import { ELanguage } from '@/components/enums/language.enum';

const STORAGE_KEY = 'zodiac-listing-ui-lang';

function readStored(): ELanguage {
  if (typeof window === 'undefined') {
    return ELanguage.ENGLISH;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw === ELanguage.NEPALI || raw === ELanguage.ENGLISH) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return ELanguage.ENGLISH;
}

/**
 * UI language for zodiac **listing** routes (`/zodiac-sign`, `/zodiac-sign/zodiac-nepali`).
 * Persists to `sessionStorage` so it survives refresh; `defaultLanguage` seeds first paint per route.
 */
export function useZodiacListingLanguage(defaultLanguage: ELanguage) {
  const [language, setLanguageState] = useState<ELanguage>(() =>
    defaultLanguage === ELanguage.NEPALI ? ELanguage.NEPALI : readStored(),
  );

  const setLanguage = useCallback((next: ELanguage) => {
    setLanguageState(next);
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return [language, setLanguage] as const;
}
