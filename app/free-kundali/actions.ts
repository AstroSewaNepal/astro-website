'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';

export async function signInWithGoogleForFreeKundali() {
  try {
    await signIn('google', { redirectTo: '/free-kundali' });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/free-kundali?error=OAuthError');
    }
    throw error;
  }
}
