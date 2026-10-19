'use client';

import { useCallback } from 'react';
import Image from 'next/image';

import GoogleGIcon from '@/components/images/icons/google_G.png';
import { getAppDownloadUrl } from '@/lib/constants/app-store';

type FreeKundaliGoogleSignInProps = {
  buttonClassName: string;
};

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
