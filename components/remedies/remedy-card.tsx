'use client';

import Link from 'next/link';

import {
  coverImage,
  moneyLabel,
  remedyPath,
  remedyPrice,
  type Remedy,
} from '@/lib/remedies/catalogue';

import { CartControls, ShareRemedyButton } from './remedy-bits';

/** The app's RemedyCard: image, "% OFF" ribbon, name + share, seller, category, price, cart controls. */
export function RemedyCard({ remedy }: { remedy: Remedy }) {
  const price = remedyPrice(remedy);
  const image = coverImage(remedy.media);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#BE7B71] bg-[#FFFAE6] shadow-[0_2px_4px_rgba(114,10,11,0.08)] transition-shadow hover:shadow-[0_6px_18px_rgba(114,10,11,0.14)]">
      <div className="relative aspect-[1/1.05] w-full overflow-hidden bg-[#F1DBD7]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#FFFAE6] font-raleway text-[32px] font-bold text-primary">
            {remedy.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {remedy.discount > 0 ? (
        <span className="absolute right-[-30px] top-[16px] w-[110px] rotate-45 bg-primary py-[3px] text-center text-[11px] font-semibold text-white">
          {remedy.discount}% OFF
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="line-clamp-2 min-h-10 flex-1 text-[15px] font-semibold leading-5 text-[#1C1C1C]">
            {/* The whole card opens the product (stretched link); the buttons sit above it. */}
            <Link
              href={remedyPath(remedy.id)}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {remedy.name}
            </Link>
          </h3>
          <ShareRemedyButton remedy={remedy} price={price} className="relative z-[1] h-6 w-6" />
        </div>
        {remedy.astrologer?.astrologerName ? (
          <p className="truncate text-[12px] text-primary">by {remedy.astrologer.astrologerName}</p>
        ) : null}
        {remedy.category?.title ? (
          <p className="truncate text-[12px] text-[#79787A]">{remedy.category.title}</p>
        ) : null}
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[15px] font-semibold text-primary">
            {moneyLabel(price.currency, price.value)}
          </span>
          {price.full !== null ? (
            <s className="text-[12px] text-[#949395]">{moneyLabel(price.currency, price.full)}</s>
          ) : null}
        </p>
        <div className="relative z-[1] mt-auto pt-1">
          <CartControls remedy={remedy} variant="card" />
        </div>
      </div>
    </article>
  );
}

export function RemedyCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-[#e3c9b5] bg-[#FFFAE6]">
      <div className="aspect-[1/1.05] w-full animate-pulse bg-[#efe6da]" />
      <div className="flex flex-col gap-2 p-2.5">
        <div className="h-4 w-4/5 animate-pulse rounded bg-[#efe6da]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#efe6da]" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-[#efe6da]" />
        <div className="h-[34px] w-full animate-pulse rounded-lg bg-[#efe6da]" />
      </div>
    </div>
  );
}
