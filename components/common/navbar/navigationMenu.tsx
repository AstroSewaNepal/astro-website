'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import ChevronDownIcon from '@/components/icons/chevron-down';

export interface NavigationMenuItem {
  title: string;
  active?: boolean;
  hasChildren?: boolean;
  link?: string;
}

interface NavigationMenuProps {
  items: NavigationMenuItem[];
  className?: string;
  onItemClick?: (item: NavigationMenuItem) => void;
}

const NavIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="cursor-pointer" aria-label="Open navigation menu">
      <svg
        width="48"
        height="36"
        viewBox="0 0 48 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="7.7207" y="7.26404" width="33.6" height="4.54054" rx="2.27027" fill="#691709" />
        <rect x="7.7207" y="14.5297" width="27.2432" height="4.54054" rx="2.27027" fill="#691709" />
        <rect x="7.7207" y="21.7953" width="18.6162" height="4.54054" rx="2.27027" fill="#691709" />
      </svg>
    </button>
  );
};

const CloseIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="cursor-pointer" aria-label="Close navigation menu">
      <svg
        width="29"
        height="29"
        viewBox="0 0 29 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="29" height="29" rx="14.5" fill="rgba(105, 23, 9, 0.13)" />
        <path
          d="M10 10L19 19M19 10L10 19"
          stroke="#691709"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const NavigationMenu: React.FC<NavigationMenuProps> = ({ items, className, onItemClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      // Lock vertical scroll when mobile menu is open.
      // Do not touch overflowX so global horizontal overflow guard remains effective.
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = '';
    }

    return () => {
      document.body.style.overflowY = '';
    };
  }, [isMobileMenuOpen]);

  const handleItemClick = (item: NavigationMenuItem) => {
    onItemClick?.(item);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className={clsx('lg:hidden', className)}>
        <NavIcon onClick={() => setIsMobileMenuOpen(true)} />
      </div>

      <nav
        className={clsx(
          'mx-auto hidden w-full max-w-[1180px] flex-wrap items-center justify-center gap-2 rounded-full bg-[#6f2618] px-3 py-2.5 shadow-[0_16px_40px_rgba(97,21,8,0.24)] ring-1 ring-[#8f4a36]/35 sm:gap-3 sm:px-4 lg:flex',
          className,
        )}
      >
        {items.map(item => (
          <button
            key={item.title}
            type="button"
            onClick={() => handleItemClick(item)}
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-4 py-2 font-mukta text-[13px] font-medium transition-colors sm:px-5 sm:text-[15px]',
              item.active
                ? 'bg-[#8a3e29] text-[#fff4ea] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                : 'text-[#f7e7dc] hover:bg-white/10',
            )}
          >
            <span>{item.title}</span>
            {item.hasChildren ? <ChevronDownIcon className="h-4 w-4 text-current" /> : null}
          </button>
        ))}
      </nav>

      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
        style={{ pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
      >
        <div
          className="absolute inset-0 bg-black/20 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        <div
          className={clsx(
            'absolute left-0 top-0 h-full w-[377px] max-w-full bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] overflow-y-auto transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-end px-[33px] py-[19px]">
            <CloseIcon onClick={() => setIsMobileMenuOpen(false)} />
          </div>

          <div className="flex flex-col gap-3 px-[33px] pb-[19px]">
            {items.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex items-center justify-between w-full text-left"
              >
                <p className="font-tiro-devanagari text-[22px] leading-[32px] text-[#691709]">
                  {item.title}
                </p>
                {item.hasChildren ? (
                  <ChevronDownIcon className="text-[#691709] w-[13.3px] h-[7.66px]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
