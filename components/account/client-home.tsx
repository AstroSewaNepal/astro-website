'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, UsersRound } from 'lucide-react';

import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import { useBackendClient } from '@/hooks/use-backend-client';
import { profilePath } from '@/lib/astrologers/list';
import { tierLabel, tierStyle } from '@/lib/astrologers/profile';

// Home shows no prices, so like the app it asks for Nepal right away instead of waiting for the buyer's country.
const HOME_COUNTRY = 'NP';
const LIMIT = 10;

/** The app's free services on Home (Calendar is hidden there too). Astro Reports opens with doc 12. */
const FREE_SERVICES = [
  { label: 'Horoscope', href: '/horoscope', icon: '/images/client-home/horoscope.png' },
  { label: 'Kundali Chart', href: '/free-kundali', icon: '/images/client-home/kundali.png' },
  { label: 'Matchmaking', href: '/kundali-matching', icon: '/images/client-home/matchmaking.png' },
  {
    label: 'Astro Reports',
    href: '/client/reports',
    icon: '/images/client-home/astro-reports.png',
  },
];

const WHY = [
  { label: 'Private & Confidential', icon: '/images/client-home/private.png' },
  { label: 'Verified Astrologers', icon: '/images/client-home/verified.png' },
  { label: 'Secured Payment', icon: '/images/client-home/secure-payment.png' },
];

const sectionTitle = 'font-mukta text-[20px] font-semibold text-[#4a1a1a] lg:text-[22px]';
const viewAll = 'font-mukta text-[15px] text-primary underline-offset-2 hover:underline';

