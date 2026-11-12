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
import { ReviewDialog } from '@/components/booking/review-dialog';
import { WaitingPackages } from '@/components/payments/waiting-packages';
import { SortSheet, type SortFilter } from '@/components/booking/sort-sheet';
import { useBackendClient } from '@/hooks/use-backend-client';
import { profilePath } from '@/lib/astrologers/list';
import {
  CONSULTATION_TABS,
  astrologerShown,
  consultationLines,
  consultationsPath,
  defaultSort,
  isInProgress,
  planFilter,
  priceChip,
  searchPath,
  sessionNumbers,
  PAGE_LIMIT,
  type Consultation,
  type ConsultationTab,
} from '@/lib/booking/consultations';
import { packagesPath, planLabel, planSchedulePath } from '@/lib/booking/packages';
import { reschedulePath } from '@/lib/booking/reschedule';
import { chatPath } from '@/lib/chat/messages';
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
  const [filters, setFilters] = useState<SortFilter>({
    sort: defaultSort(initialTab),
    from: '',
    to: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const switchTab = (next: ConsultationTab) => {
    setTab(next);
    // Each tab starts on its own default order; the date range stays (the app's handleTabChange).
    setFilters(f => ({ ...f, sort: defaultSort(next) }));
    // Keeps the tab on refresh and on back from a profile; the history API skips a server render.
    window.history.replaceState(null, '', consultationsPath(next));
  };

  const listTab = tab === 'subscription' ? null : tab;
  const { sort, from, to } = filters;
  const filtered = sort !== defaultSort(tab) || !!from || !!to;
  const list = useInfiniteQuery({
    queryKey: ['consultations', 'list', userId, listTab, search, sort, from, to],
    queryFn: ({ pageParam }) =>
      backend.get<Consultation[]>(
        searchPath(userId!, { tab: listTab!, page: pageParam, search, sort, from, to }),
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

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:border-b lg:border-[#BE7B71]/50 lg:pb-5">
        {tab !== 'subscription' ? (
          <div className="flex items-center gap-2 lg:order-2 lg:ml-auto">
            <label className="relative block min-w-0 flex-1 lg:w-[380px] lg:flex-none">
              <span className="sr-only">Search</span>
              <input
                type="search"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search"
                enterKeyHint="search"
                className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-12 font-app text-[16px] text-[#4a1a1a] outline-none focus:border-primary lg:h-11 lg:border-primary lg:bg-[#F8F3DF]"
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
            <SortSheet
              value={filters}
              defaultSort={defaultSort(tab)}
              active={filtered}
              onApply={setFilters}
            />
          </div>
        ) : null}

        <PillTabs
          tabs={CONSULTATION_TABS}
          active={tab}
          onChange={switchTab}
          label="Consultations"
          splitOnDesktop
          className="lg:order-1"
        />
      </div>

      <WaitingPackages />
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
                : filtered
                  ? 'No consultations match these filters'
                  : 'No Consultation Found'}
          </p>
          <p className="font-app text-[15px] text-[#6d6d6d]">
            {tab === 'subscription'
              ? 'Your active subscription plans will appear here.'
              : 'Consultation history will be available here.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:gap-3">
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

// Phones: the app's card (details over the buttons). Desktop: Figma's row, buttons on the right.
const cardClass =
  'relative h-full rounded-lg border border-[#BE7B71] bg-[#F8F3DF] p-3 lg:flex lg:flex-wrap lg:items-center lg:gap-4 lg:rounded-2xl lg:px-3 lg:py-2.5';
const detailsClass =
  'flex gap-2 lg:min-w-0 lg:flex-1 lg:items-center lg:gap-3 lg:self-stretch lg:border-r lg:border-dashed lg:border-[#BE7B71] lg:pr-4';
const linesClass = 'flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-x-4';
const actionsClass =
  'mt-2 flex gap-2 border-t border-[#BE7B71]/40 pt-2 lg:mt-0 lg:w-[290px] lg:shrink-0 xl:w-[340px] lg:border-0 lg:pt-0';
const chipClass =
  'whitespace-nowrap rounded-full bg-primary px-2.5 py-1 font-app font-semibold text-[#F8F3DF]';
const outlineButton =
  'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary font-raleway text-[15px] font-medium text-primary disabled:opacity-50 lg:h-9 lg:text-[14px]';
const solidButton =
  'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary font-raleway text-[15px] font-medium text-[#F8F3DF] disabled:opacity-50 lg:h-9 lg:text-[14px]';

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
    <span className="flex items-center gap-1.5 font-app text-[13px] font-bold text-[#1C1C1C] lg:whitespace-nowrap">
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
      <div className={detailsClass}>
        <Avatar name={name} photo={photo} href={profile} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={profile}
            className="mb-1 truncate font-app text-[16px] font-semibold text-primary"
          >
            {name}
          </Link>
          <div className={linesClass}>
            <Line icon={Video}>
              Subscription #{number} - {plan.plan.consultationMinutes} min consultation
            </Line>
            <Line icon={CalendarDays}>
              {planLabel(plan.plan.durationMonths)} • Ends {shortDate(plan.endAt)}
            </Line>
            <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-start">
              <Line icon={Clock3}>
                {plan.usedConsultations} of {plan.totalConsultations} used
              </Line>
              {plan.amountPaid ? (
                <span className={clsx(chipClass, 'text-[12px] lg:hidden')}>
                  {paidLabel(plan.amountPaid)}
                </span>
              ) : null}
            </div>
          </div>
          {plan.amountPaid ? (
            <span className={clsx(chipClass, 'mt-1 hidden self-start text-[13px] lg:inline-flex')}>
              {paidLabel(plan.amountPaid)}
            </span>
          ) : null}
        </div>
      </div>
      <div className={actionsClass}>
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
  // The app's "Reschedule Unavailable" toast, shown under the buttons.
  const [rescheduleNotice, setRescheduleNotice] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  // The app's "Thank you!" toast after a review, shown under the buttons.
  const [reviewed, setReviewed] = useState(false);
  const chip = sessionNumber ? `Consultation ${sessionNumber}` : priceChip(c.package);
  const icons = { video: Video, date: CalendarDays, time: Clock3 } as const;

  return (
    <article className={cardClass}>
      <div className={detailsClass}>
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
          <div className={linesClass}>
            {consultationLines(c).map(line => (
              <Line key={line.icon} icon={icons[line.icon]}>
                {line.text}
              </Line>
            ))}
          </div>
          {/* Desktop: under the lines (Figma). Phones: bottom right (the app). */}
          {chip ? (
            <span
              className={clsx(
                chipClass,
                'mt-1 hidden self-start lg:inline-flex',
                sessionNumber ? 'text-[11px]' : 'text-[13px]',
              )}
            >
              {chip}
            </span>
          ) : null}
        </div>
        {chip ? (
          <span
            className={clsx(
              chipClass,
              'self-end lg:hidden',
              sessionNumber ? 'text-[11px]' : 'text-[13px]',
            )}
          >
            {chip}
          </span>
        ) : null}
      </div>

      {gone ? null : (
        <div className={actionsClass}>
          {completed ? (
            <>
              {c.reviewId ? (
                <Link href={profile!} className={outlineButton}>
                  <UserRound className="h-[18px] w-[18px]" aria-hidden />
                  View Profile
                </Link>
              ) : (
                <button type="button" onClick={() => setReviewing(true)} className={outlineButton}>
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
              {isInProgress(c, new Date()) ? (
                <button
                  type="button"
                  onClick={() => setRescheduleNotice(true)}
                  className={clsx(outlineButton, 'opacity-50')}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Reschedule
                </button>
              ) : (
                <Link href={reschedulePath(c.astrologerId, c._id)} className={outlineButton}>
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Reschedule
                </Link>
              )}
              <Link href={chatPath(c._id)} className={solidButton}>
                <MessageSquareText className="h-4 w-4" aria-hidden />
                Chat
              </Link>
            </>
          )}
        </div>
      )}
      {rescheduleNotice ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl lg:mt-0 lg:basis-full bg-[#fdecea] px-3 py-2 font-app text-[14px] text-[#4a1a1a]"
        >
          <span className="flex-1">
            <b>Reschedule Unavailable.</b> You cannot reschedule during the scheduled consultation
            time.
          </span>
          <button type="button" aria-label="Dismiss" onClick={() => setRescheduleNotice(false)}>
            ×
          </button>
        </p>
      ) : null}
      {reviewed ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl lg:mt-0 lg:basis-full bg-[#e7f3e8] px-3 py-2 font-app text-[14px] text-[#1f4d23]"
        >
          <span className="flex-1">
            <b>Thank you!</b> Your rating has been submitted successfully.
          </span>
          <button type="button" aria-label="Dismiss" onClick={() => setReviewed(false)}>
            ×
          </button>
        </p>
      ) : null}
      {reviewing ? (
        <ReviewDialog
          astrologerId={c.astrologerId}
          bookingId={c._id}
          astrologerName={name}
          photo={photo}
          onClose={() => setReviewing(false)}
          onDone={() => {
            setReviewing(false);
            setReviewed(true);
          }}
        />
      ) : null}
    </article>
  );
}
