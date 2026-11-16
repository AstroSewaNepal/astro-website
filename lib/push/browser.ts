// Web push in the browser (doc 09 step 4): our own service worker (public/push-sw.js) plus the Firebase JS SDK, used
// only to get this browser's FCM token. Firebase is loaded on demand, so pages without push don't download it.
import { homeScreenDevice } from '@/lib/pwa/home-screen';

/** Public web app config (Firebase project astrozsewa, same as the phone app and backend). Not secrets. */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAWPjUGIKYg--JpPEYxFGzqF3MIyW8k0mw',
  authDomain: 'astrozsewa.firebaseapp.com',
  projectId: 'astrozsewa',
  storageBucket: 'astrozsewa.firebasestorage.app',
  messagingSenderId: '967117561181',
  appId: '1:967117561181:web:bd35d36ae2320302d45cb4',
};

/** Public half of the Web Push certificate (Firebase console > Cloud Messaging). */
const VAPID_KEY =
  'BLBEvHzq9Ieie4psIf47GOqP4Gdn_WUvbuY9O5TMx3dfY5x1Tc_dnOjXLKa9jS-3qmXQ4BQFHmguYvVifwIWWuI';

export const PUSH_SW_PATH = '/push-sw.js';

/** What public/push-sw.js posts to open pages when a push arrives. */
export const PUSH_MESSAGE = 'astrosewa:push';

/**
 * `needs-home-screen`: an iPhone/iPad page outside the Home Screen app (iOS only allows web push there).
 * `unsupported`: this browser has no web push at all.
 */
export type PushSupport = 'supported' | 'needs-home-screen' | 'unsupported';

export type PushEnv = {
  userAgent: string;
  maxTouchPoints: number;
  standalone: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
};

export function pushSupport(env: PushEnv): PushSupport {
  const apple = homeScreenDevice(env.userAgent, env.maxTouchPoints);
  if (apple && !env.standalone) return 'needs-home-screen';
  if (!env.hasServiceWorker || !env.hasPushManager || !env.hasNotification) return 'unsupported';
  return 'supported';
}

/** The person turned push off here: the page stops re-registering this browser on its own. Per browser. */
export const PUSH_OFF_KEY = 'astrosewa:push-off';
/** The banner's X: hidden for good in this browser (the Settings row stays). */
export const PUSH_BANNER_CLOSED_KEY = 'astrosewa:push-banner-closed';

function local(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readFlag(key: string): boolean {
  try {
    return local()?.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeFlag(key: string, on: boolean): void {
  try {
    if (on) local()?.setItem(key, '1');
    else local()?.removeItem(key);
  } catch {
    // Blocked storage: the choice just isn't remembered.
  }
}

/** Resolves once the worker is active (subscribing needs an active worker). */
function whenActive(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.active) return Promise.resolve();
  const worker = registration.installing ?? registration.waiting;
  if (!worker) return Promise.resolve();
  return new Promise(resolve => {
    const check = () => {
      if (worker.state === 'activated') {
        worker.removeEventListener('statechange', check);
        resolve();
      }
    };
    worker.addEventListener('statechange', check);
  });
}

/**
 * This browser's FCM token (registers the worker first). Only call after notification permission is granted.
 * Throws when this browser can't do Firebase messaging.
 */
export async function getPushToken(): Promise<string> {
  const registration = await navigator.serviceWorker.register(PUSH_SW_PATH, { scope: '/' });
  await whenActive(registration);
  const [{ getApps, initializeApp }, { getMessaging, getToken, isSupported }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ]);
  if (!(await isSupported())) throw new Error('Push is not supported in this browser');
  const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
  const token = await getToken(getMessaging(app), {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error('No push token');
  return token;
}
