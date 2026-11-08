'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import {
  WAITING_PACKAGES_PATH,
  type WaitingPackage,
  rebookByLabel,
  rebookPath,
  waitingLabel,
} from '@/lib/payments/rebook';

/**
 * Paid sessions that couldn't be booked (the slot went while the buyer paid), on My Consultations so a buyer who
 * closed the tab still finds them. Nothing shows when there are none.
 */
export function WaitingPackages() {
  const backend = useBackendClient();
  const waiting = useQuery({
    queryKey: ['payments', 'waiting-packages'],
    queryFn: () => backend.bare.get<WaitingPackage[]>(WAITING_PACKAGES_PATH),
  });
  const list = Array.isArray(waiting.data) ? waiting.data : [];
  if (!list.length) return null;

  return (
    <section aria-label="Paid sessions waiting for a time" className="mb-5 flex flex-col gap-3">
      {list.map(w => (
        <div
          key={w.pidx}
          className="flex flex-col gap-3 rounded-2xl border border-[#f2b8b5] bg-[#fdecea] px-4 py-3 font-app sm:flex-row sm:items-center"
        >
          <CalendarClock className="hidden h-6 w-6 shrink-0 text-primary sm:block" aria-hidden />
          <p className="flex-1 text-[15px] text-[#4a1a1a]">
            <b className="block">Paid session waiting for a time</b>
            {waitingLabel(w)} ({w.currency} {w.amount}). The slot you picked was taken while you paid. Choose
            another time by {rebookByLabel(w)}, or contact support for a refund.
          </p>
          <Link
            href={rebookPath(w)}
            className="flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-[15px] text-white"
          >
            Choose a Time
          </Link>
        </div>
      ))}
    </section>
  );
}
