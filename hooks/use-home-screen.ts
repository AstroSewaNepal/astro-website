'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { homeScreenDevice, type HomeScreenDevice, isStandalone } from '@/lib/pwa/home-screen';

const noSubscribe = () => () => {};

export type HomeScreenState = HomeScreenDevice & { standalone: boolean };

/**
 * This iPhone/iPad and whether the page is already open from the Home Screen; null on other devices, and during the
 * server render and hydration pass (they can't see the device, so the HTML matches).
 */
export function useHomeScreen(): HomeScreenState | null {
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  return useMemo(() => {
    if (!hydrated) return null;
    const device = homeScreenDevice(navigator.userAgent, navigator.maxTouchPoints);
    return device ? { ...device, standalone: isStandalone() } : null;
  }, [hydrated]);
}
