'use server';

import { signIn } from '@/auth';
import { safeReturnPath } from '@/lib/auth/account';
import { isAuthError } from '@/lib/auth/auth-error';

/** Admin email + password sign-in. Returns the error text to show, or redirects to the admin page that was asked for. */
export async function adminSignIn(
  _previous: string | null,
  formData: FormData,
): Promise<string | null> {
  const next = safeReturnPath(formData.get('next'), '/admin/dashboard');
  const inAdmin = next === '/admin' || next.startsWith('/admin/');
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: inAdmin ? next : '/admin/dashboard',
    });
  } catch (e) {
    if (isAuthError(e)) return 'Invalid username or password. Please try again.';
    throw e;
  }
  return null;
}
