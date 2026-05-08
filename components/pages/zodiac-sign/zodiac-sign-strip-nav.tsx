'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

import { ELanguage } from '@/components/enums/language.enum';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { HOROSCOPE_SIGNS, type HoroscopeSign } from '@/lib/types/horoscope';

type SignImage = string | StaticImageData;

type Props = {
  activeSign: HoroscopeSign;
  language: ELanguage;
  imageBySign: Record<HoroscopeSign, SignImage>;
  lightImageBySign?: Record<HoroscopeSign, SignImage>;
  hrefForSign: (sign: HoroscopeSign) => string;
  compact?: boolean;
  large?: boolean;
  showActiveDot?: boolean;
  className?: string;
};

export function ZodiacSignStripNav({
  activeSign,
  language,
  imageBySign,
  lightImageBySign,
  hrefForSign,
  compact = false,
  large = false,
  showActiveDot = false,
  className,
}: Props) {
  return (
    <div className={clsx('flex gap-3 overflow-x-auto pb-3', className)}>
      {HOROSCOPE_SIGNS.map((sign, i) => {
        const label = HOROSCOPE_DATA[language][i]!.name;
        const active = sign === activeSign;
        return (
          <Link
            key={sign}
            href={hrefForSign(sign)}
            className={clsx(
              'group flex flex-col items-center gap-1 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4a11a]/80',
              compact ? 'min-w-[56px]' : large ? 'min-w-[84px] sm:min-w-[92px] lg:min-w-[100px]' : 'min-w-[62px]',
            )}
          >
            <div
              className={clsx(
                'flex items-center justify-center rounded-full border transition-[border-color,box-shadow,background-color] duration-200',
                compact
                  ? 'h-[48px] w-[48px] p-1'
                  : large
                    ? 'h-[64px] w-[64px] p-1.5 sm:h-[72px] sm:w-[72px] lg:h-[88px] lg:w-[88px]'
                    : 'h-[52px] w-[52px] p-1.5',
                active
                  ? 'border-[#c9a063] bg-[#faf6f0] ring-2 ring-[#e8c47a]/35'
                  : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#c9a88a] group-hover:bg-[#faf8f6] group-hover:shadow-sm',
              )}
            >
              {lightImageBySign ? (
                <div className="relative h-full w-full">
                  <Image
                    src={lightImageBySign[sign]}
                    alt={label}
                    className={clsx(
                      'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                      active ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
                    )}
                  />
                  <Image
                    src={imageBySign[sign]}
                    alt={label}
                    className={clsx(
                      'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  />
                </div>
              ) : (
                <Image src={imageBySign[sign]} alt={label} className="h-full w-full object-contain" />
              )}
            </div>
            <span
              className={clsx(
                'text-center font-tiro-devanagari font-normal leading-tight transition-colors duration-200',
                active ? 'text-[#611508]' : 'text-[#9a6b5c] group-hover:text-[#691709]',
                compact
                  ? 'max-w-[56px] truncate text-[10px]'
                  : large
                    ? 'text-[13px] sm:text-[14px]'
                    : 'text-[11px] sm:text-[12px]',
              )}
            >
              {label}
            </span>
            {showActiveDot ? (
              <span
                className={clsx(
                  'h-[7px] w-[7px] rounded-full bg-[#f4a11a] transition-opacity duration-200',
                  active ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
