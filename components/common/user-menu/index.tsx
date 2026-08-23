'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UserMenuLink = {
  label: string;
  href: string;
};

type UserMenuProps = {
  user: UserMenuUser;
  extraLinks?: UserMenuLink[];
  signOutCallbackUrl?: string;
  align?: 'start' | 'end';
  triggerClassName?: string;
  contentClassName?: string;
};

export default function UserMenu({
  user,
  extraLinks = [],
  signOutCallbackUrl = '/login',
  align = 'end',
  triggerClassName = '',
  contentClassName = '',
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          'flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors outline-none ' +
          triggerClassName
        }
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.image ?? ''} alt={user.name ?? 'Admin'} />
          <AvatarFallback className="bg-[#611508] text-white text-xs font-mukta">
            {user.name?.charAt(0).toUpperCase() ?? 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-mukta font-medium text-neutral-800 leading-tight">
            {user.name ?? 'Admin'}
          </p>
          <p className="text-xs text-neutral-500 font-mukta leading-tight">{user.email}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className={'w-48 rounded-xl ' + contentClassName}>
        {extraLinks.map(link => (
          <DropdownMenuItem key={link.href} asChild className="gap-2 font-mukta cursor-pointer">
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 font-mukta text-red-600 cursor-pointer focus:text-red-600"
          onClick={() => signOut({ callbackUrl: signOutCallbackUrl })}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
