import type { Metadata } from 'next';

import { MyConsultations } from '@/components/booking/my-consultations';
import { consultationTab } from '@/lib/booking/consultations';

export const metadata: Metadata = { title: 'My Consultations' };

type Props = { searchParams: Promise<{ tab?: string | string[] }> };

export default async function ClientConsultationsPage({ searchParams }: Props) {
  const tab = consultationTab((await searchParams).tab);
  return <MyConsultations key={tab} initialTab={tab} />;
}
