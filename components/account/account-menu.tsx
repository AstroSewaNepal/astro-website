'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, LogOut, Pencil } from 'lucide-react';
import clsx from 'clsx';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ACCOUNT_NAV, type AccountNavItem, type PrivateKind } from '@/lib/account/nav';

type AccountUser = { name?: string | null; email?: string | null; image?: string | null };

function UserAvatar({
  user,
  className,
  fallbackClassName = 'bg-white text-sm',
}: {
  user: AccountUser;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image ?? ''} alt="" />
      <AvatarFallback className={clsx('font-app font-semibold text-primary', fallbackClassName)}>
        {user.name?.charAt(0).toUpperCase() ?? '?'}
      </AvatarFallback>
    </Avatar>
  );
}

function DrawerItem({ item, onNavigate }: { item: AccountNavItem; onNavigate: () => void }) {
  const Icon = item.icon;
  const base = 'flex items-center gap-4 py-3 font-app text-[17px]';
  const body = (
    <>
      <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {item.soon ? <span className="text-xs text-[#8a7a6a]">Soon</span> : null}
    </>
  );
  if (item.soon) {
    return (
      <span aria-disabled className={clsx(base, 'text-[#611508]/45')}>
        {body}
      </span>
    );
  }
  return (
    <Link href={item.href} onClick={onNavigate} className={clsx(base, 'text-[#611508]')}>
      {body}
    </Link>
  );
}

/** Header "Profile" button for clients and astrologers; opens the app's drawer as a side sheet (Figma). */
export function AccountMenu({ kind, user }: { kind: PrivateKind; user: AccountUser }) {
  const [open, setOpen] = useState(false);
  const nav = ACCOUNT_NAV[kind];
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="flex h-[40px] items-center gap-2 rounded-3xl border border-solid border-primary bg-primary py-2 pl-[14px] pr-[6px] text-white lg:h-[44px] lg:pl-[18px]"
        style={{ borderWidth: '0.36px' }}
      >
        <span className="font-mukta text-sm leading-7 md:text-lg lg:text-xl">Profile</span>
        <UserAvatar user={user} className="h-7 w-7 lg:h-8 lg:w-8" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* Same look and motion as the header's hamburger menu: light dim, white panel, 300 ms slide (globals.css). */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/20 data-[state=closed]:animate-[drawer-fade-out_300ms_ease-out] data-[state=open]:animate-[drawer-fade-in_300ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-[71] flex w-[86vw] max-w-[340px] flex-col overflow-y-auto rounded-r-[28px] bg-white px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] outline-none data-[state=closed]:animate-[drawer-out_300ms_ease-out] data-[state=open]:animate-[drawer-in_300ms_ease-out] motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-app text-2xl text-[#611508]">
              Profile
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#611508]/10 text-[#611508] outline-none focus-visible:ring-2 focus-visible:ring-[#611508]"
            >
              <ChevronLeft className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <UserAvatar
              user={user}
              className="h-[72px] w-[72px] shrink-0"
              fallbackClassName="bg-[#611508]/10 text-2xl"
            />
            <div className="min-w-0">
              <p className="truncate font-app text-lg font-semibold text-[#4a1a1a]">{user.name}</p>
              <p className="truncate font-app text-sm text-[#b0726a]">{user.email}</p>
              <Link
                href={nav.profile.href}
                onClick={close}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 font-app text-sm text-white"
              >
                {nav.profile.label}
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          {nav.drawer.map((group, i) => (
            <ul key={i} className="mt-5 border-t border-dashed border-[#611508]/30 pt-2">
              {group.map(item => (
                <li key={item.href}>
                  <DrawerItem item={item} onNavigate={close} />
                </li>
              ))}
            </ul>
          ))}

          {/* Clients sign out from Settings, like the app. Astrologers keep this until their Settings page (with
              Sign out) is built: their side is still a placeholder. */}
          {kind === 'astrologer' ? (
            <div className="mt-5 border-t border-dashed border-[#611508]/30 pt-2">
              <button
                type="button"
                // Also ends the backend session (auth.ts events.signOut).
                onClick={() => signOut({ redirectTo: '/' })}
                className="flex w-full items-center gap-4 py-3 font-app text-[17px] text-red-700"
              >
                <LogOut className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                Log out
              </button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
