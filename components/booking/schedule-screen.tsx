'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX2, Check, ChevronDown, Loader2, X } from 'lucide-react';
import clsx from 'clsx';

import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { profilePath } from '@/lib/astrologers/list';
import { BackendError } from '@/lib/backend/client';
import {
  formatDuration,
  packagesPath,
  planLabel,
  priceLabel,
  priceParts,
  sortPackages,
  type PackagesResponse,
} from '@/lib/booking/packages';
import {
  SLOT_GROUPS,
  bookingTimes,
  dateKey,
  dayBatch,
  EARLIEST_BATCH,
  EARLIEST_SEARCH_DAYS,
  firstBookableDay,
  formatTime12,
  groupSlots,
  hasFreeSlot,
  monthDays,
  monthForYear,
  monthOptions,
  toCalendarDate,
  yearOptions,
  type CalendarDate,
  type Option,
  type Slot,
  type SlotsResponse,
} from '@/lib/booking/schedule';
import {
  bookedSlot,
  rescheduleBlock,
  withBookedSlot,
  type BookingDetails,
} from '@/lib/booking/reschedule';
import {
  canBookFromPlan,
  planAction,
  shortDate,
  type UserSubscription,
} from '@/lib/booking/subscriptions';
import { RescheduleReasonDialog } from '@/components/booking/reschedule-reason-dialog';

const noSubscribe = () => () => {};
const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kathmandu';

/** What's being booked: a per-session package, a session from a plan the buyer owns, or a new time for a booking. */
export type BookingOffer =
  | { kind: 'package'; packageId: string }
  | { kind: 'plan'; subscriptionId: string }
  | { kind: 'reschedule'; bookingId: string };

/**
 * The app's Schedule Appointment: pick a day (first free one preselected), then a slot, in the buyer's time zone.
 * Plans (prepaid) and free packages book right away; paid packages wait for the website's payments (doc 06).
 * Rescheduling opens on the booked day, keeps the booked slot unpickable and asks for a reason before moving it.
 */
