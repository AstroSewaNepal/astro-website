'use client';

import { useActionState } from 'react';
import { usePathname } from 'next/navigation';

import SignInButton from '@/components/ui/sign-in-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminSignIn } from './actions';
import PasswordInput from './PasswordInput';

/**
 * Shown by the admin layout on any /admin page while nobody is logged in. Not linked from the public site:
 * the boss types /admin. After sign-in the page that was opened loads.
 */
export default function AdminLogin() {
  const pathname = usePathname();
  const [error, formAction] = useActionState(adminSignIn, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3df]">
      <Card className="w-full max-w-md mx-4 shadow-xl rounded-2xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#611508' }}
            >
              <span className="text-[#F8F3DF] font-mukta text-xl font-bold">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-mukta text-neutral-800">Admin Sign In</CardTitle>
          <CardDescription className="font-mukta text-neutral-500">
            Access the Astro Sewa admin panel
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-mukta">
              {error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="next" value={pathname ?? '/admin'} />
            <div className="space-y-1.5">
              <Label htmlFor="username" className="font-mukta text-neutral-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter admin username"
                required
                className="rounded-xl border-neutral-200 font-mukta focus-visible:ring-[#611508] focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mukta text-neutral-700">
                Password
              </Label>
              <PasswordInput />
            </div>

            <SignInButton
              type="submit"
              className="bg-[#611508] w-full md:rounded-xl md:py-5 lg:w-full"
            >
              Sign In
            </SignInButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
