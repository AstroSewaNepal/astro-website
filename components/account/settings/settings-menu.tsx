'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Check, ChevronRight, LogOut, Mail, ShieldCheck, Smartphone } from 'lucide-react';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import { HomeScreenGuide } from '@/components/pwa/home-screen-guide';
import { useHomeScreen } from '@/hooks/use-home-screen';
import type { PrivateKind } from '@/lib/account/nav';
import { settingsPaths } from '@/lib/account/settings';

const rowClass =
  'flex w-full items-center gap-4 py-4 font-app text-[19px] text-[#611508] lg:text-[20px]';

/**
 * Settings list (Figma Setting/Setting) with the app's items: Security, Change email, Sign out, plus the Add to Home
 * Screen guide on iPhones/iPads (always here, also after the home banner is closed). Astrologers get Security and
 * Change email with their own area (doc 17).
 */
export function SettingsMenu({ kind }: { kind: PrivateKind }) {
  const paths = settingsPaths(kind);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const homeScreen = useHomeScreen();
  const [guideOpen, setGuideOpen] = useState(false);

  const items =
    kind === 'client'
      ? [
          { label: 'Security', href: paths.security, icon: ShieldCheck },
          { label: 'Change Email', href: paths.changeEmail, icon: Mail },
        ]
      : [];

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
        {homeScreen ? (
          <li>
            <button type="button" onClick={() => setGuideOpen(true)} className={rowClass}>
              <Smartphone className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1 text-left">Add to Home Screen</span>
              {homeScreen.standalone ? (
                <span className="flex items-center gap-1 text-[15px] text-[#7a5a4a]">
                  <Check className="h-4 w-4" aria-hidden />
                  Added
                </span>
              ) : (
                <ChevronRight className="h-5 w-5" aria-hidden />
              )}
            </button>
          </li>
        ) : null}
        <li>
          <button type="button" onClick={() => setConfirmLogout(true)} className={rowClass}>
            <LogOut className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </li>
      </ul>

      {homeScreen ? (
        <HomeScreenGuide
          state={homeScreen}
          kind={kind}
          open={guideOpen}
          onOpenChange={setGuideOpen}
        />
      ) : null}
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
