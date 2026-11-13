/**
 * Back never shows outside pages again (eSewa, HBL, Google sign-in).
 *
 * Paying or signing in sends the browser to another site that sends it back here. Its pages stay in the tab's history
 * under ours, so pressing Back after that walked into them: Google's account picker after signing in, eSewa's login
 * (which redirects to itself, a trap in Firefox). A site can't delete history entries, but it can jump over them:
 *
 * 1. Just before leaving, the page notes the trip and how long the history is, and tags its own history entry
 *    (noteOutsideTrip).
 * 2. Back on our site, the first page to load (the payment result, or any page after signing in) jumps back over
 *    everything the trip added, to the tagged page (OUTSIDE_TRIP_SCRIPT, inline in the root layout, so it runs before
 *    the page is drawn).
 * 3. The tagged page swaps itself for the landing page (location.replace).
 *
 * The outside pages are then only "forward" of us, and nothing offers Forward in an installed web app. Coming back
 * to the tagged page without finishing (Back on Google or eSewa) just drops the trip. When the count can't be
 * trusted, nothing happens and Back works as before.
 */

export type OutsideTripKind = 'payment' | 'login';

export type OutsideTrip = { kind: OutsideTripKind; length: number; at: number; token: string };

/** sessionStorage: per tab, kept while the tab is on the other site. */
export const TRIP_KEY = 'astro:outsideTrip';
export const LANDING_KEY = 'astro:outsideTripLanding';
/** In the history state of the page we left from. */
export const TAG_KEY = '__astroOutsideTrip';
/** A trip older than this (abandoned) is ignored. */
export const TRIP_MAX_AGE_MS = 30 * 60_000;
/** The jump back takes a moment; a landing older than this is stale. */
export const LANDING_MAX_AGE_MS = 15_000;
/** Chrome and Firefox keep at most 50 entries per tab: past that the length stops growing and can't be counted. */
export const HISTORY_CAP = 50;
/** Where a payment comes back to. Signing in can end anywhere (the page it was for, home, an error on /login). */
export const PAYMENT_LANDING = '/payment/return';

/**
 * Call right before sending the browser to the other site. Adds a tagged copy of this page to the history: that
 * drops any pages ahead of this one (after going Back), which would make the count wrong, and gives the jump back a
 * place to land that can be swapped without losing this page.
 */
export function noteOutsideTrip(kind: OutsideTripKind): void {
  try {
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const state: unknown = window.history.state;
    const tagged = { ...(state && typeof state === 'object' ? state : {}), [TAG_KEY]: token };
    window.history.pushState(tagged, '', window.location.href);
    const trip: OutsideTrip = { kind, length: window.history.length, at: Date.now(), token };
    window.sessionStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  } catch {
    // Storage blocked (private mode): Back just works as before.
  }
}

const key = JSON.stringify;

/**
 * Runs on every page load, before the page is drawn (root layout; plain ES5, no imports).
 * - Back on the tagged copy (the trip wasn't finished): drop the trip and step back over the copy.
 * - The page a trip comes back to: jump back, unless the trip is old, this isn't where it comes back to, the history
 *   is too long to count, or nothing was added. A payment lands on the tagged copy, so Back from the result still
 *   shows the page it was paid from. Signing in lands one further, on the sign-in page itself, which nobody needs to
 *   see again.
 * - The page that jump lands on: swap in the landing page, also when restored from the back/forward cache (scripts
 *   don't run again then; pageshow does).
 * Every new page load uses up the trip.
 */
export const OUTSIDE_TRIP_SCRIPT = `(function () {
  try {
    var s = window.sessionStorage;
    var read = function (k) {
      try { return JSON.parse(s.getItem(k) || 'null'); } catch (e) { return null; }
    };
    var fresh = function (at, max) {
      var age = Date.now() - at;
      return typeof at === 'number' && age >= 0 && age <= max;
    };
    var tag = function () {
      var state = window.history.state;
      return state && typeof state === 'object' ? state[${key(TAG_KEY)}] : undefined;
    };
    var land = function () {
      var landing = read(${key(LANDING_KEY)});
      if (!landing) return false;
      s.removeItem(${key(LANDING_KEY)});
      if (!fresh(landing.at, ${LANDING_MAX_AGE_MS}) || typeof landing.url !== 'string') return false;
      if (landing.url === window.location.href) return false;
      window.location.replace(landing.url);
      return true;
    };
    var backUnfinished = function () {
      var trip = read(${key(TRIP_KEY)});
      if (!trip || tag() !== trip.token) return false;
      s.removeItem(${key(TRIP_KEY)});
      window.history.back();
      return true;
    };
    window.addEventListener('pageshow', function (event) {
      if (event.persisted && !land()) backUnfinished();
    });
    if (land() || backUnfinished()) return;
    var trip = read(${key(TRIP_KEY)});
    s.removeItem(${key(TRIP_KEY)});
    if (!trip) return;
    if (!fresh(trip.at, ${TRIP_MAX_AGE_MS}) || typeof trip.length !== 'number') return;
    if (trip.kind === 'payment' && window.location.pathname.indexOf(${key(PAYMENT_LANDING)}) !== 0) return;
    var length = window.history.length;
    if (length >= ${HISTORY_CAP} || trip.length >= ${HISTORY_CAP}) return;
    var steps = length - trip.length;
    if (!(steps > 0)) return;
    if (trip.kind === 'login') steps += 1;
    s.setItem(${key(LANDING_KEY)}, JSON.stringify({ url: window.location.href, at: Date.now() }));
    window.history.go(-steps);
  } catch (e) {
    // Never in the way of the page.
  }
})();`;
