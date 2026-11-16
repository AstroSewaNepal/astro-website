'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { openOnTopTarget, THEN_PARAM } from '@/lib/push/open';

/** If the page doesn't come in time (offline), home shows itself instead of a blank screen. */
const MAX_COVER_MS = 8000;

/**
 * Account home opened by a push tap in a NEW window (/notification-open adds ?then=<page>): opens that page on top of
 * home, so the window's history is home -> page and Back goes home instead of closing the window (and dropping a
 * call, which goes small on home like after any Back). Home stays covered meanwhile, so it reads as one page load.
 */
export function OpenOnTop({ home }: { home: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const target = pathname === home ? openOnTopTarget(params.get(THEN_PARAM)) : null;
  const [cover, setCover] = useState(target !== null);
  const started = useRef(false);

  // The page has arrived: uncover (home stays uncovered when Back returns to it).
  if (cover && pathname !== home) setCover(false);

  useEffect(() => {
    if (!target || started.current) return;
    started.current = true;
    // Home's own entry drops ?then first, so Back to it doesn't open the page again.
    window.history.replaceState(window.history.state, '', home);
    router.push(target);
    const timer = window.setTimeout(() => setCover(false), MAX_COVER_MS);
    return () => window.clearTimeout(timer);
  }, [target, home, router]);

  if (!cover) return null;
  return <div aria-hidden className="fixed inset-0 z-[70] bg-[#fbf7ee]" />;
}
