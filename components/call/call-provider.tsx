'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

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
};

const Calls = createContext<CallsContext | null>(null);

// The call screen and everything behind it (LiveKit included) load only when a call is opened.
const CallOverlay = dynamic(() => import('@/components/call/call-overlay'), { ssr: false });

/**
 * Holds the one call of the logged-in area, above the pages: moving between pages keeps the call (the app keeps its
 * call above its screens too). Pages ask for a call with useCalls().openCall.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<CallRequest | null>(null);
  const openCall = useCallback((next: CallRequest) => {
    setRequest(current => current ?? next);
  }, []);
  const close = useCallback(() => setRequest(null), []);
  const value = useMemo(() => ({ openCall, busy: request !== null }), [openCall, request]);

  return (
    <Calls.Provider value={value}>
      {children}
      {request ? <CallOverlay request={request} onClose={close} /> : null}
    </Calls.Provider>
  );
}

export function useCalls(): CallsContext {
  const calls = useContext(Calls);
  if (!calls) throw new Error('useCalls needs a CallProvider (the logged-in area layout)');
  return calls;
}
