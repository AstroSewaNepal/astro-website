'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

import { AstroChakraImage } from '@/components/images';
import { type SignInError, signInErrorMessage } from '@/lib/auth/google-signin';
import { noteOutsideTrip } from '@/lib/navigation/outside-trip';

export type SignInRole = 'client' | 'astrologer';

/** Texts of the app's sign-in screen (ap signupRoleSelect), so both read the same. */
const TEXT = {
  title: 'Welcome to AstroSewa',
  subtitle: 'Live With Clarity',
  tabs: { client: 'Client', astrologer: 'Astrologer' },
  roleLine: { client: 'Begin your journey', astrologer: 'Offer your expertise' },
  continueWithGoogle: (role: string) => `Continue as ${role} with Google`,
  bySigningIn: 'By signing in, you agree to our',
  termsOfUse: 'Terms of use',
  and: 'and',
  privacyPolicy: 'Privacy Policy.',
  zeroTolerance:
    'AstroSewa has zero tolerance for abusive, hateful or sexually explicit content. You can report or block anyone, and accounts that break these rules are removed.',
  becomeAnAstrologer: 'Become an Astrologer?',
  clickHere: 'Click Here',
  continueAsGuest: 'Continue as guest',
};

const BACKEND_ROLE = { client: 'USER', astrologer: 'ASTROLOGER' } as const;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Client / astrologer sign-in, like the app: pick a role, accept the terms, continue with Google.
 * The backend needs the role to create a new account, so Google comes after this page (lib/auth/google-signin.ts).
 */
export function SignInPanel({
  initialRole,
  callbackUrl,
  error,
}: {
  initialRole: SignInRole;
  callbackUrl?: string;
  error?: SignInError;
}) {
  const [role, setRole] = useState<SignInRole>(initialRole);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Back from Google can restore this page as it was (back/forward cache): the button works again.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setSubmitting(false);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  // The message belongs to the attempt it came from; picking another tab is a new attempt.
  const [shownError, setShownError] = useState(error);

  return (
    <div className="w-full max-w-[520px]">
      <h1 className="text-center text-[32px] font-normal leading-tight text-primary lg:text-[44px]">
        {TEXT.title}
      </h1>
      <p className="mt-1 text-center font-mukta text-lg text-[#8a7a6a]">{TEXT.subtitle}</p>

      <Image
        src={AstroChakraImage}
        alt=""
        width={260}
        height={260}
        priority
        className="mx-auto mt-6 h-auto w-[200px] lg:w-[260px]"
      />

      <div
        role="tablist"
        aria-label="Sign in as"
        className="mt-6 grid grid-cols-2 rounded-full border border-primary/40 bg-white/60 p-1"
      >
        {(['client', 'astrologer'] as const).map(r => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => {
              setRole(r);
              setShownError(undefined);
            }}
            className={clsx(
              'rounded-full py-2.5 font-mukta text-lg transition-colors',
              role === r ? 'bg-primary text-white' : 'text-primary hover:bg-primary/5',
            )}
          >
            {TEXT.tabs[r]}
          </button>
        ))}
      </div>

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#611508]/25" />
        <span className="font-mukta text-lg text-[#6d6d6d]">{TEXT.roleLine[role]}</span>
        <span className="h-px flex-1 bg-[#611508]/25" />
      </div>

      {/* A plain form post: /login/google/start sets the state cookie and sends the browser on to Google. */}
      <form
        method="post"
        action="/login/google/start"
        onSubmit={() => {
          setSubmitting(true);
          // Back after signing in skips Google's pages (lib/navigation/outside-trip.ts).
          noteOutsideTrip('login');
        }}
      >
        <input type="hidden" name="role" value={BACKEND_ROLE[role]} />
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <button
          type="submit"
          disabled={!agreed || submitting}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-4 py-3.5 font-mukta text-base whitespace-nowrap text-white sm:px-6 sm:text-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <GoogleIcon />
          </span>
          {TEXT.continueWithGoogle(TEXT.tabs[role])}
        </button>
      </form>

      {shownError ? (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-primary/25 bg-[#fbf7ee] px-5 py-4 text-center font-mukta text-[15px] text-[#4a1a1a]"
        >
          {signInErrorMessage(shownError, role)}
        </div>
      ) : null}

      <label className="mt-6 flex cursor-pointer items-start gap-3 font-mukta text-[15px] text-[#4a1a1a]">
        <input
          type="checkbox"
          // Back to this page: browsers would tick it again from memory while the button still reads "not agreed".
          autoComplete="off"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#611508]"
        />
        <span>
          {TEXT.bySigningIn}{' '}
          <Link href="/terms-and-conditions" className="text-primary underline">
            {TEXT.termsOfUse}
          </Link>{' '}
          {TEXT.and}{' '}
          <Link href="/privacy-policy" className="text-primary underline">
            {TEXT.privacyPolicy}
          </Link>
        </span>
      </label>

      <p className="mt-4 font-mukta text-sm leading-relaxed text-[#8a7a6a]">{TEXT.zeroTolerance}</p>

      <div className="mt-7 flex flex-col items-center gap-3 font-mukta text-[15px]">
        {role === 'client' ? (
          <p className="text-[#4a1a1a]">
            {TEXT.becomeAnAstrologer}{' '}
            <button
              type="button"
              onClick={() => {
                setRole('astrologer');
                setShownError(undefined);
              }}
              className="text-primary underline"
            >
              {TEXT.clickHere}
            </button>
          </p>
        ) : null}
        <Link href="/" className="text-[#8a7a6a] underline">
          {TEXT.continueAsGuest}
        </Link>
      </div>
    </div>
  );
}
