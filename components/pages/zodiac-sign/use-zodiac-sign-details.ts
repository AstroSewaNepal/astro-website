'use client';

import { useEffect, useState } from 'react';

import { fetchVedastroZodiacSignBySlug } from '@/lib/api/vedastro/zodiac-sign';
import type { HoroscopeSign } from '@/lib/types/horoscope';
import type { VedastroZodiacSignRow } from '@/lib/types/vedastro';
import { unwrapResult } from '@/lib/utils/vedastro-result';

export function useZodiacSignDetails(slug: HoroscopeSign) {
  const [row, setRow] = useState<VedastroZodiacSignRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const envelope = await fetchVedastroZodiacSignBySlug(slug);
        const data = unwrapResult(envelope);
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
