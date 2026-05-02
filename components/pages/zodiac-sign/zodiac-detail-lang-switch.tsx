'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { zodiacEnglishDetailHref, zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import type { HoroscopeSign } from '@/lib/types/horoscope';

type Props = {
  signSlug: HoroscopeSign;
  className?: string;
};

/** Switches between English and Nepali zodiac detail routes for the same `sign`. */
export function ZodiacDetailLangSwitch({ signSlug, className }: Props) {
  const pathname = usePathname();
  const onNepali = pathname.includes('zodiac-detailnepali');

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      <Link
        href={zodiacEnglishDetailHref(signSlug)}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          !onNepali
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618] hover:border-[#6f2618]/40',
        )}
      >
        English
      </Link>
      <Link
        href={zodiacNepaliDetailHref(signSlug)}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          onNepali
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618] hover:border-[#6f2618]/40',
        )}
      >
        Nepali
      </Link>
    </div>
  );
}
