// Web push for www.astrosewa.com (doc 09 step 4). Plain service worker, no Firebase code: the backend sends data-only
// FCM messages ({ notifTitle, notifBody, type, ...ids }), so this file shows every notification itself.
// Registered by lib/push/browser.ts after the person taps "Turn on notifications".

// The data keys the tap link carries; keep in sync with OPEN_KEYS in lib/push/open.ts.
const OPEN_KEYS = ['type', 'connectionScheduleId', 'astrologerId', 'notificationUserRole'];

// Safari (iPhone/iPad/Mac) revokes push for a site that gets a push and shows nothing, so there every push shows.
const IS_SAFARI = /AppleWebKit/.test(self.navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(self.navigator.userAgent);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

function readData(event) {
  try {
    const json = event.data ? event.data.json() : {};
    // FCM wraps the message data in { data: {...} }; accept a flat object too.
    const data = json && typeof json.data === 'object' && json.data ? json.data : json;
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function openPath(data) {
  const params = new URLSearchParams();
  for (const key of OPEN_KEYS) {
    if (typeof data[key] === 'string' && data[key]) params.set(key, data[key]);
  }
  return '/notification-open?' + params.toString();
}

self.addEventListener('push', event => {
  const data = readData(event);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Open pages re-check the bell at once (the row is saved before the push leaves) and show the toast.
      for (const client of windows) client.postMessage({ type: 'astrosewa:push', notificationType: data.type || '' });
      const pageVisible = windows.some(client => client.visibilityState === 'visible');
      // While the site is on screen the toast is enough. Chat pushes have no list row (no toast), so they always show.
      if (pageVisible && !IS_SAFARI && data.type !== 'chat_message') return;
      const isCall = data.type === 'video_call_participant_joined';
      await self.registration.showNotification(data.notifTitle || 'AstroSewa', {
        body: data.notifBody || '',
        icon: '/icons/icon-192.png',
        data: { url: openPath(data) },
        // A caller who rings again replaces the old call alert instead of stacking.
        ...(isCall ? { tag: 'call:' + (data.connectionScheduleId || data.roomName || ''), renotify: true } : {}),
      });
    })(),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/start', self.location.origin);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Reuse an open AstroSewa tab (the Home Screen app is one window) instead of opening another.
      const tab = windows.find(client => new URL(client.url).origin === url.origin);
      if (tab && 'navigate' in tab) {
        try {
          const moved = (await tab.navigate(url.href)) || tab;
          // Bringing it to the front is a nicety; a refused focus must not undo the navigation.
          await moved.focus().catch(() => {});
          return;
        } catch {
          // Not controlled by this worker (opened before it was installed): open a new window below.
        }
      }
      await self.clients.openWindow(url.href);
    })(),
  );
});
