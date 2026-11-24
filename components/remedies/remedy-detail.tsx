'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  PackageX,
  ShieldCheck,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { BackendError } from '@/lib/backend/client';
import {
  REMEDIES_PATH,
  categoryPath,
  deliveryLabel,
  moneyLabel,
  remedyDetailPath,
  remedyPrice,
  sortedMedia,
  type Remedy,
  type RemedyMedia,
} from '@/lib/remedies/catalogue';

import { CartButton, CartControls, ShareRemedyButton } from './remedy-bits';
import { RemedyDescription } from './remedy-description';

/**
 * The app's RemedyDetailScreen: gallery, price, name, category chips, stock, delivery, seller, description, and
 * Add to Cart. Phones: the app's stacked page with the cart controls pinned at the bottom. Desktop: gallery on the
 * left, details and the cart controls on the right.
 */
export function RemedyDetail({ remedyId }: { remedyId: string }) {
  const backend = useBackendClient();
  const { countryCode, isResolved } = useBuyerCountry();
  const remedy = useQuery({
    queryKey: ['remedies', 'detail', remedyId, countryCode],
    queryFn: () => backend.get<Remedy>(remedyDetailPath(remedyId, countryCode)),
    enabled: isResolved,
    retry: (count, error) => !(error instanceof BackendError && error.status < 500) && count < 2,
  });

  if (!isResolved || remedy.isPending) return <DetailSkeleton />;
  // The backend also returns switched-off products; they can't be bought, so treat them as gone.
  if (remedy.isError || !remedy.data || remedy.data.isActive === false) {
    const missing = remedy.isError
      ? remedy.error instanceof BackendError && remedy.error.status < 500
      : true;
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <PackageX className="h-14 w-14 text-primary/60" aria-hidden />
        <p className="text-[17px] text-[#4a1a1a]">
          {missing ? 'This remedy is no longer available.' : 'We could not load this remedy.'}
        </p>
        {missing ? (
          <Link
            href={REMEDIES_PATH}
            className="rounded-full bg-primary px-6 py-2.5 text-[16px] text-white"
          >
            Browse Remedies
          </Link>
        ) : (
          <button type="button" onClick={() => remedy.refetch()} className="text-primary underline">
            Try again
          </button>
        )}
      </div>
    );
  }
  return <Detail remedy={remedy.data} />;
}

