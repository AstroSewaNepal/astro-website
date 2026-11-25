'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import GoogleGIcon from '@/components/images/icons/google_G.png';
import { getAppDownloadUrl } from '@/lib/constants/app-store';
import { accountKind, signInAgainPath } from '@/lib/auth/account';

type FreeKundaliGoogleSignInProps = {
  buttonClassName: string;
  /** Which Astro Reports tab a logged-in client is sent to. */
  tab?: 'kundali' | 'match';
};

/**
 * The "lifetime access" card's button. Logged-in clients get every kundali and match saved (doc 12), so it opens
 * their Astro Reports; guests log in with Google and come back here. It used to send everyone to the app store,
 * which an iPhone user of the web app can't use. Astrologer accounts have no Astro Reports, so they keep that.
 */
export function FreeKundaliGoogleSignIn({
  buttonClassName,
  tab = 'kundali',
}: FreeKundaliGoogleSignInProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const kind = accountKind(session?.user?.roles);

  if (status === 'loading') {
    return <span className={buttonClassName} aria-hidden style={{ visibility: 'hidden' }} />;
  }

  if (kind === 'client') {
    return (
      <Link
        href={tab === 'match' ? '/client/reports?tab=match' : '/client/reports'}
        className={buttonClassName}
      >
        View my Astro Reports
      </Link>
    );
  }

  if (kind) {
    return (
      <a href={getAppDownloadUrl()} className={buttonClassName}>
        Download App
      </a>
    );
  }

  return (
    <Link href={signInAgainPath(pathname || '/free-kundali')} className={buttonClassName}>
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
      >
        <Image src={GoogleGIcon} alt="" width={24} height={24} />
      </span>
      Log in to save
    </Link>
  );
}
