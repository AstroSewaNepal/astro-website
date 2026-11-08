import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ScheduleScreen, type BookingOffer } from '@/components/booking/schedule-screen';
import { requireClient } from '@/lib/auth/require-client';
import { packagesPath, planSchedulePath, schedulePath } from '@/lib/booking/packages';
import { reschedulePath } from '@/lib/booking/reschedule';

import { rebookPath } from '@/lib/payments/rebook';

export const metadata: Metadata = {
  title: 'Schedule Appointment',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    package?: string | string[];
    plan?: string | string[];
    booking?: string | string[];
    /** A paid package that couldn't be booked: book with this payment (lib/payments/rebook). */
    paid?: string | string[];
  }>;
};

export default async function ScheduleAppointmentPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { package: packageId, plan, booking, paid } = await searchParams;
  const paidWith = typeof paid === 'string' && paid ? paid : undefined;
  // A package comes from the packages screen; a plan and a booking to move from My Consultations.
  const offer: BookingOffer | null =
    typeof booking === 'string' && booking
      ? { kind: 'reschedule', bookingId: booking }
      : typeof plan === 'string' && plan
        ? { kind: 'plan', subscriptionId: plan }
        : typeof packageId === 'string' && packageId
          ? { kind: 'package', packageId, paidWith }
          : null;
  if (!offer) redirect(packagesPath(id));
  await requireClient(
    offer.kind === 'reschedule'
      ? reschedulePath(id, offer.bookingId)
      : offer.kind === 'plan'
        ? planSchedulePath(id, offer.subscriptionId)
        : offer.paidWith
          ? rebookPath({ astrologerId: id, packageId: offer.packageId, pidx: offer.paidWith })
          : schedulePath(id, offer.packageId),
  );
  return (
    <ScheduleScreen
      key={
        offer.kind === 'reschedule'
          ? offer.bookingId
          : offer.kind === 'plan'
            ? offer.subscriptionId
            : `${offer.packageId}-${offer.paidWith ?? ''}`
      }
      astrologerId={id}
      offer={offer}
    />
  );
}
