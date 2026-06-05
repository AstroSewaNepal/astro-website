'use client';

import { useCallback } from 'react';
import Image from 'next/image';

import GoogleGIcon from '@/components/images/icons/google_G.png';

type FreeKundaliGoogleSignInProps = {
  buttonClassName: string;
};

const ANDROID_STORE_URL = 'https://play.google.com/store/search?q=Astro%20Sewa&c=apps';
const IOS_STORE_URL = 'https://apps.apple.com/us/search?term=Astro%20Sewa';
const DESKTOP_DOWNLOAD_PAGE = '/download-app';

function getAppDownloadUrl(): string {
  if (typeof navigator === 'undefined') {
    return DESKTOP_DOWNLOAD_PAGE;
  }

  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const userAgent = navigator.userAgent || '';
  const isAndroid = /android/i.test(userAgent) || /android/i.test(platform);
  const isIos =
    /iphone|ipad|ipod/i.test(userAgent) ||
    /iphone|ipad|ipod/i.test(platform) ||
    (/macintosh/i.test(userAgent) && 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 1);

  if (isAndroid) return ANDROID_STORE_URL;
  if (isIos) return IOS_STORE_URL;
  return DESKTOP_DOWNLOAD_PAGE;
}

function GoogleSubmitButton({ className }: { className: string }) {
  const handleClick = useCallback(() => {
    window.location.href = getAppDownloadUrl();
  }, []);

  return (
    <button type="button" onClick={handleClick} className={className}>
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
      >
        <Image src={GoogleGIcon} alt="" width={24} height={24} />
      </span>
      Download App
    </button>
  );
}

export function FreeKundaliGoogleSignIn({ buttonClassName }: FreeKundaliGoogleSignInProps) {
  return <GoogleSubmitButton className={buttonClassName} />;
}
