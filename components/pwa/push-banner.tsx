'use client';

import { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';

import { usePush } from '@/hooks/use-push';
import type { PrivateKind } from '@/lib/account/nav';
import { PUSH_BANNER_CLOSED_KEY, PUSH_OFF_KEY, readFlag, writeFlag } from '@/lib/push/browser';

const TEXT: Record<PrivateKind, string> = {
  // Astrologers need it most: a call or booking they don't see is lost.
  astrologer: "Turn on notifications so you don't miss calls and bookings",
  client: 'Turn on notifications for booking reminders and messages',
};

/**
 * Account home, next to the Home Screen banner (an iPhone outside the Home Screen gets that one instead): asks once
 * per browser until push is on. X hides it for good; the Settings row stays.
 */
export function PushBanner({ kind }: { kind: PrivateKind }) {
  const push = usePush();
  const [closed, setClosed] = useState(true);

  const wanted = push.status === 'off' && push.permission === 'default';
  useEffect(() => {
    if (!wanted || readFlag(PUSH_BANNER_CLOSED_KEY) || readFlag(PUSH_OFF_KEY)) return;
    // Storage is only readable after hydration: decide here, not in the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClosed(false);
  }, [wanted]);

  // Stays up while the browser prompt is open, and after a failure so the person can try again.
  if (closed || !(wanted || push.busy || push.failed)) return null;

  return (
    <div className="rounded-lg bg-[#720A0B] py-2.5 pl-4 pr-2 text-white">
      <div className="flex items-center gap-3">
        <BellRing className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} aria-hidden />
        <p className="min-w-0 flex-1 font-app text-[15px] leading-snug">{TEXT[kind]}</p>
        <button
          type="button"
          disabled={push.busy}
          onClick={() => void push.turnOn()}
          className="shrink-0 rounded-full bg-white px-4 py-1.5 font-app text-[14px] font-semibold text-[#720A0B] disabled:opacity-70"
        >
          {push.busy ? 'Turning on…' : 'Turn on'}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            writeFlag(PUSH_BANNER_CLOSED_KEY, true);
            setClosed(true);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {push.failed ? (
        <p role="alert" className="mt-1.5 pl-[34px] font-app text-[13px] text-white/90">
          Couldn&apos;t turn on notifications. Please try again.
        </p>
      ) : null}
    </div>
  );
}
