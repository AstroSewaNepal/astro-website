'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ELanguage } from '@/components/enums/language.enum';

import {
  HOROSCOPE_DICTIONARIES,
  parseUiLangParam,
  persistChromeUiLanguage,
  readChromeUiLanguage,
} from './locale';
import type { HoroscopeMessages } from './locales/horoscope/schema';

export type HoroscopeLocaleContextValue = {
  /** Header / footer / page chrome (from `?lang=` on most routes; session on zodiac detail). */
  uiLanguage: ELanguage;
  setUiLanguage: (next: ELanguage) => void;
  dict: HoroscopeMessages;
};

const HoroscopeLocaleContext = createContext<HoroscopeLocaleContextValue | null>(null);

export function useHoroscopeLocale(): HoroscopeLocaleContextValue {
  const ctx = useContext(HoroscopeLocaleContext);
  if (!ctx) {
    throw new Error('useHoroscopeLocale must be used within HoroscopeLocaleProvider');
  }
  return ctx;
}

export function useHoroscopeLocaleOptional(): HoroscopeLocaleContextValue | null {
  return useContext(HoroscopeLocaleContext);
}

function isZodiacDetailRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/zodiac-sign/details') ||
    pathname.startsWith('/zodiac-sign/zodiac-detailnepali')
  );
}

function HoroscopeLocaleProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onZodiacDetail = isZodiacDetailRoute(pathname);

  const [zodiacChromeLang, setZodiacChromeLang] = useState<ELanguage>(() => readChromeUiLanguage());

  const urlUiLanguage = useMemo(
    () => parseUiLangParam(searchParams.get('lang')) ?? ELanguage.ENGLISH,
    [searchParams],
  );

  const uiLanguage = onZodiacDetail ? zodiacChromeLang : urlUiLanguage;

  const setUiLanguage = useCallback(
    (next: ELanguage) => {
      if (onZodiacDetail) {
        setZodiacChromeLang(next);
        persistChromeUiLanguage(next);
        return;
      }
      const nextParams = new URLSearchParams(searchParams.toString());
      if (next === ELanguage.ENGLISH) {
        nextParams.delete('lang');
      } else {
        nextParams.set('lang', next);
      }
      const qs = nextParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [onZodiacDetail, pathname, router, searchParams],
  );

  const value = useMemo(
    (): HoroscopeLocaleContextValue => ({
      uiLanguage,
      setUiLanguage,
      dict: HOROSCOPE_DICTIONARIES[uiLanguage],
    }),
    [uiLanguage, setUiLanguage],
  );

  return (
    <HoroscopeLocaleContext.Provider value={value}>{children}</HoroscopeLocaleContext.Provider>
  );
}

export function HoroscopeLocaleProvider({ children }: { children: React.ReactNode }) {
  return <HoroscopeLocaleProviderInner>{children}</HoroscopeLocaleProviderInner>;
}
