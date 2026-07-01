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
  const rootClassName = clsx('min-w-0', compact ? 'mt-4' : 'mt-6', className);
  const itemGapClass = compact ? 'gap-[8px]' : 'gap-[10px]';
  const cardSizeClass = large
    ? 'w-full max-w-[110px] aspect-[110/108]'
    : 'w-full max-w-[100px] aspect-[100/98]';
  const imageSizeClass = large ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-10 w-10 sm:h-12 sm:w-12';
  const activeLabelSizeClass = large ? 'text-[22px]' : 'text-[20px]';
  const inactiveLabelSizeClass = large ? 'sm:text-[13px]' : 'sm:text-[12px]';

  return (
    <div className={rootClassName}>
      <div className="horoscope-details-zodiac-mob -mx-1 min-w-0 overflow-x-auto md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={clsx('flex px-1 py-2', itemGapClass)}>
          {HOROSCOPE_SIGNS.map((sign, i) => {
            const label = HOROSCOPE_DATA[language][i]!.name;
            const active = sign === activeSign;
            return (
              <Link
                key={sign}
                href={hrefForSign(sign)}
                className={clsx(
                  'group flex shrink-0 flex-col items-center gap-[10px] rounded-[60px] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F8F3DF]',
                  large ? 'w-[110px]' : 'w-[100px]',
                )}
              >
                <div
                  className={clsx(
                    'flex items-center justify-center rounded-[60px] border-[3px] border-solid p-[4px] opacity-100 transition-[border-color,box-shadow,background-color,transform] duration-200 transform rotate-0',
                    cardSizeClass,
                    active
                      ? 'border-[#611508] bg-[#faf6f0]'
                      : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#611508] group-hover:bg-[#faf2f2] group-hover:shadow-sm',
                  )}
                >
                  <div className={clsx('relative', imageSizeClass)}>
                    {lightImageBySign ? (
                      <>
                        <Image
                          src={lightImageBySign[sign]}
                          alt={label}
                          fill
                          className={clsx(
                            'object-contain transition-opacity duration-200',
                            active ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
                          )}
                        />
                        <Image
                          src={imageBySign[sign]}
                          alt={label}
                          fill
                          className={clsx(
                            'object-contain transition-opacity duration-200',
                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          )}
                        />
                      </>
                    ) : (
                      <Image src={imageBySign[sign]} alt={label} fill className="object-contain" />
                    )}
                  </div>
                </div>
                <span
                  className={clsx(
                    'text-center transition-colors duration-200',
                    active
                      ? `font-mukta font-medium ${activeLabelSizeClass} leading-[100%] tracking-[0%] text-[#611508]`
                      : `font-tiro-devanagari text-[11px] font-normal leading-tight text-[#9a6b5c] group-hover:text-[#691709] ${inactiveLabelSizeClass}`,
                  )}
                >
                  {label}
                </span>
                {showActiveDot ? (
                  <span
                    className={clsx(
                      'h-[8px] w-[8px] rounded-full bg-[#611508] transition-opacity duration-200',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      <div
        className={clsx(
          'hidden md:grid md:grid-cols-6 lg:grid-cols-12',
          compact ? 'gap-[8px]' : 'gap-[10px]',
        )}
      >
        {HOROSCOPE_SIGNS.map((sign, i) => {
          const label = HOROSCOPE_DATA[language][i]!.name;
          const active = sign === activeSign;
          return (
            <Link
              key={sign}
              href={hrefForSign(sign)}
              className={clsx(
                'group flex flex-col items-center rounded-[60px] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F8F3DF] mx-auto',
                compact ? 'gap-[8px]' : 'gap-[10px]',
                large ? 'w-full max-w-[110px]' : 'w-full max-w-[100px]',
              )}
            >
              <div
                className={clsx(
                  'flex items-center justify-center rounded-[60px] border-[3px] border-solid p-[4px] opacity-100 transition-[border-color,box-shadow,background-color,transform] duration-200 transform rotate-0',
                  cardSizeClass,
                  active
                    ? 'border-[#611508] bg-[#faf6f0]'
                    : 'border-[#d5d3d0] bg-[#f2f0ee] group-hover:border-[#611508] group-hover:bg-[#faf2f2] group-hover:shadow-sm',
                )}
              >
                <div className={clsx('relative', imageSizeClass)}>
                  {lightImageBySign ? (
                    <>
                      <Image
                        src={lightImageBySign[sign]}
                        alt={label}
                        fill
                        className={clsx(
                          'object-contain transition-opacity duration-200',
                          active ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
                        )}
                      />
                      <Image
                        src={imageBySign[sign]}
                        alt={label}
                        fill
                        className={clsx(
                          'object-contain transition-opacity duration-200',
                          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                        )}
                      />
                    </>
                  ) : (
                    <Image src={imageBySign[sign]} alt={label} fill className="object-contain" />
                  )}
                </div>
              </div>
              <span
                className={clsx(
                  'text-center transition-colors duration-200',
                  active
                    ? `font-mukta font-medium ${activeLabelSizeClass} leading-[100%] tracking-[0%] text-[#611508]`
                    : `font-tiro-devanagari text-[11px] font-normal leading-tight text-[#9a6b5c] group-hover:text-[#691709] ${inactiveLabelSizeClass}`,
                )}
              >
                {label}
              </span>
              {showActiveDot ? (
                <span
                  className={clsx(
                    'h-[8px] w-[8px] rounded-full bg-[#611508] transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
