'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ChevronRight, LogOut, Mail, ShieldCheck } from 'lucide-react';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import type { PrivateKind } from '@/lib/account/nav';
import { settingsPaths } from '@/lib/account/settings';

const rowClass =
  'flex w-full items-center gap-4 py-4 font-mukta text-[19px] text-[#611508] lg:text-[20px]';

/** Settings list (Figma Setting/Setting) with the app's items: Security, Change email, Sign out. */
export function SettingsMenu({ kind }: { kind: PrivateKind }) {
  const paths = settingsPaths(kind);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const items = [
    { label: 'Security', href: paths.security, icon: ShieldCheck },
    { label: 'Change Email', href: paths.changeEmail, icon: Mail },
  ];

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <h1 className="mb-4 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Settings
      </h1>
      <ul className="divide-y divide-dashed divide-[#611508]/25">
        {items.map(item => (
          <li key={item.href}>
            <Link href={item.href} className={rowClass}>
              <item.icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setConfirmLogout(true)} className={rowClass}>
            <LogOut className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </li>
      </ul>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out?"
        message="Are you sure you want to log out of your account? You can log back in anytime."
        cancelText="No"
        busy={leaving}
        onConfirm={() => {
          setLeaving(true);
          // Also ends the backend session (auth.ts events.signOut).
          void signOut({ redirectTo: '/' });
        }}
      />
    </div>
  );
}
