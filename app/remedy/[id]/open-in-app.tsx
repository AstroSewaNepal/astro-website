'use client';

import { useEffect } from 'react';

const APP_SCHEME = 'com.astrosewa.app';
const ANDROID_PACKAGE = 'com.astrosewa.app';

// Reached only when the OS didn't hand the link to the app (unverified app link, in-app browser), so retry via the custom scheme.
function buildAppUrl(path: string) {
  if (/android/i.test(navigator.userAgent)) {
    return `intent://${path}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};end`;
  }
  return `${APP_SCHEME}://${path}`;
}

export default function OpenInApp({ path }: { path: string }) {
  const openApp = () => {
    window.location.href = buildAppUrl(path);
  };

  useEffect(() => {
    window.location.href = buildAppUrl(path);
  }, [path]);

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="text-lg font-semibold">Opening this remedy in the Astro Sewa app…</p>
      <button
        type="button"
        onClick={openApp}
        className="rounded-full bg-[#770B0C] px-6 py-3 font-semibold text-white"
      >
        Open in App
      </button>
      <p className="text-sm text-gray-500">Don&apos;t have the app? Download it below.</p>
    </div>
  );
}
