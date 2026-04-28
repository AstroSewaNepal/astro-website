'use client';

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
import type { Session } from 'next-auth';

type AdminHeaderProps = {
  user: NonNullable<Session['user']>;
};

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0">
      <div>
        <h1 className="font-mukta text-lg font-medium text-neutral-800">Admin Dashboard</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-neutral-100 transition-colors outline-none">
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

        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 font-mukta text-red-600 cursor-pointer focus:text-red-600"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
