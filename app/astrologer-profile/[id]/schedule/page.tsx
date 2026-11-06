import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ScheduleScreen } from '@/components/booking/schedule-screen';
import { requireClient } from '@/lib/auth/require-client';
import { packagesPath, schedulePath } from '@/lib/booking/packages';

export const metadata: Metadata = {
  title: 'Schedule Appointment',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ package?: string | string[] }>;
};

export default async function ScheduleAppointmentPage({ params, searchParams }: Props) {
  const { id } = await params;
  const packageId = (await searchParams).package;
  // A package is picked on the packages screen first.
  if (typeof packageId !== 'string' || !packageId) redirect(packagesPath(id));
  await requireClient(schedulePath(id, packageId));
  return <ScheduleScreen key={packageId} astrologerId={id} packageId={packageId} />;
}
