'use client';

import { useState, useEffect } from 'react';
import AstroSewaLogo from '@/components/logo';
import TransparentBellIcon from '@/components/icons/bell';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import LanguageEarthIcon from '@/components/icons/language/earth';
import Link from 'next/link';

type NavItem = {
  title: string;
  link?: string;
  children?: unknown[];
};

const LANDING_NAV: NavItem[] = [
  { title: 'Horoscope', children: [] },
  { title: 'Zodiac Signs', children: [] },
  { title: 'Kundali', children: [] },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', children: [] },
  { title: 'Calculator', children: [] },
  { title: 'Blog', link: '/blogs' },
];

const MOBILE_NAV: NavItem[] = [
  { title: 'Home' },
  { title: 'About Us', link: '/about-us' },
  { title: 'Horoscope', children: [] },
  { title: 'Zodiac Sign', children: [] },
  { title: 'Kundali', children: [] },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', children: [] },
  { title: 'Calculator', children: [] },
  { title: 'Blog', link: '/blogs' },
];

const NavIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="cursor-pointer">
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
    <button onClick={onClick} className="cursor-pointer">
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

export const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="container mx-auto px-6 lg:px-0 py-10">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="block md:hidden">
              <NavIcon onClick={openMobileMenu} />
            </div>
            <Link href="/">
              <AstroSewaLogo className="max-w-[84px] text-[#611508] md:max-w-[100px] lg:max-w-[188px] w-full" />
            </Link>
          </div>
          <div className="flex gap-4">
            <div className="px-[15px] py-2 rounded-3xl border border-solid border-primary max-h-fit items-center gap-1 text-primary hidden lg:flex">
              <LanguageEarthIcon />
              <p className="font-mukta text-primary text-sm md:text-lg lg:text-xl leading-7">EN</p>
              <ChevronDownIcon />
            </div>
            <button className="bg-primary rounded-3xl px-5 py-2 text-white flex gap-1.5 max-h-fit items-center cursor-pointer">
              <UserLineIcon className="w-3 h-3 lg:w-6 lg:h-6" />
              <p className="font-mukta text-sm md:text-lg lg:text-xl leading-7 max-h-fit">
                Sign in
              </p>
            </button>
            <button className="bg-primary p-2.5 rounded-full text-white max-h-fit">
              <TransparentBellIcon />
            </button>
          </div>
        </div>
        <nav className="mt-10 items-center justify-center bg-primary py-3 gap-[22px] rounded-3xl hidden lg:flex">
          {LANDING_NAV.map(value => {
            return (
              <Link href={value.link ?? ''} key={value.title}>
                <div
                  key={value.title}
                  className="text-white flex items-center justify-center py-[7px] px-[17px]"
                >
                  <p className="font-mukta font-light text-xl leading-7">{value.title}</p>
                  {value.children && <ChevronDownIcon className="text-white" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Full-screen Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
      >
        {/* Overlay backdrop */}
        <div
          className="absolute inset-0 bg-black/20 transition-opacity duration-300"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Sidebar Menu */}
        <div
          className={`absolute left-0 top-0 h-full w-[377px] max-w-full bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] overflow-y-auto transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-[29px] px-[33px] py-[19px]">
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between w-full">
              <AstroSewaLogo className="max-w-[64px] text-[#611508] w-full" />
              <CloseIcon onClick={closeMobileMenu} />
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-3">
              {MOBILE_NAV.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0;
                const content = (
                  <div className="flex items-center justify-between w-full">
                    <p className="font-tiro-devanagari text-[22px] leading-[32px] text-[#691709]">
                      {item.title}
                    </p>
                    {hasChildren && (
                      <ChevronDownIcon className="text-[#691709] w-[13.3px] h-[7.66px]" />
                    )}
                  </div>
                );

                if (item.link) {
                  return (
                    <Link key={`${item.title}-${index}`} href={item.link} onClick={closeMobileMenu}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={`${item.title}-${index}`} className="w-full">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
