'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

import { ACCOUNT_NAV, type AccountNavItem, type PrivateKind } from '@/lib/account/nav';

/** Home is active only on itself; other items also cover their sub-pages. */
function isActive(pathname: string, item: AccountNavItem, homeHref: string) {
  if (item.href === homeHref) return pathname === homeHref;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarItem({ item, active }: { item: AccountNavItem; active: boolean }) {
  const Icon = item.icon;
  const body = (
    <>
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {item.soon ? <span className="text-xs text-[#8a7a6a]">Soon</span> : null}
    </>
  );
  const base = 'flex items-center gap-4 rounded-full px-5 py-2.5 font-mukta text-[17px]';
  if (item.soon) {
    return (
      <span aria-disabled className={clsx(base, 'cursor-default text-[#611508]/45')}>
        {body}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        base,
        active ? 'bg-primary text-white' : 'text-[#4a1a1a] hover:bg-[#611508]/[0.06]',
      )}
    >
      {body}
    </Link>
  );
}

function TabItem({ item, active }: { item: AccountNavItem; active: boolean }) {
  const Icon = item.icon;
  const TabIcon = item.tabIcon;
  const body = (
    <>
      {TabIcon ? (
        <TabIcon className="h-6 w-6" active={active} />
      ) : (
        <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      )}
      <span className="max-w-full truncate text-[11px] leading-4">{item.label}</span>
    </>
  );
  const base = 'flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 font-mukta';
  if (item.soon) {
    return (
      <span aria-disabled className={clsx(base, 'text-[#BE7B71]/50')}>
        {body}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      // The app's tab colours (primary800 / primary400).
      className={clsx(base, active ? 'text-[#720A0B]' : 'text-[#BE7B71]')}
    >
      {body}
    </Link>
  );
}

/**
 * Logged-in area inside the site header/footer (Figma): left sidebar on desktop, the app's bottom tabs on phones.
 * The phone tab bar is fixed; SiteChrome adds the matching bottom padding so the footer isn't covered.
 */
export function AccountShell({ kind, children }: { kind: PrivateKind; children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const nav = ACCOUNT_NAV[kind];
  const homeHref = nav.tabs[0].href;
  const onHome = pathname === homeHref;
  // Sub-pages (/client/settings/security) go back to their parent page; first-level pages go Home.
  const parts = pathname.split('/').filter(Boolean);
  const backHref = parts.length > 2 ? `/${parts.slice(0, -1).join('/')}` : homeHref;

  return (
    <div className="container mx-auto flex w-full min-w-0 flex-1 gap-10 px-4 pb-12 lg:px-0">
      <aside className="hidden w-[300px] shrink-0 lg:block" aria-label="Account menu">
        <nav className="sticky top-6 flex flex-col">
          {nav.sidebar.map((group, i) => (
            <ul
              key={i}
              className={clsx(
                'flex flex-col gap-1 py-3',
                i > 0 && 'border-t border-dashed border-[#611508]/30',
              )}
            >
              {group.map(item => (
                <li key={item.href}>
                  <SidebarItem item={item} active={isActive(pathname, item, homeHref)} />
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 py-3">
        {!onHome ? (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1 font-mukta text-[15px] text-[#4a1a1a] lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
            back
          </Link>
        ) : null}
        {children}
      </main>

      <nav
        aria-label="Account tabs"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8ddd0] bg-[#fbf7ee] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(92,56,23,0.08)] lg:hidden"
      >
        <div className="mx-auto flex max-w-xl px-1">
          {nav.tabs.map(item => (
            <TabItem key={item.href} item={item} active={isActive(pathname, item, homeHref)} />
          ))}
        </div>
      </nav>
    </div>
  );
}
