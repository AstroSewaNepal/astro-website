'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

import type { CallType } from '@/lib/call/session';

export type CallRequest = {
  bookingId: string;
  callType: CallType;
  /** The other person, for the call screen. */
  partner: { name: string; photo: string | null };
  /** Booking end (ms): the call ends then. */
  endsAt: number;
};

type CallsContext = {
  /** Opens the before-call screen. Ignored while another call is open (one call at a time). */
  openCall: (request: CallRequest) => void;
  /** A call (or its before-call screen) is open. */
  busy: boolean;
  /** The booking whose call is open, if any. */
  activeBookingId: string | null;
  /**
   * Desktop: the chat page of the call's booking hands over an empty slot beside the chat (Figma desktop call), and
   * the call sits exactly over it. Pass null when the slot goes away.
   */
  registerDock: (slot: HTMLElement | null) => void;
};

const Calls = createContext<CallsContext | null>(null);

// The call screen and everything behind it (LiveKit included) load only when a call is opened.
const CallOverlay = dynamic(() => import('@/components/call/call-overlay'), { ssr: false });

/**
 * Holds the one call of the site, above every page layout (root layout): moving to any page keeps the call, including
 * the public pages a client browses (Astro Connect, profiles) that have their own layout. The app keeps its call
 * above its screens too. Pages ask for a call with useCalls().openCall.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<CallRequest | null>(null);
  const [dock, setDock] = useState<HTMLElement | null>(null);
  // "Call again" after a dropped call starts over with a fresh before-call screen.
  const [attempt, setAttempt] = useState(0);
  const again = useCallback(() => setAttempt(n => n + 1), []);
  const openCall = useCallback((next: CallRequest) => {
    setRequest(current => current ?? next);
  }, []);
  const close = useCallback(() => setRequest(null), []);
  // Logged out: no call (the overlay unmounts and hangs up).
  const { status } = useSession();
  const active = status === 'unauthenticated' ? null : request;
  const value = useMemo(
    () => ({
      openCall,
      busy: active !== null,
      activeBookingId: active?.bookingId ?? null,
      registerDock: setDock,
    }),
    [openCall, active],
  );

  return (
    <Calls.Provider value={value}>
      {children}
      {active ? (
        <CallOverlay key={attempt} request={active} dock={dock} onClose={close} onAgain={again} />
      ) : null}
    </Calls.Provider>
  );
}

export function useCalls(): CallsContext {
  const calls = useContext(Calls);
  if (!calls) throw new Error('useCalls needs a CallProvider (root layout)');
  return calls;
}
