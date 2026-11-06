import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarCheck,
  Gem,
  Headset,
  History,
  House,
  Radio,
  ScrollText,
  Settings,
  Sparkles,
  UsersRound,
  Wallet,
} from 'lucide-react';

import {
  AstrologersTabIcon,
  ChatTabIcon,
  EarningsTabIcon,
  HomeTabIcon,
  LiveTabIcon,
  RemediesTabIcon,
  SettingsTabIcon,
} from '@/components/account/tab-icons';
import type { AccountKind } from '@/lib/auth/account';

/**
 * Menus of the logged-in area, taken from the app (scope rule: only what the app does) in the Figma layout.
 * `soon` items have no page yet: they show greyed out until their feature doc ships, then drop the flag.
 */
export type AccountNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Bottom tabs use the app's own tab bar icon instead. */
  tabIcon?: ComponentType<{ className?: string; active?: boolean }>;
  soon?: boolean;
};

export type AccountNav = {
  /** Phone bottom tabs: the app's tab bar, same order and icons. */
  tabs: AccountNavItem[];
  /** Desktop left sidebar, one array per group (dotted line between groups). */
  sidebar: AccountNavItem[][];
  /** The Profile drawer from the header button (the app's drawer). */
  drawer: AccountNavItem[][];
  /** Edit / view profile link under the name in the drawer. */
  profile: { label: string; href: string };
};

export type PrivateKind = Exclude<AccountKind, 'admin'>;

const home = (href: string): AccountNavItem => ({ label: 'Home', href, icon: House });

const c = {
  astroConnect: { label: 'Astro Connect', href: '/astrologers', icon: Sparkles },
  live: { label: 'Live', href: '/live', icon: Radio, soon: true },
  remedies: { label: 'Remedies', href: '/remedies', icon: Gem, soon: true },
  consultations: { label: 'My Consultations', href: '/client/consultations', icon: History },
  following: { label: 'My Following', href: '/client/following', icon: UsersRound },
  payments: { label: 'My Payments', href: '/client/payments', icon: Wallet },
  reports: { label: 'Astro Reports', href: '/client/reports', icon: ScrollText },
  freeServices: { label: 'Free Services', href: '/free-services', icon: CalendarCheck, soon: true },
  support: { label: 'Customer Support', href: '/client/support', icon: Headset },
  settings: { label: 'Settings', href: '/client/settings', icon: Settings },
} satisfies Record<string, AccountNavItem>;

const a = {
  analytics: { label: 'Analytics', href: '/astrologer/analytics', icon: BarChart3 },
  consultations: { label: 'My Consultations', href: '/astrologer/consultations', icon: History },
  earnings: { label: 'My Earnings', href: '/astrologer/earnings', icon: Wallet },
  remedies: { label: 'My Remedies', href: '/astrologer/remedies', icon: Gem },
  support: { label: 'Customer Support', href: '/astrologer/support', icon: Headset },
  settings: { label: 'Settings', href: '/astrologer/settings', icon: Settings },
} satisfies Record<string, AccountNavItem>;

export const ACCOUNT_NAV: Record<PrivateKind, AccountNav> = {
  client: {
    tabs: [
      { ...home('/client'), tabIcon: HomeTabIcon },
      { ...c.astroConnect, label: 'Astrologers', tabIcon: AstrologersTabIcon },
      { ...c.live, tabIcon: LiveTabIcon },
      { ...c.consultations, label: 'Consultations', tabIcon: ChatTabIcon },
      { ...c.remedies, tabIcon: RemediesTabIcon },
    ],
    sidebar: [
      [home('/client'), c.astroConnect, c.live, c.remedies, c.consultations],
      [c.following, c.payments, c.reports, c.freeServices],
      [c.support, c.settings],
    ],
    drawer: [
      [c.following, c.freeServices, c.payments, c.reports, c.consultations],
      [c.support, c.settings],
    ],
    profile: { label: 'Edit Profile', href: '/client/profile' },
  },
  astrologer: {
    tabs: [
      { ...home('/astrologer'), tabIcon: HomeTabIcon },
      { ...a.consultations, label: 'Consultations', tabIcon: ChatTabIcon },
      { ...a.earnings, label: 'Earnings', tabIcon: EarningsTabIcon },
      { ...a.remedies, label: 'Remedies', tabIcon: RemediesTabIcon },
      { ...a.settings, tabIcon: SettingsTabIcon },
    ],
    sidebar: [
      [home('/astrologer'), a.analytics, a.consultations, a.earnings, a.remedies],
      [a.support, a.settings],
    ],
    drawer: [[a.analytics, a.consultations, a.support]],
    profile: { label: 'View Profile', href: '/astrologer/profile' },
  },
};

/** /client and /astrologer pages (not the public /astrologer-profile/... pages). */
export function isAccountPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return ['/client', '/astrologer'].some(
    root => pathname === root || pathname.startsWith(`${root}/`),
  );
}

/**
 * Public pages that a logged-in client sees inside their account shell (sidebar + bottom tabs), like the app's tabs.
 * Guests see them in the plain site layout.
 */
const CLIENT_SHELL_PAGES = ['/astrologers', '/astrologer-profile'];

export function isClientShellPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return CLIENT_SHELL_PAGES.some(root => pathname === root || pathname.startsWith(`${root}/`));
}

/**
 * Pages that belong under another page of the area: a profile is opened from the Astro Connect list, its packages
 * from the profile, and schedule appointment from the packages.
 */
const PARENT_PAGES: { pattern: RegExp; parent: (match: RegExpMatchArray) => string }[] = [
  { pattern: /^\/astrologer-profile\/[^/]+$/, parent: () => '/astrologers' },
  { pattern: /^(\/astrologer-profile\/[^/]+)\/schedule$/, parent: m => `${m[1]}/packages` },
];

/**
 * Where "back" goes, or null on first-level pages (no back there: the sidebar or the tabs/drawer cover them):
 * the known parent, else one level up (/client/settings/security -> /client/settings).
 */
export function parentPage(pathname: string): string | null {
  for (const { pattern, parent } of PARENT_PAGES) {
    const match = pathname.match(pattern);
    if (match) return parent(match);
  }
  const parts = pathname.split('/').filter(Boolean);
  return parts.length > 2 ? `/${parts.slice(0, -1).join('/')}` : null;
}

/** Page title for a path in the logged-in area (sidebar labels first: tab labels are shortened). */
export function accountPageTitle(kind: PrivateKind, pathname: string): string | null {
  const nav = ACCOUNT_NAV[kind];
  if (pathname === nav.profile.href) return nav.profile.label;
  const items = [...nav.sidebar.flat(), ...nav.drawer.flat(), ...nav.tabs];
  return items.find(item => item.href === pathname)?.label ?? null;
}
