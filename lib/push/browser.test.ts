import { describe, expect, it } from 'vitest';

import { type PushEnv, pushSupport } from './browser';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';

const env = (over: Partial<PushEnv>): PushEnv => ({
  userAgent: ANDROID,
  maxTouchPoints: 5,
  standalone: false,
  hasServiceWorker: true,
  hasPushManager: true,
  hasNotification: true,
  ...over,
});

describe('pushSupport', () => {
  it('Android Chrome works in the browser tab', () => {
    expect(pushSupport(env({}))).toBe('supported');
  });

  it('iPhone Safari needs the Home Screen first', () => {
    expect(pushSupport(env({ userAgent: IPHONE, hasPushManager: false }))).toBe('needs-home-screen');
  });

  it('iPhone from the Home Screen works', () => {
    expect(pushSupport(env({ userAgent: IPHONE, standalone: true }))).toBe('supported');
  });

  it('old iOS from the Home Screen has no PushManager', () => {
    expect(pushSupport(env({ userAgent: IPHONE, standalone: true, hasPushManager: false }))).toBe(
      'unsupported',
    );
  });

  it('iPad (desktop user agent with touch) needs the Home Screen', () => {
    expect(pushSupport(env({ userAgent: MAC, maxTouchPoints: 5 }))).toBe('needs-home-screen');
  });

  it('Mac Safari works in the browser', () => {
    expect(pushSupport(env({ userAgent: MAC, maxTouchPoints: 0 }))).toBe('supported');
  });

  it('no service worker = unsupported', () => {
    expect(pushSupport(env({ hasServiceWorker: false }))).toBe('unsupported');
  });
});
