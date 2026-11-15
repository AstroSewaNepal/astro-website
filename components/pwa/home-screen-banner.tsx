'use client';

import { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';

import { HomeScreenGuide } from '@/components/pwa/home-screen-guide';
import { useHomeScreen } from '@/hooks/use-home-screen';
import type { PrivateKind } from '@/lib/account/nav';
import { closeBanner, isBannerClosed, takeAutoOpen } from '@/lib/pwa/home-screen';

/**
 * Account home on an iPhone/iPad that isn't opened from the Home Screen yet, like the app's LocationAccessPrompt:
 * a maroon banner that opens the guide, and the guide opens on its own once per browser session. The banner's X
 * hides both for good; the guide stays in Settings.
 */
export function HomeScreenBanner({ kind }: { kind: PrivateKind }) {
  const state = useHomeScreen();
  const [closed, setClosed] = useState(true);
  const [open, setOpen] = useState(false);

  const wanted = state !== null && !state.standalone;
  useEffect(() => {
    if (!wanted || isBannerClosed()) return;
    // Storage is only readable after hydration: decide here, not in the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClosed(false);
    if (takeAutoOpen()) setOpen(true);
  }, [wanted]);

  if (!state || !wanted || closed) return null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg bg-[#720A0B] py-2.5 pl-4 pr-2 text-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left font-app text-[15px] leading-snug"
        >
          <Smartphone className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} aria-hidden />
          <span>Add AstroSewa to your Home Screen</span>
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            closeBanner();
            setClosed(true);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <HomeScreenGuide state={state} kind={kind} open={open} onOpenChange={setOpen} settingsHint />
    </>
  );
}
