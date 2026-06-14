const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  'https://apps.apple.com/app/astro-sewa/id0000000000';
const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.astrosewa.app';

/** Mac/iOS → App Store; Windows/Android (and other) → Play Store. */
export function getAppStoreUrl(): string {
  if (typeof navigator === 'undefined') {
    return PLAY_STORE_URL;
  }
  const ua = navigator.userAgent;
  const isApple =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    /Macintosh|Mac OS X/.test(ua);
  return isApple ? APP_STORE_URL : PLAY_STORE_URL;
}

export function openAppStore(): void {
  window.open(getAppStoreUrl(), '_blank', 'noopener,noreferrer');
}