export function ScheduleScreen({
  astrologerId,
  offer,
}: {
  astrologerId: string;
  offer: BookingOffer;
}) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { countryCode, isResolved } = useBuyerCountry();
  // "Today" is the browser's: the server render doesn't know the buyer's zone.
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const today = hydrated ? toCalendarDate(new Date()) : null;

  const id = encodeURIComponent(astrologerId);
  // Same query as the packages screen, so coming from there costs nothing.
  const packages = useQuery({
    queryKey: ['booking', 'packages', astrologerId, countryCode],
    queryFn: () =>
      backend.get<PackagesResponse>(
        `/astrologers/${id}/packages${countryCode ? `?countryCode=${countryCode}` : ''}`,
      ),
    enabled: isResolved && offer.kind === 'package',
    select: data => sortPackages(data.packages ?? []),
  });
  const bookingId = offer.kind === 'reschedule' ? offer.bookingId : null;
  // The booking being moved: its length, its current slot and whether it may still move.
  const booking = useQuery({
    queryKey: ['consultations', 'booking', bookingId],
    queryFn: () =>
      backend.get<BookingDetails>(`/connection-schedule/${encodeURIComponent(bookingId ?? '')}`),
    enabled: !!bookingId,
    retry: (count, error) => !(error instanceof BackendError && error.status < 500) && count < 2,
  });
  const ownBooking =
    booking.data && booking.data.astrologerId === astrologerId ? booking.data : null;
  const subscriptionId =
    offer.kind === 'plan' ? offer.subscriptionId : (ownBooking?.subscriptionId ?? null);
  // A plan's session length and what's left come from the buyer's own subscription.
  const plan = useQuery({
    queryKey: ['consultations', 'plan', subscriptionId],
    queryFn: () =>
      backend.get<UserSubscription>(
        `/consultation-subscriptions/${encodeURIComponent(subscriptionId ?? '')}`,
      ),
    enabled: !!subscriptionId,
    retry: (count, error) => !(error instanceof BackendError && error.status < 500) && count < 2,
  });

  const pkg =
    offer.kind === 'package' ? (packages.data?.find(p => p.id === offer.packageId) ?? null) : null;
  // Another astrologer's plan in the URL books nothing here.
  const ownPlan = plan.data && plan.data.astrologerId === astrologerId ? plan.data : null;
  // A plan session's booking has no package: its length is the plan's.
  const planLoading = offer.kind === 'reschedule' && !!subscriptionId && plan.isPending;
  const found =
    offer.kind === 'package'
      ? pkg
      : offer.kind === 'plan'
        ? ownPlan
        : planLoading
          ? null
          : ownBooking;
  const minutes =
    (pkg?.consultationMinutes ??
      ownBooking?.package?.consultationMinutes ??
      ownPlan?.plan.consultationMinutes) ||
    15;
  const bookedPackageId =
    ownBooking && !ownBooking.subscriptionId ? ownBooking.package?._id || null : null;
  // Sent with every slot, check and booking call: packageId or subscriptionId, never both (the backend's rule).
  const ref: Record<string, string> =
    offer.kind === 'package'
      ? { packageId: offer.packageId }
      : offer.kind === 'plan'
        ? { subscriptionId: offer.subscriptionId }
        : bookedPackageId
          ? { packageId: bookedPackageId }
          : subscriptionId
            ? { subscriptionId }
            : {};
  const refId =
    offer.kind === 'package'
      ? offer.packageId
      : offer.kind === 'plan'
        ? offer.subscriptionId
        : offer.bookingId;
  const booked = ownBooking ? bookedSlot(ownBooking) : null;
  const blocked = ownBooking ? rescheduleBlock(ownBooking, new Date()) : null;
  const bookedDayAhead = !!booked && !!today && dateKey(booked.date) >= dateKey(today);

  const slotsPath = (date: CalendarDate) =>
    `/astrologers/${id}/available-slots?date=${dateKey(date)}&duration=${minutes}&${new URLSearchParams(ref)}`;

  const slotsKey = (day: CalendarDate | null) =>
    ['booking', 'slots', astrologerId, refId, minutes, day && dateKey(day)] as const;

  // The app opens on the first day with a free slot (90 days ahead, 15 days per round).
  const earliest = useQuery({
    queryKey: ['booking', 'earliest', astrologerId, refId, minutes, today && dateKey(today)],
    queryFn: async () => {
      for (let offset = 0; offset < EARLIEST_SEARCH_DAYS; offset += EARLIEST_BATCH) {
        const days = dayBatch(today!, offset);
        const results = await Promise.all(
          days.map(day => backend.get<SlotsResponse>(slotsPath(day)).catch(() => null)),
        );
        const found = results.findIndex(r => hasFreeSlot(r?.availableSlots));
        if (found !== -1) {
          // That day's slots are already here: the slots query below needn't ask again.
          queryClient.setQueryData(slotsKey(days[found]), results[found]);
          return days[found];
        }
      }
      return null;
    },
    // Rescheduling opens on the booked day instead (the app), unless that day is already past.
    enabled: !!found && !!today && !bookedDayAhead,
    staleTime: 5 * 60 * 1000,
  });

  const [picked, setPicked] = useState<CalendarDate | null>(null);
  const date =
    picked ??
    (bookedDayAhead ? booked!.date : earliest.isFetched ? (earliest.data ?? today) : null);
  const [slot, setSlot] = useState<(Slot & { key: string }) | null>(null);
  const chosen = date && slot?.key === dateKey(date) ? slot : null;
  const [problem, setProblem] = useState<{ title: string; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [askReason, setAskReason] = useState(false);
  // A fresh reason popup each time it opens.
  const [reasonRound, setReasonRound] = useState(0);

  const slots = useQuery({
    queryKey: slotsKey(date),
    queryFn: () => backend.get<SlotsResponse>(slotsPath(date!)),
    enabled: !!found && !!date && !done,
  });

  const pickDate = (next: CalendarDate) => {
    setPicked(next);
    setProblem(null);
  };

  const free = pkg ? priceParts(pkg).free : false;
  // Paid packages need the website's payments (doc 06); plans are prepaid; a booking moves while it's upcoming.
  const bookable =
    offer.kind === 'plan'
      ? !!ownPlan && canBookFromPlan(ownPlan)
      : offer.kind === 'reschedule'
        ? !!ownBooking && !blocked
        : free;
  const isBookedSlot = (s: Pick<Slot, 'start' | 'end'>) =>
    !!booked &&
    !!date &&
    dateKey(booked.date) === dateKey(date) &&
    booked.start === s.start &&
    booked.end === s.end;

  const book = useMutation({
    mutationFn: async (choice: Slot) => {
      const times = bookingTimes(date!, choice);
      const zone = timeZone();
      // Re-checked first, so nobody books a slot taken in the meantime (the app does it before paying).
      try {
        await backend.post('/connection-schedule/validate-slot', {
          ...times,
          astrologerId,
          ...ref,
          timezone: zone,
        });
      } catch (error) {
        // Only the backend saying no means the slot is gone; a network or server failure is just a failure.
        if (error instanceof BackendError && error.status < 500) throw new SlotTaken(error.message);
        throw error;
      }
      await backend.post('/connection-schedule', {
        ...times,
        astrologerId,
        ...ref,
        timeZone: zone,
        notes: '',
        // A free package's booking carries an empty payment reference, as the app sends it.
        ...(offer.kind === 'package' ? { pidx: '' } : {}),
      });
    },
    onSuccess: () => {
      setDone(true);
      // My Consultations and the plan's counts change.
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
    onError: error => showFailure(error),
  });

  // The backend checks the new slot itself (availability, clashes) when the booking moves, as for the app.
  const move = useMutation({
    mutationFn: async ({ choice, reason }: { choice: Slot; reason: string }) => {
      await backend.put(`/connection-schedule/${encodeURIComponent(bookingId ?? '')}`, {
        ...bookingTimes(date!, choice),
        timezone: timeZone(),
        rescheduleReason: reason,
      });
    },
    onSuccess: () => {
      setAskReason(false);
      setDone(true);
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
    onError: error => {
      setAskReason(false);
      showFailure(error);
    },
  });

  function showFailure(error: Error) {
    const refused =
      error instanceof SlotTaken || (error instanceof BackendError && error.status < 500);
    if (refused) {
      // The slot is gone or the booking was refused: show fresh slots and drop the stale choice, like the app.
      setSlot(null);
      void queryClient.invalidateQueries({ queryKey: ['booking', 'slots', astrologerId] });
    }
    setProblem(
      error instanceof SlotTaken
        ? {
            title: 'Slot Unavailable',
            text: error.message || 'This time slot is no longer available.',
          }
        : {
            title: 'Something went wrong',
            // A network or server failure keeps the chosen slot, so trying again is one tap.
            text: refused ? error.message : 'Please try again.',
          },
    );
  }

  if (done) {
    return <BookedPanel astrologerId={astrologerId} rescheduled={offer.kind === 'reschedule'} />;
  }

  // A plan session's booking needs its plan for the session length.
  const source =
    offer.kind === 'package'
      ? packages
      : offer.kind === 'plan'
        ? plan
        : booking.isError || !subscriptionId
          ? booking
          : plan;
  const notFound = source.error instanceof BackendError && source.error.status < 500;
  const loading =
    offer.kind === 'package'
      ? !isResolved || packages.isPending
      : offer.kind === 'plan'
        ? plan.isPending
        : booking.isPending || planLoading;
  if (loading) {
    return <Spinner />;
  }
  if (source.isError && !notFound) {
    return (
      <Retry
        text={`We could not load this ${offer.kind === 'package' ? 'package' : offer.kind === 'plan' ? 'plan' : 'consultation'}.`}
        onRetry={() => source.refetch()}
      />
    );
  }
  if (!found) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <CalendarX2 className="h-14 w-14 text-primary/60" aria-hidden />
        <p className="font-app text-[17px] text-[#4a1a1a]">
          {offer.kind === 'package'
            ? 'This package is no longer available.'
            : offer.kind === 'plan'
              ? 'This plan could not be found.'
              : 'This consultation could not be found.'}
        </p>
        <Link
          href={offer.kind === 'package' ? packagesPath(astrologerId) : '/client/consultations'}
          className="font-app text-primary underline"
        >
          {offer.kind === 'package' ? 'See the packages' : 'My Consultations'}
        </Link>
      </div>
    );
  }

  const pay = pkg ? priceParts(pkg).pay : null;
  const subtitle =
    offer.kind === 'reschedule'
      ? `${formatDuration(minutes)} consultation${booked ? ` · now booked for ${shortDate(ownBooking!.scheduledStartAt)}, ${formatTime12(booked.start)}` : ''}`
      : pkg
        ? `${pkg.packageType} · ${formatDuration(pkg.consultationMinutes)} · ${free ? 'Free' : pay ? priceLabel(pay) : ''}`
        : ownPlan
          ? `${planLabel(ownPlan.plan.durationMonths)} plan · ${formatDuration(minutes)} · ${ownPlan.availableToSchedule} of ${ownPlan.totalConsultations} left to book`
          : '';
  const working = book.isPending || move.isPending;
  const busy = !date || slots.isPending;
  const listed =
    date && offer.kind === 'reschedule'
      ? withBookedSlot(slots.data?.availableSlots ?? [], date, booked)
      : (slots.data?.availableSlots ?? []);
  const groups = date && today ? groupSlots(listed, date, minutes, new Date()) : null;
  const anySlot = !!groups && SLOT_GROUPS.some(g => groups[g.id].length > 0);
  const submit = () => {
    if (!chosen) return;
    if (offer.kind === 'reschedule') {
      setReasonRound(n => n + 1);
      setAskReason(true);
    } else {
      book.mutate(chosen);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-[28px] font-normal text-primary lg:text-[34px]">Schedule Appointment</h1>
      <p className="mb-5 mt-1 font-app text-[15px] text-[#6d6d6d]">{subtitle}</p>

      {today ? (
        <DatePicker today={today} date={date} disabled={busy || working} onChange={pickDate} />
      ) : null}

      {busy ? (
        <Spinner />
      ) : slots.isError ? (
        <Retry text="We could not load the slots." onRetry={() => slots.refetch()} />
      ) : !anySlot ? (
        <p className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">No Slots Found.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {SLOT_GROUPS.map(g =>
            groups![g.id].length ? (
              <section key={g.id}>
                <h2 className="mb-3 font-raleway text-[18px] font-semibold text-primary">
                  {g.title}
                </h2>
                <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 xl:grid-cols-6">
                  {groups![g.id].map(s => {
                    const selected = chosen?.start === s.start && chosen.end === s.end;
                    const current = offer.kind === 'reschedule' && isBookedSlot(s);
                    return (
                      <li key={`${s.start}-${s.end}`}>
                        <button
                          type="button"
                          disabled={!s.available || working}
                          aria-pressed={selected}
                          aria-label={
                            current ? `${formatTime12(s.start)}, your current booking` : undefined
                          }
                          title={current ? 'Your current booking' : undefined}
                          onClick={() => {
                            setSlot({ ...s, key: dateKey(date!) });
                            setProblem(null);
                          }}
                          className={clsx(
                            'w-full rounded-lg py-2.5 font-app text-[16px] font-semibold transition-opacity',
                            selected
                              ? 'border-2 border-[#BE7B71] bg-primary text-[#FFFAE6]'
                              : 'bg-[#FFFAE6] text-primary hover:opacity-80',
                            !s.available && 'text-[#9D9D9D] opacity-50 hover:opacity-50',
                            current && 'outline-dashed outline-1 outline-[#9D9D9D]',
                          )}
                        >
                          {formatTime12(s.start)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      )}

      {/* Phones: fixed above the tab bar, like the app's button under its slot list (sticky can't work: body has
          overflow-x hidden). The spacer keeps the last slots clear of it. Desktop: under the slots. */}
      <div aria-hidden className="h-36 lg:hidden" />
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 border-t border-[#e8ddd0] bg-[#fbf7ee]/95 px-4 pb-3 pt-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {problem ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-[#f2b8b5] bg-[#fdecea] px-4 py-3 font-app text-[15px] text-[#4a1a1a]"
          >
            <span className="flex-1">
              <b className="block">{problem.title}</b>
              {problem.text}
            </span>
            <button type="button" aria-label="Dismiss" onClick={() => setProblem(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={!chosen || !bookable || working || (!!chosen && isBookedSlot(chosen))}
          onClick={submit}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[32px] bg-primary font-app text-[17px] text-white disabled:opacity-60 lg:mx-auto lg:max-w-[420px]"
        >
          {working ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
          {offer.kind === 'reschedule' ? 'Reschedule Appointment' : 'Confirm Appointment'}
        </button>
        {!bookable ? (
          <p className="text-center font-app text-sm text-[#6d6d6d]">
            {offer.kind === 'plan'
              ? `This plan can't book more sessions (${ownPlan ? planAction(ownPlan).label.toLowerCase() : 'not found'}).`
              : offer.kind === 'reschedule'
                ? blocked === 'inProgress'
                  ? 'You cannot reschedule during the scheduled consultation time.'
                  : 'This consultation can no longer be rescheduled.'
                : 'Paying for consultations on the website opens soon.'}
          </p>
        ) : null}
      </div>

      {offer.kind === 'reschedule' ? (
        <RescheduleReasonDialog
          key={reasonRound}
          open={askReason}
          busy={move.isPending}
          onClose={() => setAskReason(false)}
          onConfirm={reason => chosen && move.mutate({ choice: chosen, reason })}
        />
      ) : null}
    </div>
  );
}

class SlotTaken extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SlotTaken';
  }
}

/** Era / year / month pills and the day strip (the app's ButtonDropdowns + DaySelector). */
function DatePicker({
  today,
  date,
  disabled,
  onChange,
}: {
  today: CalendarDate;
  date: CalendarDate | null;
  disabled: boolean;
  onChange: (date: CalendarDate) => void;
}) {
  const shown = date ?? today;
  const days = monthDays(shown.year, shown.month, today);
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    strip.current
      ?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [shown.year, shown.month, shown.day]);

  const setYear = (year: number) => {
    const month = monthForYear(year, shown.month, today);
    onChange({ year, month, day: firstBookableDay(year, month, today) });
  };
  const setMonth = (month: number) =>
    onChange({ year: shown.year, month, day: firstBookableDay(shown.year, month, today) });

  return (
    <div>
      <div className="grid grid-cols-[0.8fr_1fr_1.25fr] gap-2 lg:max-w-[520px]">
        {/* BS is shown but not offered yet, as in the app. */}
        <Pill
          label="Calendar"
          value={1}
          options={[
            { value: 1, label: 'AD', disabled: false },
            { value: 2, label: 'BS', disabled: true },
          ]}
          disabled={disabled}
          onChange={() => {}}
        />
        <Pill
          label="Year"
          value={shown.year}
          options={yearOptions(today)}
          disabled={disabled}
          onChange={setYear}
        />
        <Pill
          label="Month"
          value={shown.month}
          options={monthOptions(shown.year, today)}
          disabled={disabled}
          onChange={setMonth}
        />
      </div>

      <ul
        ref={strip}
        // Phones slide sideways (the app); desktop shows the whole month, since a mouse can't swipe.
        className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {days.map(d => {
          const selected = d.day === shown.day;
          return (
            <li key={d.day} className="shrink-0">
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${d.dayName} ${d.day}`}
                disabled={d.disabled || disabled}
                onClick={() => onChange({ year: shown.year, month: shown.month, day: d.day })}
                className={clsx(
                  'flex w-[60px] flex-col items-center gap-1 rounded-lg py-2.5 font-raleway text-primary',
                  selected
                    ? 'border-2 border-primary bg-[#F8F3DF]'
                    : d.isToday
                      ? 'border border-primary'
                      : 'border border-transparent',
                  (d.disabled || disabled) && 'opacity-50',
                )}
              >
                <span className="text-[18px] font-semibold">{d.dayName}</span>
                <span className="text-[16px] font-medium">{String(d.day).padStart(2, '0')}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A maroon pill over a native select: the phone's own picker opens, like the app's sheets. */
function Pill({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  options: Option[];
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="h-10 w-full appearance-none rounded-full bg-primary pl-3 pr-7 text-center font-raleway text-[14px] sm:text-[15px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
      >
        {options.map(o => (
          <option key={o.value} value={o.value} disabled={o.disabled} className="text-[#1C1C1C]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
        aria-hidden
      />
    </label>
  );
}

/** Booking-Success (Figma): the app goes to My Consultations with a toast instead. */
function BookedPanel({
  astrologerId,
  rescheduled,
}: {
  astrologerId: string;
  rescheduled: boolean;
}) {
  const backend = useBackendClient();
  const { countryCode } = useBuyerCountry();
  const profile = useQuery({
    queryKey: ['astrologers', 'profile', astrologerId, countryCode],
    queryFn: () =>
      backend.get<Astrologer>(
        `/astrologer-details/user/${encodeURIComponent(astrologerId)}${countryCode ? `?countryCode=${countryCode}` : ''}`,
      ),
  });
  const name = profile.data?.user?.fullName?.trim();
  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col items-center rounded-[24px] bg-[#F8F3DF] px-6 py-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary">
        <Check className="h-10 w-10 text-primary" aria-hidden />
      </span>
      <h1 className="mt-5 font-raleway text-[24px] font-semibold leading-tight text-primary">
        Your consultation{name ? ` with ${name}` : ''} is successfully{' '}
        {rescheduled ? 'rescheduled' : 'booked'}.
      </h1>
      <p className="mt-3 font-app text-[15px] text-[#6d6d6d]">
        You can view your booking in My Consultations.
      </p>
      <div className="mt-6 flex w-full gap-3">
        <Link
          href="/client/consultations"
          className="flex h-[48px] flex-1 items-center justify-center rounded-full bg-primary font-app text-[16px] text-white"
        >
          My Consultations
        </Link>
        <Link
          href={profilePath(astrologerId)}
          className="flex h-[48px] flex-1 items-center justify-center rounded-full border border-primary font-app text-[16px] text-primary"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Retry({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
      <p>{text}</p>
      <button type="button" onClick={onRetry} className="mt-2 text-primary underline">
        Try again
      </button>
    </div>
  );
}
