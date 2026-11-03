import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { openHandoff, reactivationCookie } from '@/lib/auth/reactivation';

export const metadata: Metadata = {
  title: 'Reactivate your account',
  robots: { index: false, follow: false },
};

/** Texts of the app's reactivation prompt (ap settings:deleteAccount.reactivationPrompt). */
const TEXT = {
  title: 'Your Account is Pending Deletion',
  message:
    'Your account is scheduled for permanent deletion. Would you like to reactivate it and restore full access?',
  reactivate: 'Reactivate Account',
  signOut: 'Sign Out',
};

/** Shown after a Google sign-in to an account scheduled for deletion; nothing is signed in until they answer. */
export default async function ReactivatePage() {
  const jar = await cookies();
  const sealed = (jar.get(reactivationCookie(true)) ?? jar.get(reactivationCookie(false)))?.value;
  if (!(await openHandoff(sealed))) redirect('/login?error=signin_expired');

  return (
    <section className="container mx-auto flex justify-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-[520px] rounded-3xl border border-primary/25 bg-[#fbf7ee] px-6 py-8 text-center sm:px-10">
        <h1 className="text-[28px] font-normal leading-tight text-primary lg:text-[34px]">
          {TEXT.title}
        </h1>
        <p className="mt-4 font-mukta text-[17px] text-[#4a1a1a]">{TEXT.message}</p>
        <form method="post" action="/login/reactivate/confirm" className="mt-8 flex flex-col gap-3">
          <button
            type="submit"
            name="choice"
            value="reactivate"
            className="w-full rounded-full bg-primary px-6 py-3.5 font-mukta text-lg text-white"
          >
            {TEXT.reactivate}
          </button>
          <button
            type="submit"
            name="choice"
            value="sign_out"
            className="w-full rounded-full border border-primary px-6 py-3.5 font-mukta text-lg text-primary"
          >
            {TEXT.signOut}
          </button>
        </form>
      </div>
    </section>
  );
}