function Detail({ remedy }: { remedy: Remedy }) {
  const price = remedyPrice(remedy);
  const inStock = remedy.stock > 0;
  return (
    <div className="flex w-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        {remedy.category?.categoryId ? (
          <Link
            href={categoryPath(remedy.category.categoryId)}
            className="inline-flex min-w-0 items-center gap-1 text-[15px] text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{remedy.category.title}</span>
          </Link>
        ) : (
          <span />
        )}
        <CartButton />
      </div>

      {/* Desktop: gallery and "About" on the left, the product panel on the right (sticky). Phones: one column in
          the app's order (gallery, details, description). */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-x-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <Gallery media={sortedMedia(remedy.media)} name={remedy.name} />
        </div>

        <section
          aria-label="Product details"
          className="flex min-w-0 flex-col lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start lg:rounded-[28px] lg:border lg:border-[#E8D5C4] lg:bg-[#FFFAE6] lg:p-7 lg:shadow-[0_12px_32px_rgba(114,10,11,0.08)]"
        >
          {remedy.category?.title ? (
            <span className="w-fit rounded-full bg-[#F1DBD7] px-3 py-1 text-[13px] font-medium text-primary">
              {remedy.category.title}
            </span>
          ) : null}

          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 font-raleway text-[24px] font-bold leading-tight text-[#1C1C1C] lg:text-[32px]">
              {remedy.name}
            </h1>
            <ShareRemedyButton
              remedy={remedy}
              price={price}
              className="h-[42px] w-[42px] rounded-full border border-[#BE7B71] bg-[#FFFAE6] transition-colors hover:bg-[#F1DBD7]"
            />
          </div>
          {remedy.subtitle ? (
            <p className="mt-1 text-[16px] text-[#79787A] lg:text-[17px]">{remedy.subtitle}</p>
          ) : null}

          {remedy.description ? (
            <div className="mt-4 border-t border-dashed border-[#E8D5C4] pt-3">
              <h2 className="mb-1.5 text-[13px] font-medium uppercase tracking-wide text-[#949395]">
                About this remedy
              </h2>
              <RemedyDescription description={remedy.description} />
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl bg-[#F1DBD7]/45 px-4 py-3 lg:px-5 lg:py-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="text-[28px] font-bold leading-none text-primary lg:text-[34px]">
                {moneyLabel(price.currency, price.value)}
              </span>
              {price.full !== null ? (
                <s className="text-[17px] text-[#949395]">
                  {moneyLabel(price.currency, price.full)}
                </s>
              ) : null}
              {remedy.discount > 0 ? (
                <span className="rounded-md bg-primary px-2 py-0.5 text-[14px] font-bold text-white">
                  {remedy.discount}% OFF
                </span>
              ) : null}
            </div>
            {price.full !== null ? (
              <p className="mt-1.5 text-[14px] font-medium text-[#15B763]">
                You save {moneyLabel(price.currency, price.full - price.value)}
              </p>
            ) : null}
          </div>

          <ul className="mt-4 flex flex-col gap-2.5 text-[15px] lg:grid lg:grid-cols-3 lg:gap-3">
            <InfoTile
              icon={Package}
              label="Availability"
              tone={inStock ? 'good' : 'bad'}
              value={inStock ? `In Stock · ${remedy.stock} units` : 'Out of Stock'}
            />
            <InfoTile icon={Truck} label="Delivery" value={deliveryLabel(remedy.deliveryType)} />
            <InfoTile
              icon={UserRound}
              label="Sold by"
              value={remedy.astrologer?.astrologerName || 'AstroSewa'}
            />
          </ul>

          {remedy.subcategory?.length ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[13px] font-medium uppercase tracking-wide text-[#949395]">
                Helps with
              </p>
              <div className="flex flex-wrap gap-1.5">
                {remedy.subcategory.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#E8D5C4] bg-white/60 px-3 py-1 text-[13px] text-[#4a4a4a]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Desktop: the cart controls sit in the panel. */}
          <div className="mt-6 hidden lg:block">
            <CartControls remedy={remedy} variant="footer" />
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-[#79787A]">
              <ShieldCheck className="h-4 w-4 text-[#15B763]" aria-hidden />
              Secure payment with eSewa, Fonepay or card
            </p>
          </div>
        </section>
      </div>

      {/* Phones: pinned above the tabs, as the app's footer. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-6 border-t border-[#e8ddd0] bg-[#F8F3DF] px-4 py-3 empty:hidden lg:hidden">
        <CartControls remedy={remedy} variant="footer" />
      </div>
    </div>
  );
}

/** Phones: the app's icon rows. Desktop: a tile with a labelled icon. */
function InfoTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  const color =
    tone === 'good' ? 'text-[#15B763]' : tone === 'bad' ? 'text-[#FF3B3B]' : 'text-primary';
  return (
    <li className="flex items-center gap-2.5 lg:flex-col lg:items-start lg:gap-2 lg:rounded-2xl lg:border lg:border-[#EADFD0] lg:bg-white/60 lg:p-3">
      <span
        className={clsx(
          'flex shrink-0 items-center justify-center lg:h-9 lg:w-9 lg:rounded-full lg:bg-[#F1DBD7]/70',
          color,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="hidden text-[11px] font-medium uppercase tracking-wide text-[#949395] lg:block">
          {label}
        </span>
        <span
          className={clsx(
            'lg:line-clamp-2 lg:text-[14px] lg:font-semibold lg:leading-5',
            tone ? color : 'text-[#79787A] lg:text-[#1C1C1C]',
          )}
        >
          {value}
        </span>
      </span>
    </li>
  );
}

/** Swipeable on phones (scroll snap) with dots; thumbnails and arrows on desktop; tap for full screen. */
function Gallery({ media, name }: { media: RemedyMedia[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);

  // Which slide is in view while swiping.
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const onScroll = () => setActive(Math.round(node.scrollLeft / Math.max(node.clientWidth, 1)));
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);
  const go = (i: number) => {
    const node = track.current;
    if (!node) return;
    const next = (i + media.length) % media.length;
    node.scrollTo({ left: next * node.clientWidth, behavior: 'smooth' });
    setActive(next);
  };

  if (media.length === 0) {
    return (
      <div className="-mx-4 flex aspect-[1/0.85] items-center justify-center bg-[#F1DBD7] text-[15px] text-[#949395] lg:mx-0 lg:aspect-square lg:rounded-2xl">
        No image available
      </div>
    );
  }

  return (
    <div className="-mx-4 flex flex-col lg:mx-0 lg:gap-3">
      <div className="relative">
        <div
          ref={track}
          className="flex aspect-[1/0.85] snap-x snap-mandatory overflow-x-auto bg-[#F1DBD7] [scrollbar-width:none] lg:aspect-square lg:rounded-2xl [&::-webkit-scrollbar]:hidden"
        >
          {media.map((m, i) => (
            <button
              key={m.mediaId}
              type="button"
              onClick={() => setZoom(i)}
              aria-label={`View image ${i + 1} of ${media.length} full screen`}
              className="h-full w-full shrink-0 snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- backend media URLs */}
              <img
                src={m.url}
                alt={i === 0 ? name : ''}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        {media.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {media.length > 1 ? (
        <>
          <div
            className="flex items-center justify-center gap-1.5 bg-white py-2.5 lg:hidden"
            aria-hidden
          >
            {media.map((m, i) => (
              <span
                key={m.mediaId}
                className={clsx(
                  'h-[7px] rounded-full',
                  i === active ? 'w-5 bg-primary' : 'w-[7px] bg-[#D4D4D4]',
                )}
              />
            ))}
          </div>
          <div className="hidden gap-2 lg:flex">
            {media.map((m, i) => (
              <button
                key={m.mediaId}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={clsx(
                  'h-16 w-16 overflow-hidden rounded-lg border-2',
                  i === active
                    ? 'border-primary'
                    : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- backend media URLs */}
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      ) : null}

      <DialogPrimitive.Root open={zoom !== null} onOpenChange={open => !open && setZoom(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/95" />
          <DialogPrimitive.Content className="fixed inset-0 z-[91] flex items-center justify-center outline-none">
            <DialogPrimitive.Title className="sr-only">{name}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Full screen image
            </DialogPrimitive.Description>
            {zoom !== null && media[zoom] ? (
              // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
              <img
                src={media[zoom].url}
                alt=""
                className="max-h-[85dvh] max-w-full object-contain"
              />
            ) : null}
            {media.length > 1 && zoom !== null ? (
              <>
                <button
                  type="button"
                  onClick={() => setZoom((zoom - 1 + media.length) % media.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((zoom + 1) % media.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
      <div className="-mx-4 aspect-[1/0.85] animate-pulse bg-[#efe6da] lg:mx-0 lg:aspect-square lg:rounded-2xl" />
      <div className="flex flex-col gap-3">
        <div className="h-8 w-1/3 animate-pulse rounded bg-[#efe6da]" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-[#efe6da]" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-[#efe6da]" />
        <div className="mt-4 h-24 w-full animate-pulse rounded bg-[#efe6da]" />
      </div>
    </div>
  );
}
