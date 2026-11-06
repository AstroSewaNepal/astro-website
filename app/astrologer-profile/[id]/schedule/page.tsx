import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ScheduleScreen, type BookingOffer } from '@/components/booking/schedule-screen';
import { requireClient } from '@/lib/auth/require-client';
import { packagesPath, planSchedulePath, schedulePath } from '@/lib/booking/packages';

export const metadata: Metadata = {
  title: 'Schedule Appointment',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ package?: string | string[]; plan?: string | string[] }>;
};

export default async function ScheduleAppointmentPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { package: packageId, plan } = await searchParams;
  // A package comes from the packages screen, a plan from My Consultations.
  const offer: BookingOffer | null =
    typeof plan === 'string' && plan
      ? { kind: 'plan', subscriptionId: plan }
      : typeof packageId === 'string' && packageId
        ? { kind: 'package', packageId }
        : null;
  if (!offer) redirect(packagesPath(id));
  await requireClient(
    offer.kind === 'plan'
      ? planSchedulePath(id, offer.subscriptionId)
      : schedulePath(id, offer.packageId),
  );
  return (
    <ScheduleScreen
      key={offer.kind === 'plan' ? offer.subscriptionId : offer.packageId}
      astrologerId={id}
      offer={offer}
    />
  );
}
