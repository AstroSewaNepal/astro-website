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
  imageLight?: SignImage;
  href: string;
};

type Props = {
  title: string;
  currentSignLabel: string;
  currentSignImage: SignImage;
  currentSignImageLight?: SignImage;
  items: CompatibilitySignItem[];
  variant?: 'compact' | 'figma';
  className?: string;
};

export function CompatibilitySignsGrid({
  title,
  currentSignLabel,
  currentSignImage,
  currentSignImageLight,
  items,
  variant = 'compact',
  className,
}: Props) {
  if (items.length === 0) {
    return null;
  }

  const currentLight = currentSignImageLight ?? currentSignImage;

  const renderSignImage = (colorSrc: SignImage, lightSrc: SignImage, alt: string) => (
    <div className="relative h-[96px] w-[100px] sm:h-[96px] sm:w-[110px]">
      <Image
        src={lightSrc}
        alt={alt}
        className="h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-0"
      />
      <Image
        src={colorSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );

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
        {items.map(item => {
          const itemLight = item.imageLight ?? item.image;
          return (
            <Link
              key={item.slug}
              href={item.href}
              onClick={() => window.scrollTo(0, 0)}
              className={clsx(
                'group transition-colors hover:border-[#f4a11a]/80',
                variant === 'figma'
                  ? 'flex min-h-[172px] items-center justify-center gap-4 rounded-[20px] border border-[#383838] p-4'
                  : 'rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] px-2 py-2',
              )}
            >
              {variant === 'figma' ? (
                <>
                  <div className="flex h-full w-[100px] flex-col items-center gap-4">
                    {renderSignImage(currentSignImage, currentLight, currentSignLabel)}
                    <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                      {currentSignLabel}
                    </span>
                  </div>
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    fill="none"
                    className="flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.0013 39.1417L19.343 36.7217C9.9013 28.16 3.66797 22.495 3.66797 15.5833C3.66797 9.91833 8.10464 5.5 13.7513 5.5C16.9413 5.5 20.003 6.985 22.0013 9.31333C23.9996 6.985 27.0613 5.5 30.2513 5.5C35.898 5.5 40.3346 9.91833 40.3346 15.5833C40.3346 22.495 34.1013 28.16 24.6596 36.7217L22.0013 39.1417Z"
                      fill="#862C23"
                    ></path>
                  </svg>

                  <div className="flex h-full w-[110px] flex-col items-center gap-4">
                    {renderSignImage(item.image, itemLight, item.name)}
                    <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                      {item.name}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src={currentLight}
                      alt={currentSignLabel}
                      className="h-[42px] w-[42px] object-contain"
                    />
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      className="flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.0013 39.1417L19.343 36.7217C9.9013 28.16 3.66797 22.495 3.66797 15.5833C3.66797 9.91833 8.10464 5.5 13.7513 5.5C16.9413 5.5 20.003 6.985 22.0013 9.31333C23.9996 6.985 27.0613 5.5 30.2513 5.5C35.898 5.5 40.3346 9.91833 40.3346 15.5833C40.3346 22.495 34.1013 28.16 24.6596 36.7217L22.0013 39.1417Z"
                        fill="#862C23"
                      ></path>
                    </svg>

                    <Image
                      src={itemLight}
                      alt={item.name}
                      className="h-[42px] w-[42px] object-contain"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between px-1">
                    <span className="font-mukta text-[10px] text-[#846e5f]">
                      {currentSignLabel}
                    </span>
                    <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
