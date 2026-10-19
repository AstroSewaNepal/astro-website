export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.astrosewa.app';
export const DOWNLOAD_APP_PAGE = '/download-app';

/** Android → Play Store; everything else (iOS app not live yet) → null. */
export function getMobileStoreUrl(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || '';
  const userAgent = nav.userAgent || '';
  const isAndroid = /android/i.test(userAgent) || /android/i.test(platform);

  return isAndroid ? PLAY_STORE_URL : null;
}

export function getAppDownloadUrl(): string {
  return getMobileStoreUrl() ?? DOWNLOAD_APP_PAGE;
}
