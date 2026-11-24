import type { Metadata } from 'next';

import { RemedyList } from '@/components/remedies/remedy-list';

export const metadata: Metadata = { title: 'Remedies' };

type Props = { params: Promise<{ categoryId: string }> };

export default async function RemedyCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  return <RemedyList categoryId={categoryId} />;
}
