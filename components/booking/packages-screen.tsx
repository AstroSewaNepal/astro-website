'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Loader2, PackageOpen, X } from 'lucide-react';
import clsx from 'clsx';

import { PillTabs } from '@/components/booking/pill-tabs';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import {
  formatDuration,
  packagesPath,
  planLabel,
  priceLabel,
  priceParts,
  schedulePath,
  sortPackages,
  type ConsultationPackage,
  type PackagesResponse,
  type PackageTab,
  type PlansResponse,
  type Price,
} from '@/lib/booking/packages';

const TABS: { id: PackageTab; label: string }[] = [
  { id: 'perSession', label: 'Per Session' },
  { id: 'subscription', label: 'Subscription' },
];

// Inverted (maroon) colours of the selected card on desktop, as the Figma Subscription frame.
const onSelected = 'lg:group-data-[selected=true]:text-white';

/**
 * The app's Consultation Packages screen: Per Session packages (Continue -> schedule appointment) and Subscription
 * plans (Subscribe -> payment, doc 06). Phones: the app's list, the chosen card opens. Desktop: Figma's columns.
 */
export function PackagesScreen({
  astrologerId,
  initialTab,
}: {
  astrologerId: string;
  initialTab: PackageTab;
}) {
  const backend = useBackendClient();
  const { countryCode, isResolved } = useBuyerCountry();
  const [tab, setTab] = useState<PackageTab>(initialTab);
  const [packageId, setPackageId] = useState<string | null>(null);
  // undefined = not picked yet (the first plan); null = the person closed the open plan, as the app allows.
  const [planId, setPlanId] = useState<string | null | undefined>(undefined);

  const country = countryCode ? `?countryCode=${countryCode}` : '';
  const id = encodeURIComponent(astrologerId);
  // Prices follow the buyer's country: wait for it so they aren't shown in NPR first.
  const packages = useQuery({
    queryKey: ['booking', 'packages', astrologerId, countryCode],
    queryFn: () => backend.get<PackagesResponse>(`/astrologers/${id}/packages${country}`),
    enabled: isResolved,
    select: data => sortPackages(data.packages ?? []),
  });
  const plans = useQuery({
    queryKey: ['booking', 'plans', astrologerId, countryCode],
    queryFn: () => backend.get<PlansResponse>(`/astrologers/${id}/subscription-plans${country}`),
    enabled: isResolved && tab === 'subscription',
    select: data => data.subscriptionPlans ?? [],
  });

  const switchTab = (next: PackageTab) => {
    setTab(next);
    // Keeps the tab on refresh and on back from the next page; the history API skips a server render.
    window.history.replaceState(null, '', packagesPath(astrologerId, next));
  };

  const active = tab === 'perSession' ? packages : plans;
  const list = active.data ?? [];
  const chosenPackage = packages.data?.find(p => p.id === packageId) ?? packages.data?.[0] ?? null;
  const chosenPlanId = planId === undefined ? (plans.data?.[0]?.id ?? null) : planId;

  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-5 text-[28px] font-normal text-primary lg:text-[34px]">
        Consultation Packages
      </h1>

      <PillTabs
        tabs={TABS}
        active={tab}
        onChange={switchTab}
        label="Package type"
        className="mb-5 lg:mx-auto lg:w-[410px]"
      />

      {!isResolved || active.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : active.isError ? (
        <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
          <p>We could not load the {tab === 'perSession' ? 'packages' : 'plans'}.</p>
          <button
            type="button"
            onClick={() => active.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <PackageOpen className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-app text-[17px] text-[#4a1a1a]">
            {tab === 'perSession' ? 'No packages yet' : 'No subscription plans yet'}
          </p>
        </div>
      ) : tab === 'perSession' ? (
        <>
          <ul className="grid gap-2 lg:grid-cols-2 lg:gap-5 xl:grid-cols-3">
            {(packages.data ?? []).map(p => (
              <li key={p.id}>
                <OfferCard
                  title={p.packageType}
                  lines={[`${formatDuration(p.consultationMinutes)} consultation`]}
                  item={p}
                  selected={chosenPackage?.id === p.id}
                  onSelect={() => setPackageId(p.id)}
                  action={
                    <Link
                      href={schedulePath(astrologerId, p.id)}
                      className={actionClass}
                      onClick={() => setPackageId(p.id)}
                    >
                      Continue
                    </Link>
                  }
                />
              </li>
            ))}
          </ul>
          <Footer actionLabel="Continue">
            {chosenPackage ? (
              <Link href={schedulePath(astrologerId, chosenPackage.id)} className={bottomButton}>
                Continue
              </Link>
            ) : null}
          </Footer>
        </>
      ) : (
        <>
          <ul className="grid gap-2 lg:grid-cols-2 lg:gap-5 xl:grid-cols-3">
            {(plans.data ?? []).map(plan => (
              <li key={plan.id}>
                <OfferCard
                  title={planLabel(plan.durationMonths)}
                  lines={[
                    `${plan.consultationMinutes} min session`,
                    `${plan.totalConsultations} consultations total`,
                  ]}
                  item={plan}
                  selected={chosenPlanId === plan.id}
                  onSelect={() => setPlanId(chosenPlanId === plan.id ? null : plan.id)}
                  action={<SubscribeButton className={actionClass} />}
                />
              </li>
            ))}
          </ul>
          <Footer actionLabel="Subscribe Now">
            <SubscribeButton className={bottomButton} />
          </Footer>
          <p className="mt-2 text-center font-app text-sm text-[#6d6d6d]">
            Buying plans on the website opens soon.
          </p>
        </>
      )}
    </div>
  );
}

const bottomButton =
  'flex h-[52px] w-full items-center justify-center rounded-full bg-primary font-app text-[17px] text-white disabled:opacity-60';

// Desktop's per-card button; white on the selected (maroon) card, as Figma.
const actionClass = clsx(
  'flex h-[52px] w-full items-center justify-center rounded-full bg-primary font-app text-[17px] text-white disabled:opacity-60',
  'lg:group-data-[selected=true]:bg-[#F8F3DF] lg:group-data-[selected=true]:text-primary',
);

/** Paying for a plan comes with the website's payments (doc 06). */
function SubscribeButton({ className }: { className: string }) {
  return (
    <button type="button" disabled className={className}>
      Subscribe Now
    </button>
  );
}

/** Terms line + the phone's single button (desktop has a button on each card). */
function Footer({ actionLabel, children }: { actionLabel: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <p className="font-app text-[14px] leading-[22px] text-[#1C1C1C] lg:text-center">
        By clicking <b className="text-primary">{actionLabel}</b>, you agree to our{' '}
        <Link href="/terms-and-conditions" target="_blank" className="font-bold text-primary">
          Terms and Conditions
        </Link>{' '}
        and{' '}
        <Link href="/pricing-policy" target="_blank" className="font-bold text-primary">
          Pricing Policy
        </Link>
        .
      </p>
      <div className="lg:hidden">{children}</div>
    </div>
  );
}

/** The app's ConsultationPackageCard / SubscriptionPlanCard (they're the same card with different lines). */
function OfferCard({
  title,
  lines,
  item,
  selected,
  onSelect,
  action,
}: {
  title: string;
  lines: string[];
  item: Pick<ConsultationPackage, 'cost' | 'discountedPrice' | 'included' | 'excluded'>;
  selected: boolean;
  onSelect: () => void;
  action: React.ReactNode;
}) {
  const { pay, full, struck, free } = priceParts(item);
  const included = item.included ?? [];
  const excluded = item.excluded ?? [];

  return (
    <div
      data-selected={selected}
      className="group flex h-full flex-col rounded-2xl bg-[#F8F3DF] p-4 lg:border lg:border-[#BE7B71] lg:data-[selected=true]:border-primary lg:data-[selected=true]:bg-[#611508]"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex w-full items-center gap-4 text-left"
      >
        <span className="flex w-1/2 items-center gap-3 border-r border-dashed border-[#BE7B71] pr-2.5">
          <Radio selected={selected} />
          <span className="flex min-w-0 flex-col gap-1">
            <span
              className={clsx(
                'font-raleway text-[22px] font-semibold leading-[28px] text-primary lg:text-[24px]',
                onSelected,
              )}
            >
              {title}
            </span>
            {lines.map((line, i) => (
              <span
                key={line}
                className={clsx(
                  'font-app text-[#1C1C1C]',
                  i === 0 ? 'text-[16px] leading-[22px]' : 'text-[13px] leading-4',
                  'lg:group-data-[selected=true]:text-white/80',
                )}
              >
                {line}
              </span>
            ))}
          </span>
        </span>
        <span className="flex w-1/2 items-center justify-end gap-1.5 pr-1">
          <span className="flex flex-col items-end gap-1">
            {struck && full ? (
              <span
                className={clsx(
                  'font-app text-[14px] leading-[18px] text-[#1C1C1C] line-through',
                  'lg:group-data-[selected=true]:text-white/70',
                )}
              >
                {priceLabel(full)}
              </span>
            ) : null}
            <span
              className={clsx(
                'font-app text-[18px] font-bold leading-[22px] text-primary lg:text-[22px]',
                onSelected,
              )}
            >
              {free ? 'Free' : pay ? priceLabel(pay as Price) : '-'}
            </span>
          </span>
          <ChevronDown
            className={clsx(
              'h-6 w-6 shrink-0 text-primary transition-transform lg:hidden',
              selected && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>

      {/* Phones open only the chosen card (the app); desktop shows every card's details (Figma). */}
      <div className={clsx('flex flex-1 flex-col', !selected && 'hidden lg:flex')}>
        {included.length ? (
          <Features title="What's included" items={included} icon="check" />
        ) : null}
        {excluded.length ? (
          <Features title="What's not included" items={excluded} icon="cross" />
        ) : null}
        <div className="mt-auto hidden pt-6 lg:block">{action}</div>
      </div>
    </div>
  );
}

function Features({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: 'check' | 'cross';
}) {
  const Icon = icon === 'check' ? Check : X;
  return (
    <div className="mt-4 border-t border-dashed border-[#BE7B71] pt-4 lg:group-data-[selected=true]:border-white/40">
      <p className={clsx('mb-2 font-app text-[16px] font-semibold text-primary', onSelected)}>
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((text, i) => (
          <li key={`${i}-${text}`} className="flex items-center gap-2.5">
            <span
              className={clsx(
                'flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-primary text-white',
                'lg:group-data-[selected=true]:bg-white lg:group-data-[selected=true]:text-primary',
              )}
            >
              <Icon className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
            </span>
            <span className={clsx('font-app text-[14px] font-semibold text-primary', onSelected)}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary',
        'lg:group-data-[selected=true]:border-white',
      )}
    >
      {selected ? (
        <span className="h-2.5 w-2.5 rounded-full bg-primary lg:group-data-[selected=true]:bg-white" />
      ) : null}
    </span>
  );
}
