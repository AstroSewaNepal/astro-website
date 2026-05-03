'use client';

import clsx from 'clsx';

import { ELanguage } from '@/components/enums/language.enum';

type Props = {
  language: ELanguage;
  onChange: (lang: ELanguage) => void;
  englishLabel?: string;
  nepaliLabel?: string;
  className?: string;
};

export function ZodiacLangPillToggle({
  language,
  onChange,
  englishLabel = 'English',
  nepaliLabel = 'Nepali',
  className,
}: Props) {
  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      <button
        type="button"
        onClick={() => onChange(ELanguage.ENGLISH)}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          language === ELanguage.ENGLISH
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
        )}
      >
        {englishLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(ELanguage.NEPALI)}
        className={clsx(
          'rounded-full border px-4 py-2 font-mukta text-[12px] transition-colors',
          language === ELanguage.NEPALI
            ? 'border-[#6f2618] bg-[#6f2618] text-white'
            : 'border-[#c8af98] bg-[#fff8ef] text-[#6f2618]',
        )}
      >
        {nepaliLabel}
      </button>
    </div>
  );
}
