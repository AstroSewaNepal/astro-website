'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';

import ArrowRight from '@/components/icons/arrow-right';
import StartIcon from '@/components/icons/start-icon';

type Props = {
  href: string;
  image: string | StaticImageData;
  imageColor?: string | StaticImageData;
  name: string;
  blurb: string;
  readMoreLabel: string;
  showRating?: boolean;
  active?: boolean;
};

export function ZodiacSignMiniCard({
  href,
  image,
  imageColor,
  name,
  blurb,
  readMoreLabel,
  showRating = true,
  active = false,
}: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-[12px] border border-[#cfb8a5] px-3 py-2 transition-colors hover:bg-[#f8f0e4]"
    >
      <article>
        <div className="flex items-center gap-2">
          {imageColor ? (
            <div className="relative h-[46px] w-[46px] shrink-0">
              <Image
                src={image}
                alt={name}
                className="h-[46px] w-[46px] object-contain transition-opacity duration-200 group-hover:opacity-0"
                style={{ opacity: active ? 0 : undefined }}
              />
              <Image
                src={imageColor}
                alt={name}
                className="absolute inset-0 h-[46px] w-[46px] object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ opacity: active ? 1 : undefined }}
              />
            </div>
          ) : (
            <Image src={image} alt={name} className="h-[46px] w-[46px] object-contain" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">{name}</h3>
              {showRating ? (
                <div className="flex items-center gap-0.5 text-[#ef8a20]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <StartIcon key={`${name}-${index}`} className="h-3 w-3 text-[#ef8a20]" />
                  ))}
                </div>
              ) : null}
            </div>
            <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">{blurb}</p>
            <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
              {readMoreLabel}
              <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
