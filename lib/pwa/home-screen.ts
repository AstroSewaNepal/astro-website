// "Add to Home Screen" guide for iPhones and iPads. iOS has no install button: people add the site by hand from the
// Share menu, and only then do web pushes work (iOS 16.4+). Android keeps the Android app, so it gets no guide.

/** Which version of the guide this browser needs; null = not an iPhone/iPad (no guide). */
export type HomeScreenBrowser =
  /** Safari: Share -> Add to Home Screen. */
  | 'safari'
  /** Chrome, Edge, Firefox etc. on iOS 16.4+: same menu item, reached from their own Share button. */
  | 'other'
  /** Instagram, Facebook, TikTok... in-app browsers: can't add, the page has to be opened in Safari first. */
  | 'in-app';

export type HomeScreenDevice = { device: 'iphone' | 'ipad'; browser: HomeScreenBrowser };

const IN_APP =
  /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok|musical_ly|Snapchat|Twitter|LinkedInApp|GSA\//i;
const OTHER_BROWSER = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|Brave/i;

export function homeScreenDevice(userAgent: string, maxTouchPoints = 0): HomeScreenDevice | null {
  const iphone = /iPhone|iPod/i.test(userAgent);
  // iPadOS asks for the desktop site: a "Mac" with a touch screen.
  const ipad = /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  if (!iphone && !ipad) return null;
  const browser: HomeScreenBrowser = IN_APP.test(userAgent)
    ? 'in-app'
    : OTHER_BROWSER.test(userAgent)
      ? 'other'
      : 'safari';
  return { device: iphone ? 'iphone' : 'ipad', browser };
}

/** True when the page was opened from the Home Screen icon (no browser bars). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** The banner's X hides it for good (Settings keeps the guide); the popup opens on its own once per browser session. */
export const BANNER_CLOSED_KEY = 'astrosewa:home-screen-banner-closed';
export const AUTO_OPENED_KEY = 'astrosewa:home-screen-guide-shown';

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    // Private mode or blocked storage: behave as if nothing was saved.
    return null;
  }
}

export const isBannerClosed = () => storage('local')?.getItem(BANNER_CLOSED_KEY) === '1';

export function closeBanner(): void {
  try {
    storage('local')?.setItem(BANNER_CLOSED_KEY, '1');
  } catch {
    // Full or blocked storage: the banner just comes back next time.
  }
}

/** True the first time in this browser session (and marks it), so the popup opens on its own only once. */
export function takeAutoOpen(): boolean {
  const store = storage('session');
  if (!store) return false;
  try {
    if (store.getItem(AUTO_OPENED_KEY) === '1') return false;
    store.setItem(AUTO_OPENED_KEY, '1');
    return true;
  } catch {
    return false;
  }
}
