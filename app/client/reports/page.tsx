import type { Metadata } from 'next';

import { AstroReports } from '@/components/astro-reports/astro-reports';

export const metadata: Metadata = { title: 'Astro Reports' };

type Props = { searchParams: Promise<{ tab?: string | string[] }> };

/** `?tab=match` opens on the match reports (where "back" from a match lands). */
export default async function ClientReportsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return <AstroReports initialTab={tab === 'match' ? 'match' : 'kundali'} />;
}
