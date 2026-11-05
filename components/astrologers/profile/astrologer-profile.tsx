'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  CalendarDays,
  GraduationCap,
  Languages,
  Loader2,
  Phone,
  Share2,
  Trophy,
  UserRoundX,
} from 'lucide-react';
import clsx from 'clsx';

import { PhotoGallery } from '@/components/astrologers/profile/photo-gallery';
import { RatingsSummary, ReviewsList } from '@/components/astrologers/profile/profile-reviews';
import { AstrologerImage, VerifiedIcon } from '@/components/images';
import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import {
  formatCurrency,
  getDisplayLanguages,
  getExperienceLabel,
  getLowestPackage,
} from '@/components/pages/landing/talk-to-our-astrologer/utils';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import {
  profileShareUrl,
  type RatingReview,
  tagNames,
  tierLabel,
  tierStyle,
} from '@/lib/astrologers/profile';
import { BackendError } from '@/lib/backend/client';

const card = 'rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] p-5';

/** The app's AstrologerDetailScreen in the Figma layout (_loose/Astrologers-Profile). Logged-in clients only. */
export function AstrologerProfile({ astrologerId }: { astrologerId: string }) {
  const backend = useBackendClient();
  const { countryCode, isResolved } = useBuyerCountry();

  const profile = useQuery({
    queryKey: ['astrologers', 'profile', astrologerId, countryCode],
    queryFn: () =>
      backend.get<Astrologer>(
        `/astrologer-details/user/${encodeURIComponent(astrologerId)}${countryCode ? `?countryCode=${countryCode}` : ''}`,
      ),
    // The price follows the buyer's country: wait for it so it isn't shown in NPR first.
    enabled: isResolved,
    retry: (count, error) => !(error instanceof BackendError && error.status === 404) && count < 2,
  });
  const reviews = useQuery({
    queryKey: ['astrologers', 'reviews', astrologerId],
    queryFn: () =>
      backend.get<RatingReview[]>(
        `/ratings/astrologer/${encodeURIComponent(astrologerId)}/review-ratings?limit=1000`,
      ),
  });

  if (profile.error instanceof BackendError && profile.error.status === 404) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <UserRoundX className="h-16 w-16 text-primary" aria-hidden />
        <h1 className="font-mukta text-[22px] font-semibold text-[#4a1a1a]">
          This user is no longer available
        </h1>
        <p className="font-mukta text-[16px] text-[#6d6d6d]">
          The astrologer profile you&apos;re looking for has been removed.
        </p>
      </div>
    );
  }
  if (profile.isError) {
    return (
      <div className="py-16 text-center font-mukta text-[17px] text-[#4a1a1a]">
        <p>We could not load this profile.</p>
        <button
          type="button"
          onClick={() => profile.refetch()}
          className="mt-2 text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!profile.data) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const astrologer = profile.data;
  const reviewList = Array.isArray(reviews.data) ? reviews.data : [];
  const name = astrologer.user?.fullName?.trim() || 'Astrologer';

  // Desktop (Figma): main column + a right column with the price and the ratings. Phones: one column in that order.
  return (
    <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="lg:col-start-1 lg:row-start-1">
        <HeaderCard astrologer={astrologer} astrologerId={astrologerId} name={name} />
      </div>
      <div className="lg:col-start-2 lg:row-start-1">
        <PriceCard astrologer={astrologer} />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <About bio={astrologer.bio} />
      </div>
      {/* Gifts on the profile come next in doc 04 (they need payments, doc 06). */}
      {astrologer.media?.length ? (
        <div className="min-w-0 lg:col-start-1 lg:row-start-3">
          <PhotoGallery photos={astrologer.media} name={name} />
        </div>
      ) : null}
      <div className="lg:col-start-2 lg:row-span-3 lg:row-start-2">
        <RatingsSummary reviews={reviewList} />
      </div>
      <div className="lg:col-start-1 lg:row-start-4">
        {reviews.isPending ? null : <ReviewsList reviews={reviewList} />}
      </div>
    </div>
  );
}

function HeaderCard({
  astrologer,
  astrologerId,
  name,
}: {
  astrologer: Astrologer;
  astrologerId: string;
  name: string;
}) {
  const photo =
    astrologer.user?.profilePicture?.url || astrologer.user?.profilePicture?.thumbnail?.url;
  const tier = tierLabel(astrologer.tier?.name);
  const badge = tierStyle(astrologer.tier?.name);
  const online = astrologer.status === 'ONLINE';
  const rows = [
    {
      key: 'languages',
      icon: Languages,
      text: getDisplayLanguages(astrologer.tags, astrologer.language),
    },
    { key: 'skills', icon: Award, text: tagNames(astrologer.tags, 'skill').join(', ') || '-' },
    {
      key: 'expertise',
      icon: Trophy,
      text: tagNames(astrologer.tags, 'expertise').join(', ') || '-',
    },
    {
      key: 'experience',
      icon: GraduationCap,
      text: getExperienceLabel(astrologer.yearsOfExperience),
    },
  ];

  return (
    <section className={clsx(card, 'relative')}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full ring-2 ring-[#e8dcc8]">
            <Image
              src={photo || AstrologerImage}
              alt={name}
              fill
              sizes="120px"
              className="object-cover"
              unoptimized={Boolean(photo)}
              priority
            />
          </div>
          <span
            className={clsx(
              'absolute right-2 top-2 h-4 w-4 rounded-full border-2 border-[#fbf6ee]',
              online ? 'bg-[#34C759]' : 'bg-[#9CA3AF]',
            )}
            aria-label={online ? 'Online' : 'Offline'}
          />
          {tier ? (
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 font-mukta text-xs font-semibold"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {tier}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="font-mukta text-[24px] font-semibold leading-tight text-[#4a1a1a]">
              {name}
            </h1>
            {astrologer.isAstrologerActive ? (
              <Image
                src={VerifiedIcon}
                alt="Verified astrologer"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            ) : null}
          </div>
          <ul className="mt-2 space-y-1.5">
            {rows.map(row => (
              <li
                key={row.key}
                className="flex items-start justify-center gap-2 font-mukta text-[15px] text-[#4a1a1a] sm:justify-start"
              >
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0">{row.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex gap-3 sm:absolute sm:right-5 sm:top-5 sm:mt-0">
        <FollowButton astrologerId={astrologerId} />
        <ShareButton astrologerId={astrologerId} name={name} />
      </div>
    </section>
  );
}

function FollowButton({ astrologerId }: { astrologerId: string }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const statusKey = ['follow', 'status', astrologerId];
  const status = useQuery({
    queryKey: statusKey,
    queryFn: () =>
      backend.get<{ isFollowing?: boolean }>(
        `/follow/status/${encodeURIComponent(astrologerId)}?followeeType=ASTROLOGER`,
      ),
  });
  const following = Boolean(status.data?.isFollowing);
  const body = { followeeId: astrologerId, followeeType: 'ASTROLOGER' };
  const toggle = useMutation({
    mutationFn: () => (following ? backend.delete('/follow', body) : backend.post('/follow', body)),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: statusKey });
      void queryClient.invalidateQueries({ queryKey: ['follow', 'following'] });
    },
  });

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={status.isPending || toggle.isPending}
      aria-pressed={following}
      className={clsx(
        'flex h-[42px] flex-1 items-center justify-center gap-2 rounded-full px-6 font-mukta text-[16px] disabled:opacity-60 sm:flex-none',
        following ? 'border border-[#BE7B71] text-primary' : 'bg-primary text-white',
      )}
    >
      {toggle.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {following ? 'Unfollow' : 'Follow'}
    </button>
  );
}

function ShareButton({ astrologerId, name }: { astrologerId: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = profileShareUrl(window.location.origin, astrologerId);
    const text = 'Check out this astrologer profile on AstroSewa!';
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return; // closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };
  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label={copied ? 'Link copied' : 'Share profile'}
      className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#BE7B71] text-primary"
    >
      <Share2 className="h-5 w-5" aria-hidden />
      {copied ? (
        <span
          role="status"
          className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-[#4a1a1a] px-2 py-1 font-mukta text-xs text-white"
        >
          Link copied
        </span>
      ) : null}
    </button>
  );
}

/** Cheapest package, as the app's card; Schedule / Connect Now open booking (doc 05). */
function PriceCard({ astrologer }: { astrologer: Astrologer }) {
  const cheapest = getLowestPackage(astrologer.packages);
  const free = cheapest?.discountedPrice?.value === 0;
  const discounted = (cheapest?.discountPercent ?? 0) > 0 && !free;
  return (
    <section className={clsx(card, 'text-center')}>
      {cheapest ? (
        <p className="font-mukta text-[#4a1a1a]">
          {discounted ? (
            <span className="mr-2 text-[16px] text-[#8a8583] line-through">
              {formatCurrency(cheapest.cost?.currency, cheapest.cost?.value)}
            </span>
          ) : null}
          <span className="text-[26px] font-bold text-primary">
            {free
              ? 'Free'
              : formatCurrency(
                  cheapest.discountedPrice?.currency ?? cheapest.cost?.currency,
                  cheapest.discountedPrice?.value,
                )}
          </span>
          {!free && cheapest.consultationMinutes ? (
            <span className="text-[16px] font-semibold text-primary">
              {' '}
              / {cheapest.consultationMinutes}m
            </span>
          ) : null}
        </p>
      ) : (
        <p className="font-mukta text-[16px] text-[#6d6d6d]">No packages yet</p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled
          className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#611508] font-mukta text-[16px] text-white disabled:opacity-60"
        >
          <CalendarDays className="h-5 w-5" aria-hidden />
          Schedule
        </button>
        <button
          type="button"
          disabled
          className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-[#611508] font-mukta text-[16px] text-[#611508] disabled:opacity-60"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Connect Now
        </button>
      </div>
      <p className="mt-2 font-mukta text-sm text-[#6d6d6d]">Booking on the website opens soon.</p>
    </section>
  );
}

function About({ bio }: { bio?: string | null }) {
  const [open, setOpen] = useState(false);
  const text = bio?.trim() || '-';
  const long = text.length > 280;
  return (
    <section className={card}>
      <h2 className="font-mukta text-[18px] font-semibold text-[#4a1a1a]">About me</h2>
      <p
        className={clsx(
          'mt-2 whitespace-pre-line break-words font-mukta text-[16px] leading-relaxed text-[#2b2b2b]',
          long && !open && 'line-clamp-4',
        )}
      >
        {text}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="mt-1 font-mukta text-[15px] text-primary underline"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </section>
  );
}
