'use client';

import { getSession, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import type { PushUpdate } from '@/auth';
import { browserLock } from '@/lib/backend/token-refresher';
import {
  getPushToken,
  PUSH_OFF_KEY,
  type PushSupport,
  pushSupport,
  readFlag,
  writeFlag,
} from '@/lib/push/browser';
import { isStandalone } from '@/lib/pwa/home-screen';

/**
 * `on`: this login gets pushes in this browser. `off`: it could (tap to turn on). `blocked`: the person said no in
 * the browser's prompt; only the browser's site settings can undo that.
 */
export type PushStatus = 'loading' | Exclude<PushSupport, 'supported'> | 'blocked' | 'on' | 'off';

const noSubscribe = () => () => {};

function subscribePermission(onChange: () => void) {
  // The person may change it in the browser's site settings and come back.
  document.addEventListener('visibilitychange', onChange);
  window.addEventListener('focus', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
    window.removeEventListener('focus', onChange);
  };
}
const readPermission = (): NotificationPermission | null =>
  typeof Notification === 'undefined' ? null : Notification.permission;

function currentSupport(): PushSupport {
  return pushSupport({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone: isStandalone(),
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: typeof Notification !== 'undefined',
  });
}

// Ask the server with the session lock held: update() writes the login cookie, and a token refresh in another tab at
// the same moment would otherwise be overwritten with a dead refresh token.
const savePush = (update: ReturnType<typeof useSession>['update'], push: string | null) =>
  browserLock(() => update({ push } satisfies PushUpdate));

/** Push on/off for this login in this browser (Settings row + home banner). */
export function usePush() {
  const { data: session, status, update } = useSession();
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const permission = useSyncExternalStore(subscribePermission, readPermission, () => null);
  const support = useMemo(() => (hydrated ? currentSupport() : null), [hydrated]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  let pushStatus: PushStatus = 'loading';
  if (support && status !== 'loading') {
    if (support !== 'supported') pushStatus = support;
    else if (permission === 'denied') pushStatus = 'blocked';
    else if (permission === 'granted' && session?.pushToken) pushStatus = 'on';
    else pushStatus = 'off';
  }

  /** Must run straight from a tap: iPhones only show the permission prompt for a tap. */
  async function turnOn() {
    setBusy(true);
    setFailed(false);
    try {
      // First await of the tap handler, so the browser still counts it as the person's action.
      const answer = await Notification.requestPermission();
      if (answer !== 'granted') return;
      writeFlag(PUSH_OFF_KEY, false);
      const token = await getPushToken();
      const next = await savePush(update, token);
      if (next?.pushToken !== token) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setFailed(false);
    writeFlag(PUSH_OFF_KEY, true);
    try {
      const next = await savePush(update, null);
      if (next?.pushToken) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return { status: pushStatus, permission, busy, failed, turnOn, turnOff };
}

// Once per page load per account: the module resets on every full load (login, logout).
let syncedFor: string | null = null;

/**
 * Keeps this login registered without a tap when the browser already allows notifications: after a new login (the
 * fresh cookie has no token yet) and when Firebase rotates the token. Skipped after the person turned push off here.
 */
export function usePushSync() {
  const { data: session, status, update } = useSession();
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (status !== 'authenticated' || !userId || syncedFor === userId) return;
    if (currentSupport() !== 'supported' || readPermission() !== 'granted' || readFlag(PUSH_OFF_KEY)) return;
    syncedFor = userId;
    void (async () => {
      try {
        const token = await getPushToken();
        if ((await getSession())?.pushToken !== token) await savePush(update, token);
      } catch {
        // Try again on the next page load.
      }
    })();
  }, [status, userId, update]);
}
