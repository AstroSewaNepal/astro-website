'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { zodiacEnglishDetailHref, zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { parseZodiacSignParam } from '@/lib/zodiac-sign/parse-sign-param';
import type { HoroscopeSign } from '@/lib/types/horoscope';

type Props = {
  signSlug: HoroscopeSign;
  className?: string;
};

/** Switches between English and Nepali zodiac detail routes for the same `sign`. */
export function ZodiacDetailLangSwitch({ signSlug, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = parseZodiacSignParam(searchParams.get('sign')) ?? signSlug;
  const onNepali = pathname.startsWith('/zodiac-sign/zodiac-detailnepali');

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      <button
        type="button"
        onClick={() => router.push(zodiacEnglishDetailHref(slug))}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          !onNepali
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618] hover:border-[#6f2618]/40',
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => router.push(zodiacNepaliDetailHref(slug))}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          onNepali
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618] hover:border-[#6f2618]/40',
        )}
      >
        Nepali
      </button>
    </div>
  );
}
