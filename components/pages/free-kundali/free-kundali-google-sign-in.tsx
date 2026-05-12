'use client';

import { useFormStatus } from 'react-dom';
import Image from 'next/image';

import GoogleGIcon from '@/components/images/icons/google_G.png';
import { signInWithGoogleForFreeKundali } from '@/app/free-kundali/actions';

type FreeKundaliGoogleSignInProps = {
  buttonClassName: string;
};

function GoogleSubmitButton({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
      >
        <Image src={GoogleGIcon} alt="" width={24} height={24} />
      </span>
      {pending ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}

/**
 * Starts Google OAuth via Next Auth and returns the user to `/free-kundali`.
 */
export function FreeKundaliGoogleSignIn({ buttonClassName }: FreeKundaliGoogleSignInProps) {
  return (
    <form action={signInWithGoogleForFreeKundali} className="contents">
      <GoogleSubmitButton className={buttonClassName} />
    </form>
  );
}
