'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ELanguage } from '@/components/enums/language.enum';
import {
  parseUiLangParam,
  persistZodiacDetailLanguage,
  readZodiacDetailLanguage,
} from '@/lib/i18n';

function readSeedFromUrl(searchParams: URLSearchParams): ELanguage | null {
  return (
    parseUiLangParam(searchParams.get('content_lang')) ?? parseUiLangParam(searchParams.get('lang'))
  );
}

/**
 * Content language for zodiac **detail** routes (`/zodiac-sign/details`).
 * Persists to `sessionStorage`; optional `content_lang` (or legacy `lang`) in the URL seeds once then is stripped.
 */
export function useZodiacDetailLanguage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const didSyncUrl = useRef(false);

  const [language, setLanguageState] = useState<ELanguage>(() => {
    const urlLang = readSeedFromUrl(searchParams);
    return urlLang ?? readZodiacDetailLanguage();
  });

  useEffect(() => {
    if (didSyncUrl.current) {
      return;
    }
    didSyncUrl.current = true;

    persistZodiacDetailLanguage(language);

    if (searchParams.has('content_lang') || searchParams.has('lang')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('content_lang');
      params.delete('lang');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [language, pathname, router, searchParams]);

  const setLanguage = useCallback((next: ELanguage) => {
    setLanguageState(next);
    persistZodiacDetailLanguage(next);
  }, []);

  return [language, setLanguage] as const;
}
