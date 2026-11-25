import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SavedReport } from '@/components/astro-reports/saved-report';

type Props = { params: Promise<{ tab: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tab } = await params;
  return { title: tab === 'match' ? 'Edit Match Making' : 'Edit Kundali' };
}

export default async function EditSavedReportPage({ params }: Props) {
  const { tab, id } = await params;
  if (tab !== 'kundali' && tab !== 'match') notFound();
  return <SavedReport tab={tab} id={id} mode="edit" />;
}
