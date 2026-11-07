import type { Metadata } from 'next';

import { PackagesScreen } from '@/components/booking/packages-screen';
import { requireClient } from '@/lib/auth/require-client';
import { packagesPath, packageTab } from '@/lib/booking/packages';

export const metadata: Metadata = {
  title: 'Consultation Packages',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function ConsultationPackagesPage({ params, searchParams }: Props) {
  const { id } = await params;
  const tab = packageTab((await searchParams).tab);
  await requireClient(packagesPath(id, tab));
  // key: a new tab in the URL (e.g. back from schedule) starts the screen on that tab.
  return <PackagesScreen key={tab} astrologerId={id} initialTab={tab} />;
}
