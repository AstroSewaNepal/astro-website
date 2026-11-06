'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  CalendarSearch,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import { PillTabs } from '@/components/booking/pill-tabs';
import { useBackendClient } from '@/hooks/use-backend-client';
import { profilePath } from '@/lib/astrologers/list';
import {
  CONSULTATION_TABS,
  astrologerShown,
  consultationLines,
  consultationsPath,
  defaultSort,
  planFilter,
  priceChip,
  searchPath,
  sessionNumbers,
  PAGE_LIMIT,
  type Consultation,
  type ConsultationTab,
} from '@/lib/booking/consultations';
import { packagesPath, planLabel, planSchedulePath } from '@/lib/booking/packages';
import {
  paidLabel,
  planAction,
  shortDate,
  subscriptionNumbers,
  type UserSubscription,
} from '@/lib/booking/subscriptions';

const SEARCH_DELAY_MS = 400;

/**
 * The app's My Consultations (client): Upcoming and Completed sessions, and the Subscription tab with the plans the
 * buyer owns. Used-up plans also head the Completed tab, as in the app.
 */
export function MyConsultations({ initialTab }: { initialTab: ConsultationTab }) {
  const backend = useBackendClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [tab, setTab] = useState<ConsultationTab>(initialTab);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const switchTab = (next: ConsultationTab) => {
    setTab(next);
    // Keeps the tab on refresh and on back from a profile; the history API skips a server render.
    window.history.replaceState(null, '', consultationsPath(next));
  };

  const listTab = tab === 'subscription' ? null : tab;
  const sort = defaultSort(tab);
  const list = useInfiniteQuery({
    queryKey: ['consultations', 'list', userId, listTab, search, sort],
    queryFn: ({ pageParam }) =>
      backend.get<Consultation[]>(
        searchPath(userId!, { tab: listTab!, page: pageParam, search, sort }),
      ),
    initialPageParam: 1,
    getNextPageParam: (last, all) =>
      Array.isArray(last) && last.length === PAGE_LIMIT ? all.length + 1 : undefined,
    enabled: !!userId && !!listTab,
    placeholderData: keepPreviousData,
  });

  const filter = planFilter(tab);
  const plans = useQuery({
    queryKey: ['consultations', 'plans', userId, filter],
    queryFn: () =>
      backend.get<UserSubscription[]>(`/consultation-subscriptions/me?status=${filter}`),
    enabled: !!userId && !!filter,
  });
  // Every plan, only to number them ("Subscription #2") the same on each tab, like the app.
  const allPlans = useQuery({
    queryKey: ['consultations', 'plans', userId, 'all'],
    queryFn: () => backend.get<UserSubscription[]>('/consultation-subscriptions/me?limit=100'),
    enabled: !!userId,
  });

  const numbers = useMemo(() => subscriptionNumbers(allPlans.data ?? []), [allPlans.data]);
  const planById = useMemo(
    () => new Map((allPlans.data ?? []).map(p => [p.id, p])),
    [allPlans.data],
  );
  // keepPreviousData would show the last tab's rows on the Subscription tab: it has none of its own.
  const items = useMemo(
    () => (listTab ? (list.data?.pages ?? []).flatMap(p => (Array.isArray(p) ? p : [])) : []),
    [list.data, listTab],
  );
  const ordinals = useMemo(
    () => (listTab ? sessionNumbers(items, listTab, planById) : new Map<string, number>()),
    [items, listTab, planById],
  );
  const shownPlans = filter && Array.isArray(plans.data) ? plans.data : [];

  // Infinite scroll, as Astro Connect.
  const end = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  useEffect(() => {
    const node = end.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const loading =
    !userId || (listTab ? list.isPending : false) || (filter ? plans.isPending : false);
  const failed = (listTab && list.isError) || (filter && plans.isError);
  const empty = !loading && !failed && items.length === 0 && shownPlans.length === 0;

  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-4 text-[28px] font-normal text-primary lg:text-[34px]">My Consultations</h1>

      {tab !== 'subscription' ? (
        <label className="relative mb-4 block lg:max-w-[520px]">
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search"
            enterKeyHint="search"
            className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-12 font-app text-[16px] text-[#4a1a1a] outline-none focus:border-primary"
          />
          {searchText ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          )}
        </label>
      ) : null}

      <PillTabs
        tabs={CONSULTATION_TABS}
        active={tab}
        onChange={switchTab}
        label="Consultations"
        className="mb-5 lg:max-w-[520px]"
      />

      {loading ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : failed ? (
        <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
          <p>We could not load your consultations.</p>
          <button
            type="button"
            onClick={() => {
              if (listTab) void list.refetch();
              if (filter) void plans.refetch();
            }}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <CalendarSearch className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-app text-[18px] font-semibold text-[#4a1a1a]">
            {tab === 'subscription'
              ? 'No Active Subscriptions'
              : search
                ? 'No consultations match your search'
                : 'No Consultation Found'}
          </p>
          <p className="font-app text-[15px] text-[#6d6d6d]">
            {tab === 'subscription'
              ? 'Your active subscription plans will appear here.'
              : 'Consultation history will be available here.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {shownPlans.map(p => (
            <li key={p.id}>
              <PlanCard plan={p} number={numbers.get(p.id) ?? 1} />
            </li>
          ))}
          {items.map(c => (
            <li key={c._id}>
              <ConsultationCard
                consultation={c}
                completed={tab === 'completed'}
                planNumber={c.subscriptionId ? (numbers.get(c.subscriptionId) ?? 1) : null}
                sessionNumber={ordinals.get(c._id) ?? null}
              />
            </li>
          ))}
        </ul>
      )}

      <div ref={end} aria-hidden />
      {isFetchingNextPage ? (
        <div className="flex justify-center py-6" role="status" aria-label="Loading more">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : listTab && hasNextPage ? (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="rounded-full bg-primary px-6 py-2.5 font-app text-[16px] text-white"
          >
            Show more
          </button>
        </div>
      ) : null}
    </div>
  );
}

const cardClass = 'relative h-full rounded-lg border border-[#BE7B71] bg-[#F8F3DF] p-3';
const outlineButton =
  'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary font-raleway text-[15px] font-medium text-primary disabled:opacity-50';
const solidButton =
  'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary font-raleway text-[15px] font-medium text-[#F8F3DF] disabled:opacity-50';

function Avatar({
  name,
  photo,
  href,
}: {
  name: string;
  photo: string | null;
  href: string | null;
}) {
  const body = (
    <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f1d9d2] font-app text-2xl font-semibold text-primary">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
  return href ? (
    <Link href={href} aria-label={`View ${name}'s profile`} className="shrink-0">
      {body}
    </Link>
  ) : (
    body
  );
}

function Line({ icon: Icon, children }: { icon: typeof Video; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-app text-[13px] font-bold text-[#1C1C1C]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {children}
    </span>
  );
}

/** The app's SubscriptionEntitlementCard. */
function PlanCard({ plan, number }: { plan: UserSubscription; number: number }) {
  const name = plan.astrologer?.fullName?.trim() || 'Astrologer';
  const photo =
    plan.astrologer?.profilePicture?.thumbnail?.url || plan.astrologer?.profilePicture?.url || null;
  const action = planAction(plan);
  const profile = profilePath(plan.astrologerId);
  return (
    <article className={cardClass}>
      <div className="flex gap-2">
        <Avatar name={name} photo={photo} href={profile} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={profile}
            className="mb-1 truncate font-app text-[16px] font-semibold text-primary"
          >
            {name}
          </Link>
          <Line icon={Video}>
            Subscription #{number} - {plan.plan.consultationMinutes} min consultation
          </Line>
          <Line icon={CalendarDays}>
            {planLabel(plan.plan.durationMonths)} • Ends {shortDate(plan.endAt)}
          </Line>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Line icon={Clock3}>
              {plan.usedConsultations} of {plan.totalConsultations} used
            </Line>
            {plan.amountPaid ? (
              <span className="rounded-full bg-primary px-2.5 py-1 font-app text-[12px] font-bold text-[#F8F3DF]">
                {paidLabel(plan.amountPaid)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-2 border-t border-[#BE7B71]/40 pt-2">
        <Link href={profile} className={outlineButton}>
          <UserRound className="h-[18px] w-[18px]" aria-hidden />
          View Profile
        </Link>
        {action.kind === 'schedule' ? (
          <Link href={planSchedulePath(plan.astrologerId, plan.id)} className={solidButton}>
            <CalendarDays className="h-[18px] w-[18px]" aria-hidden />
            {action.label}
          </Link>
        ) : action.kind === 'bookAgain' ? (
          <Link href={packagesPath(plan.astrologerId, 'subscription')} className={solidButton}>
            <CalendarDays className="h-[18px] w-[18px]" aria-hidden />
            {action.label}
          </Link>
        ) : (
          <button type="button" disabled className={solidButton}>
            <CalendarDays className="h-[18px] w-[18px]" aria-hidden />
            {action.label}
          </button>
        )}
      </div>
    </article>
  );
}

/** The app's SuccessCard on My Consultations (its "reschedule" and "completed" kinds). */
function ConsultationCard({
  consultation: c,
  completed,
  planNumber,
  sessionNumber,
}: {
  consultation: Consultation;
  completed: boolean;
  planNumber: number | null;
  sessionNumber: number | null;
}) {
  const { name, photo, gone } = astrologerShown(c);
  const profile = gone ? null : profilePath(c.astrologerId);
  const chip = sessionNumber ? `Consultation ${sessionNumber}` : priceChip(c.package);
  const icons = { video: Video, date: CalendarDays, time: Clock3 } as const;

  return (
    <article className={cardClass}>
      <div className="flex gap-2">
        <Avatar name={name} photo={photo} href={profile} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {profile ? (
            <Link
              href={profile}
              className="mb-1 truncate font-app text-[16px] font-semibold text-primary"
            >
              {name}
            </Link>
          ) : (
            <span className="mb-1 truncate font-app text-[16px] font-semibold text-primary">
              {name}
            </span>
          )}
          {planNumber ? (
            <span className="font-app text-[13px] font-bold text-primary">
              Subscription #{planNumber}
            </span>
          ) : null}
          {consultationLines(c).map(line => (
            <Line key={line.icon} icon={icons[line.icon]}>
              {line.text}
            </Line>
          ))}
        </div>
        {chip ? (
          <span
            className={clsx(
              'self-end whitespace-nowrap rounded-full bg-primary px-2.5 py-1 font-app font-semibold text-[#F8F3DF]',
              sessionNumber ? 'text-[11px]' : 'text-[13px]',
            )}
          >
            {chip}
          </span>
        ) : null}
      </div>

      {gone ? null : (
        <div className="mt-2 flex gap-2 border-t border-[#BE7B71]/40 pt-2">
          {completed ? (
            <>
              {c.reviewId ? (
                <Link href={profile!} className={outlineButton}>
                  <UserRound className="h-[18px] w-[18px]" aria-hidden />
                  View Profile
                </Link>
              ) : (
                // The review popup comes in a later step of doc 05.
                <button type="button" disabled className={outlineButton}>
                  <MessageSquareText className="h-4 w-4" aria-hidden />
                  Leave a Review
                </button>
              )}
              <Link
                href={packagesPath(
                  c.astrologerId,
                  c.subscriptionId ? 'subscription' : 'perSession',
                )}
                className={solidButton}
              >
                <CalendarDays className="h-[18px] w-[18px]" aria-hidden />
                Book Again
              </Link>
            </>
          ) : (
            <>
              {/* Rescheduling comes in a later step of doc 05; chat with doc 07. */}
              <button type="button" disabled className={outlineButton}>
                <RefreshCw className="h-4 w-4" aria-hidden />
                Reschedule
              </button>
              <button
                type="button"
                disabled
                title="Chat on the website opens soon"
                className={solidButton}
              >
                <MessageSquareText className="h-4 w-4" aria-hidden />
                Chat
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
