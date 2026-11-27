'use client';

import { QueryClientContext } from '@tanstack/react-query';
import { useContext } from 'react';

import { QueryProvider } from './query-provider';

/**
 * For shared pieces that use React Query on public pages too (the landing page has no QueryProvider): reuses the
 * page's query client when there is one, otherwise gives the piece its own.
 */
export function EnsureQueryProvider({ children }: { children: React.ReactNode }) {
  const client = useContext(QueryClientContext);
  return client ? <>{children}</> : <QueryProvider>{children}</QueryProvider>;
}
