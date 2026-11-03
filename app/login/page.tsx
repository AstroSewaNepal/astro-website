import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { SignInPanel } from '@/components/auth/sign-in-panel';
import { HeroSectionImage } from '@/components/images';
import { accountHome, safeReturnPath } from '@/lib/auth/account';
import { isSignInError } from '@/lib/auth/google-signin';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; role?: string; error?: string }>;
};

/** Client and astrologer sign-in (Figma login layout, app sign-in content). The admin login is at /admin. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  let session = null;
  try {
    session = await auth();
  } catch {
    // invalid / expired JWT: treat as logged out
  }
  const { callbackUrl, role, error } = await searchParams;
  if (session?.user) {
    redirect(safeReturnPath(callbackUrl, accountHome(session.user.roles)));
  }

  return (
    <section className="container mx-auto grid grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-0 lg:py-16">
      <div className="hidden justify-center lg:flex">
        <Image
          src={HeroSectionImage}
          alt=""
          width={480}
          height={480}
          className="h-auto w-full max-w-[480px] object-contain"
        />
      </div>
      <div className="flex justify-center lg:justify-end">
        <SignInPanel
          initialRole={role === 'astrologer' ? 'astrologer' : 'client'}
          callbackUrl={safeReturnPath(callbackUrl, '')}
          error={isSignInError(error) ? error : undefined}
        />
      </div>
    </section>
  );
}
