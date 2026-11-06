'use client';

import clsx from 'clsx';

/** The app's PackageSwitchTab: a cream pill with the active tab in maroon. */
export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
  className,
  splitOnDesktop = false,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
  /** Desktop: separate outlined pills (Figma My-Consultation) instead of one bar. */
  splitOnDesktop?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={clsx(
        'flex gap-1.5 rounded-full border border-[#BE7B71] bg-[#F8F3DF] p-2',
        splitOnDesktop && 'lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0',
        className,
      )}
    >
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'h-10 min-w-0 flex-1 truncate rounded-full px-1 font-raleway text-[14px] font-semibold transition-colors sm:text-[15px]',
            active === t.id ? 'bg-primary text-[#F8F3DF]' : 'text-primary',
            splitOnDesktop &&
              'lg:h-11 lg:flex-none lg:border lg:border-[#BE7B71] lg:px-6 lg:text-[17px] lg:font-medium',
            splitOnDesktop && active === t.id && 'lg:border-primary',
            splitOnDesktop && active !== t.id && 'lg:bg-transparent lg:hover:bg-[#F8F3DF]',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
