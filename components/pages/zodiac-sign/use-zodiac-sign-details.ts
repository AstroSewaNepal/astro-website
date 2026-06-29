'use client';

import { useEffect, useState } from 'react';

import { fetchAstroSewaZodiacSignBySlug } from '@/lib/api/zodiac-signs';
import type { HoroscopeSign } from '@/lib/types/horoscope';
import type { AstroSewaZodiacSignResponse } from '@/lib/types/zodiac-signs';

export function useZodiacSignDetails(slug: HoroscopeSign) {
  const [row, setRow] = useState<AstroSewaZodiacSignResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const data = await fetchAstroSewaZodiacSignBySlug(slug);
        if (!cancelled) {
          setRow(data);
        }
      } catch (e) {
        if (!cancelled) {
          setRow(null);
          setLoadError(e instanceof Error ? e.message : 'Could not load zodiac sign.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { row, loadError, loading };
}
