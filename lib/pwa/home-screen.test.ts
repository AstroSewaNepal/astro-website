import { describe, expect, it } from 'vitest';

import { homeScreenDevice } from '@/lib/pwa/home-screen';

const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const CHROME_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.41 Mobile/15E148 Safari/604.1';
const INSTAGRAM_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 390.0.0.28.85 (iPhone15,2; iOS 18_5; en_US)';
const FACEBOOK_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/520.0.0.38.101;FBBV/0;FBDV/iPhone15,2]';
const IPAD_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 15; SM-G996B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const WINDOWS_EDGE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0';

describe('homeScreenDevice', () => {
  it('iPhone Safari gets the Safari guide', () => {
    expect(homeScreenDevice(SAFARI_IPHONE, 5)).toEqual({ device: 'iphone', browser: 'safari' });
  });

  it('other iPhone browsers get their own steps', () => {
    expect(homeScreenDevice(CHROME_IPHONE, 5)).toEqual({ device: 'iphone', browser: 'other' });
  });

  it('in-app browsers are told to open Safari', () => {
    expect(homeScreenDevice(INSTAGRAM_IPHONE, 5)?.browser).toBe('in-app');
    expect(homeScreenDevice(FACEBOOK_IPHONE, 5)?.browser).toBe('in-app');
  });

  it('an iPad asking for the desktop site is still an iPad', () => {
    expect(homeScreenDevice(IPAD_DESKTOP_UA, 5)).toEqual({ device: 'ipad', browser: 'safari' });
  });

  it('a real Mac, Android and Windows get no guide', () => {
    expect(homeScreenDevice(IPAD_DESKTOP_UA, 0)).toBeNull();
    expect(homeScreenDevice(ANDROID_CHROME, 5)).toBeNull();
    expect(homeScreenDevice(WINDOWS_EDGE, 0)).toBeNull();
  });
});
