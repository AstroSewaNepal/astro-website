'use client';

import { useEffect, useRef } from 'react';
import { getSession, useSession } from 'next-auth/react';

/** A normal page load gets its session well within this; longer means it is stuck. */
const STUCK_MS = 1500;

/**
 * Account pages render only for a logged-in account (the server checked), so a browser-side session that is still
 * not "authenticated" here after a moment is stale: the page was reached by a client-side move from a page loaded
 * while signed out (seen in Firefox after Google sign-in: the old /login page followed the server's redirect without
 * a fresh load, and the header showed "Sign in" until a reload). NextAuth never re-checks by itself then (its
 * tab-focus check skips a signed-out session). getSession() makes useSession() re-read the cookie (via NextAuth's
 * cross-tab message, which also ends a stuck "loading"); once per page.
 */
export function SessionResync() {
  const { status } = useSession();
  const tried = useRef(false);
  useEffect(() => {
    if (status === 'authenticated' || tried.current) return;
    const timer = window.setTimeout(() => {
      tried.current = true;
      void getSession();
    }, STUCK_MS);
    return () => window.clearTimeout(timer);
  }, [status]);
  return null;
}
