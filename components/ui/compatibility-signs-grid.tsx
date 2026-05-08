'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

import type { HoroscopeSign } from '@/lib/types/horoscope';

type SignImage = string | StaticImageData;

export type CompatibilitySignItem = {
  slug: HoroscopeSign;
  name: string;
  image: SignImage;
  href: string;
};

type Props = {
  title: string;
  currentSignLabel: string;
  currentSignImage: SignImage;
  items: CompatibilitySignItem[];
  variant?: 'compact' | 'figma';
  className?: string;
};

export function CompatibilitySignsGrid({
  title,
  currentSignLabel,
  currentSignImage,
  items,
  variant = 'compact',
  className,
}: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618]">{title}</h3>
      <div
        className={clsx(
          'mt-3 grid grid-cols-1',
          variant === 'figma'
            ? 'gap-4 sm:grid-cols-2 lg:grid-cols-4'
            : 'gap-3 sm:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {items.map(item => (
          <Link
            key={item.slug}
            href={item.href}
            className={clsx(
              'transition-colors hover:border-[#f4a11a]/80',
              variant === 'figma'
                ? 'flex min-h-[172px] items-center justify-center gap-4 rounded-[20px] border border-[#383838] p-4'
                : 'rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] px-2 py-2',
            )}
          >
            {variant === 'figma' ? (
              <>
                <div className="flex h-full w-[100px] flex-col items-center gap-4">
                  <Image
                    src={currentSignImage}
                    alt={currentSignLabel}
                    className="h-[96px] w-[100px] object-contain"
                  />
                  <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                    {currentSignLabel}
                  </span>
                </div>
                <span className="text-[44px] leading-none text-[#7b241f]">❤</span>
                <div className="flex h-full w-[110px] flex-col items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="h-[96px] w-[110px] object-contain"
                  />
                  <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                    {item.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1">
                  <Image
                    src={currentSignImage}
                    alt={currentSignLabel}
                    className="h-[42px] w-[42px] object-contain"
                  />
                  <span className="text-[14px] text-[#ff1a78]">❤</span>
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="h-[42px] w-[42px] object-contain"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between px-1">
                  <span className="font-mukta text-[10px] text-[#846e5f]">{currentSignLabel}</span>
                  <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