/** Client home, as the app's HomeContent: online astrologers, free services, recommended astrologers, why us. */
export function ClientHome({ firstName }: { firstName?: string }) {
  const backend = useBackendClient();
  const list = (online: boolean) =>
    backend.get<Astrologer[]>(
      `/astrologer-details?page=1&limit=${LIMIT}&countryCode=${HOME_COUNTRY}${online ? '&isOnline=true' : ''}`,
    );
  // Separate query, as the app: the recommended list is the top 10 by rating, so it can miss someone who is online.
  const online = useQuery({
    queryKey: ['astrologers', 'home', 'online'],
    queryFn: () => list(true),
  });
  const recommended = useQuery({
    queryKey: ['astrologers', 'home', 'recommended'],
    queryFn: () => list(false),
  });

  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-normal text-primary lg:text-[34px]">
          {firstName ? `Namaste, ${firstName}` : 'Namaste'}
        </h1>
        <HomeSearch />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className={`${sectionTitle} flex items-center gap-2`}>
            Online Astrologers
            {online.data ? (
              <span className="flex items-center gap-1 rounded-full bg-[#720A0B]/10 px-2 py-0.5 text-sm text-primary">
                <UsersRound className="h-3.5 w-3.5" aria-hidden />
                {online.data.length}
              </span>
            ) : null}
          </h2>
          <Link href="/astrologers" className={viewAll}>
            View all
          </Link>
        </div>
        {online.isPending ? (
          <AvatarRowSkeleton />
        ) : online.data?.length ? (
          <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {online.data.map(a => (
              <li key={a._id} className="w-[80px] shrink-0">
                <AstrologerLink
                  astrologer={a}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Avatar astrologer={a} size={72} online={a.status === 'ONLINE'} />
                  <span className="line-clamp-1 w-full font-mukta text-[14px] text-[#4a1a1a]">
                    {name(a)}
                  </span>
                </AstrologerLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 rounded-2xl border border-dashed border-[#c9837a] px-4 py-5 font-mukta text-[15px] text-[#8a5a52]">
            <UsersRound className="h-5 w-5" aria-hidden />
            No one&apos;s online right now
          </p>
        )}
      </section>

      <section>
        <h2 className={`${sectionTitle} mb-3`}>Free Services</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FREE_SERVICES.map(s => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex h-full flex-col items-center gap-3 rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] px-3 py-5 text-center transition-colors hover:bg-[#f6ecdc]"
              >
                <Image
                  src={s.icon}
                  alt=""
                  width={80}
                  height={64}
                  className="h-16 w-auto object-contain"
                />
                <span className="font-mukta text-[16px] font-semibold text-primary">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className={sectionTitle}>Recommended Astrologers</h2>
          <Link href="/astrologers" className={viewAll}>
            View all
          </Link>
        </div>
        {recommended.isPending ? (
          <AvatarRowSkeleton cards />
        ) : recommended.data?.length ? (
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {recommended.data.map(a => {
              const tier = tierLabel(a.tier?.name);
              const style = tierStyle(a.tier?.name);
              return (
                <li key={a._id} className="w-[132px] shrink-0">
                  <AstrologerLink
                    astrologer={a}
                    className="flex h-full flex-col items-center gap-2 rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] px-3 pb-4 pt-5 text-center"
                  >
                    <Avatar astrologer={a} size={84} />
                    <span className="line-clamp-1 w-full font-mukta text-[15px] font-semibold text-[#4a1a1a]">
                      {name(a)}
                    </span>
                    {tier ? (
                      <span
                        className="rounded-full px-2.5 py-0.5 font-mukta text-xs font-semibold"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {tier}
                      </span>
                    ) : null}
                  </AstrologerLink>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#c9837a] px-4 py-5 font-mukta text-[15px] text-[#8a5a52]">
            No astrologers recommended right now
          </p>
        )}
      </section>

      <section>
        <h2 className={`${sectionTitle} mb-3`}>Why Astro Sewa</h2>
        <ul className="grid grid-cols-3 gap-3">
          {WHY.map(w => (
            <li
              key={w.label}
              className="flex flex-col items-center gap-3 rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] px-2 py-5 text-center"
            >
              <Image
                src={w.icon}
                alt=""
                width={64}
                height={52}
                className="h-12 w-auto object-contain"
              />
              <span className="font-mukta text-[14px] font-semibold leading-tight text-primary sm:text-[16px]">
                {w.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const name = (a: Astrologer) => a.user?.fullName?.trim() || 'Astrologer';

function AstrologerLink({
  astrologer,
  className,
  children,
}: {
  astrologer: Astrologer;
  className: string;
  children: React.ReactNode;
}) {
  const id = astrologer.user?._id;
  if (!id) return <div className={className}>{children}</div>;
  return (
    <Link href={profilePath(id)} className={className}>
      {children}
    </Link>
  );
}

function Avatar({
  astrologer,
  size,
  online,
}: {
  astrologer: Astrologer;
  size: number;
  online?: boolean;
}) {
  const photo =
    astrologer.user?.profilePicture?.thumbnail?.url || astrologer.user?.profilePicture?.url;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#f1d9d2] font-mukta text-2xl font-semibold text-primary ring-2 ring-[#e8dcc8]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          name(astrologer).charAt(0).toUpperCase()
        )}
      </span>
      {online ? (
        <span
          className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#fbf6ee] bg-[#34C759]"
          aria-label="Online"
        />
      ) : null}
    </span>
  );
}

/** Opens Astro Connect with the search filled in (the app's quick search has no working search yet). */
function HomeSearch() {
  const router = useRouter();
  const [text, setText] = useState('');
  return (
    <form
      role="search"
      className="relative mt-4"
      onSubmit={e => {
        e.preventDefault();
        const q = text.trim();
        router.push(q ? `/astrologers?q=${encodeURIComponent(q)}` : '/astrologers');
      }}
    >
      <label htmlFor="home-search" className="sr-only">
        Search astrologers
      </label>
      <input
        id="home-search"
        type="search"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Search astrologers"
        enterKeyHint="search"
        className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-12 font-mukta text-[16px] text-[#4a1a1a] outline-none focus:border-primary"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-primary"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

function AvatarRowSkeleton({ cards = false }: { cards?: boolean }) {
  return (
    <div className="flex gap-4 overflow-hidden" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className={
            cards
              ? 'h-[170px] w-[132px] shrink-0 animate-pulse rounded-[20px] bg-[#efe6da]'
              : 'h-[72px] w-[72px] shrink-0 animate-pulse rounded-full bg-[#efe6da]'
          }
        />
      ))}
    </div>
  );
}
