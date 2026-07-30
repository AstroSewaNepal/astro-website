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
      className="group block w-[340px] h-[135px] rounded-[33px] border border-[#cfb8a5] px-[14px] py-[12px] opacity-100 transition-colors hover:bg-[#f8f0e4] sm:w-auto sm:h-auto sm:rounded-[12px] sm:px-3 sm:py-2"
    >
      <article>
        <div className="flex items-center gap-[15px] sm:gap-2">
          {imageColor ? (
            <div className="relative h-[104px] w-[120px] shrink-0 rotate-0 sm:h-[46px] sm:w-[46px]">
              <Image
                src={image}
                alt={name}
                className="h-[104px] w-[120px] object-contain opacity-100 transition-opacity duration-200 group-hover:opacity-0 rotate-0 sm:h-[46px] sm:w-[46px]"
                style={{ opacity: active ? 0 : undefined }}
              />
              <Image
                src={imageColor}
                alt={name}
                className="absolute inset-0 h-[104px] w-[120px] object-contain opacity-100 transition-opacity duration-200 group-hover:opacity-100 rotate-0 sm:h-[46px] sm:w-[46px]"
                style={{ opacity: active ? 1 : undefined }}
              />
            </div>
          ) : (
            <Image
              src={image}
              alt={name}
              className="h-[104px] w-[120px] object-contain opacity-100 rotate-0 sm:h-[46px] sm:w-[46px]"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-mukta text-[22px] font-bold leading-[32px] text-center text-[#742718] sm:text-[13px] sm:leading-5 sm:text-left">
                {name}
              </h3>
              {showRating ? (
                <div className="flex items-center gap-0.5 text-[#ef8a20]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <StartIcon
                      key={`${name}-${index}`}
                      className="h-4 w-4 rotate-0 opacity-100 text-[#ef8a20]"
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <p className="mt-0.5 font-mukta font-light text-[14px] leading-[120%] text-[#7b6b61]">
              {blurb}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta font-semibold text-[14px] leading-[28px] text-[#7b3b27]">
              {readMoreLabel}
              <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
