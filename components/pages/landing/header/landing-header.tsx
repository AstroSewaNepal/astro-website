'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import AstroSewaLogo from '@/components/logo';
import TransparentBellIcon from '@/components/icons/bell';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import LanguageEarthIcon from '@/components/icons/language/earth';
import Link from 'next/link';

import { ELanguage } from '@/components/enums/language.enum';
import { horoscopeEn } from '@/lib/i18n/horoscope';
import { useHoroscopeLocaleOptional } from '@/lib/i18n/horoscope/horoscope-locale-context';

type NavChild = {
  title: string;
  link?: string;
  children?: { title: string; link: string }[];
};

type NavItem = {
  title: string;
  link?: string;
  children?: NavChild[];
};

const LANDING_NAV: NavItem[] = [
  {
    title: 'Horoscope',
    children: [
      { title: "Today's Horoscope", link: '/horoscope' },
      { title: "Tomorrow's Horoscope", link: '/horoscope' },
      { title: 'Weekly Horoscope', link: '/horoscope' },
      { title: 'Monthly Horoscope', link: '/horoscope' },
      { title: 'Love Horoscope', link: '/horoscope' },
      { title: 'Chinese Horoscope', link: '/horoscope' },
      { title: 'Marriage Horoscope', link: '/horoscope' },
    ],
  },
  {
    title: 'Zodiac Signs',
    children: [
      {
        title: 'English Zodiac',
        children: [
          { title: 'Aries', link: '/zodiac-signs/english/aries' },
          { title: 'Taurus', link: '/zodiac-signs/english/taurus' },
          { title: 'Gemini', link: '/zodiac-signs/english/gemini' },
          { title: 'Cancer', link: '/zodiac-signs/english/cancer' },
          { title: 'Leo', link: '/zodiac-signs/english/leo' },
          { title: 'Virgo', link: '/zodiac-signs/english/virgo' },
          { title: 'Libra', link: '/zodiac-signs/english/libra' },
          { title: 'Scorpio', link: '/zodiac-signs/english/scorpio' },
          { title: 'Sagittarius', link: '/zodiac-signs/english/sagittarius' },
          { title: 'Capricorn', link: '/zodiac-signs/english/capricorn' },
          { title: 'Aquarius', link: '/zodiac-signs/english/aquarius' },
          { title: 'Pisces', link: '/zodiac-signs/english/pisces' },
        ],
      },
      {
        title: 'Nepali Zodiac',
        children: [
          { title: 'Mesh Rashi', link: '/zodiac-signs/nepali/mesh' },
          { title: 'Brish Rashi', link: '/zodiac-signs/nepali/brish' },
          { title: 'Mithun Rashi', link: '/zodiac-signs/nepali/mithun' },
          { title: 'Karkat Rashi', link: '/zodiac-signs/nepali/karkat' },
          { title: 'Simha Rashi', link: '/zodiac-signs/nepali/simha' },
          { title: 'Kanya Rashi', link: '/zodiac-signs/nepali/kanya' },
          { title: 'Tula Rashi', link: '/zodiac-signs/nepali/tula' },
          { title: 'Brischik Rashi', link: '/zodiac-signs/nepali/brischik' },
          { title: 'Dhanu Rashi', link: '/zodiac-signs/nepali/dhanu' },
          { title: 'Makar Rashi', link: '/zodiac-signs/nepali/makar' },
          { title: 'Kumbha Rashi', link: '/zodiac-signs/nepali/kumbha' },
          { title: 'Meen Rashi', link: '/zodiac-signs/nepali/meen' },
        ],
      },
    ],
  },
  {
    title: 'Kundali',
    link: '/kundali-details',
    children: [
      { title: 'Free Kundali', link: '/free-kundali' },
      { title: 'Kundali Matching', link: '/kundali-matching' },
      { title: 'Kundali Details', link: '/kundali-details' },
    ],
  },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', children: [] },
  { title: 'Calculator', children: [], link: '/calculators' },
  { title: 'Blog', link: '/blogs' },
  { title: 'Calander', link: '/calander' },
];

const MOBILE_NAV: NavItem[] = [
  { title: 'Home', link: '/' },
  { title: 'About Us', link: '/about-us' },
  {
    title: 'Horoscope',
    children: [
      { title: "Today's Horoscope", link: '/horoscope' },
      { title: "Tomorrow's Horoscope", link: '/horoscope' },
      { title: 'Weekly Horoscope', link: '/horoscope' },
      { title: 'Monthly Horoscope', link: '/horoscope' },
      { title: 'Love Horoscope', link: '/horoscope' },
      { title: 'Chinese Horoscope', link: '/horoscope' },
      { title: 'Marriage Horoscope', link: '/horoscope' },
    ],
  },
  {
    title: 'Zodiac Sign',
    children: [
      {
        title: 'English Zodiac',
        children: [
          { title: 'Aries', link: '/zodiac-signs/english/aries' },
          { title: 'Taurus', link: '/zodiac-signs/english/taurus' },
          { title: 'Gemini', link: '/zodiac-signs/english/gemini' },
          { title: 'Cancer', link: '/zodiac-signs/english/cancer' },
          { title: 'Leo', link: '/zodiac-signs/english/leo' },
          { title: 'Virgo', link: '/zodiac-signs/english/virgo' },
          { title: 'Libra', link: '/zodiac-signs/english/libra' },
          { title: 'Scorpio', link: '/zodiac-signs/english/scorpio' },
          { title: 'Sagittarius', link: '/zodiac-signs/english/sagittarius' },
          { title: 'Capricorn', link: '/zodiac-signs/english/capricorn' },
          { title: 'Aquarius', link: '/zodiac-signs/english/aquarius' },
          { title: 'Pisces', link: '/zodiac-signs/english/pisces' },
        ],
      },
      {
        title: 'Nepali Zodiac',
        children: [
          { title: 'Mesh Rashi', link: '/zodiac-signs/nepali/mesh' },
          { title: 'Brish Rashi', link: '/zodiac-signs/nepali/brish' },
          { title: 'Mithun Rashi', link: '/zodiac-signs/nepali/mithun' },
          { title: 'Karkat Rashi', link: '/zodiac-signs/nepali/karkat' },
          { title: 'Simha Rashi', link: '/zodiac-signs/nepali/simha' },
          { title: 'Kanya Rashi', link: '/zodiac-signs/nepali/kanya' },
          { title: 'Tula Rashi', link: '/zodiac-signs/nepali/tula' },
          { title: 'Brischik Rashi', link: '/zodiac-signs/nepali/brischik' },
          { title: 'Dhanu Rashi', link: '/zodiac-signs/nepali/dhanu' },
          { title: 'Makar Rashi', link: '/zodiac-signs/nepali/makar' },
          { title: 'Kumbha Rashi', link: '/zodiac-signs/nepali/kumbha' },
          { title: 'Meen Rashi', link: '/zodiac-signs/nepali/meen' },
        ],
      },
    ],
  },
  {
    title: 'Kundali',
    link: '/kundali-details',
    children: [
      { title: 'Free Kundali', link: '/free-kundali' },
      { title: 'Kundali Matching', link: '/kundali-matching' },
      { title: 'Kundali Details', link: '/kundali-details' },
    ],
  },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', children: [] },
  { title: 'Calculator', children: [], link: '/calculators' },
  { title: 'Blog', link: '/blogs' },
  { title: 'Calander', link: '/calander' },
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

function LandingHeaderClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const horoscopeLocale = useHoroscopeLocaleOptional();
  const d = horoscopeEn;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!langMenuOpen) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      const el = langMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [langMenuOpen]);

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  const langCodeLabel =
    horoscopeLocale?.uiLanguage === ELanguage.NEPALI ? d.header.langNe : d.header.langEn;

  const languageControl = horoscopeLocale ? (
    <div className="relative" ref={langMenuRef}>
      <button
        type="button"
        aria-expanded={langMenuOpen}
        aria-haspopup="listbox"
        aria-label="Page language"
        onClick={() => setLangMenuOpen(o => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-3xl border border-solid border-primary px-[15px] py-2 text-primary max-h-fit"
      >
        <LanguageEarthIcon />
        <span className="font-mukta text-sm md:text-lg lg:text-xl leading-7">{langCodeLabel}</span>
        <ChevronDownIcon
          className={clsx('transition-transform duration-200', langMenuOpen && 'rotate-180')}
        />
      </button>
      {langMenuOpen ? (
        <ul
          className="absolute right-0 z-[60] mt-2 min-w-[160px] overflow-hidden rounded-[18px] border border-[#e8ddd0] bg-white py-1 shadow-[0_12px_40px_rgba(92,56,23,0.18)]"
          role="listbox"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={horoscopeLocale.uiLanguage === ELanguage.ENGLISH}
              onClick={() => {
                horoscopeLocale.setUiLanguage(ELanguage.ENGLISH);
                setLangMenuOpen(false);
              }}
              className={clsx(
                'flex w-full px-4 py-3 text-left font-mukta text-[15px] text-[#4a1a1a] hover:bg-[#faf6f0]',
                horoscopeLocale.uiLanguage === ELanguage.ENGLISH && 'bg-[#f9f2e9] font-semibold',
              )}
            >
              {d.list.langEnglish} ({d.header.langEn})
            </button>
          </li>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={horoscopeLocale.uiLanguage === ELanguage.NEPALI}
              onClick={() => {
                horoscopeLocale.setUiLanguage(ELanguage.NEPALI);
                setLangMenuOpen(false);
              }}
              className={clsx(
                'flex w-full px-4 py-3 text-left font-mukta text-[15px] text-[#4a1a1a] hover:bg-[#faf6f0]',
                horoscopeLocale.uiLanguage === ELanguage.NEPALI && 'bg-[#f9f2e9] font-semibold',
              )}
            >
              {d.list.langNepali} ({d.header.langNe})
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  ) : (
    <div className="hidden max-h-fit items-center gap-1 rounded-3xl border border-solid border-primary px-[15px] py-2 text-primary lg:flex">
      <LanguageEarthIcon />
      <p className="font-mukta text-primary text-sm md:text-lg lg:text-xl leading-7">EN</p>
      <ChevronDownIcon />
    </div>
  );

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
            {languageControl}
            <button className="bg-primary rounded-3xl px-5 py-2 text-white flex gap-1.5 max-h-fit items-center cursor-pointer">
              <UserLineIcon className="w-3 h-3 lg:w-6 lg:h-6" />
              <Link href={'/login'}>
                <p className="font-mukta text-sm md:text-lg lg:text-xl leading-7 max-h-fit">
                  Sign in
                </p>
              </Link>
            </button>
            <button className="bg-primary p-2.5 rounded-full text-white max-h-fit">
              <TransparentBellIcon />
            </button>
          </div>
        </div>
        <nav className="mt-10 items-center justify-center bg-primary py-3 gap-[22px] rounded-3xl hidden lg:flex relative z-40">
          {LANDING_NAV.map(value => {
            const hasChildren = !!value.children?.length;

            return (
              <div key={value.title} className="relative group">
                <Link href={value.link ?? '#'} className="block">
                  <div className="text-white flex items-center justify-center py-[7px] px-[17px] rounded-xl hover:bg-hoverColor active:bg-hoverColor">
                    <p className="font-mukta font-light text-xl leading-7">{value.title}</p>
                    {hasChildren && <ChevronDownIcon className="text-white" />}
                  </div>
                </Link>

                {hasChildren ? (
                  <div className="absolute left-0 top-[calc(100%+12px)] min-w-[220px] rounded-none bg-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                    {value.children?.map(child => (
                      <div key={child.title} className="relative group/nested">
                        <Link
                          href={child.link ?? '#'}
                          className="flex items-center justify-between px-4 py-2 font-mukta text-[16px] leading-6 text-primary hover:bg-[#f8f3df]"
                        >
                          <span>{child.title}</span>
                          {child.children && child.children.length > 0 && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M6 3l4 5-4 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </Link>
                        {child.children && child.children.length > 0 && (
                          <div className="absolute left-full top-0 ml-1 min-w-[200px] rounded-none bg-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] py-2 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 z-20">
                            {child.children.map(grandchild => (
                              <Link
                                key={grandchild.title}
                                href={grandchild.link}
                                className="block px-4 py-2 font-mukta text-[16px] leading-6 text-primary hover:bg-[#f8f3df]"
                              >
                                {grandchild.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
      >
        <div
          className="absolute inset-0 bg-black/20 transition-opacity duration-300"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <div
          className={`absolute left-0 top-0 h-full w-[377px] max-w-full bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] overflow-y-auto transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-[29px] px-[33px] py-[19px]">
            <div className="flex items-center justify-between w-full">
              <AstroSewaLogo className="max-w-[64px] text-[#611508] w-full" />
              <CloseIcon onClick={closeMobileMenu} />
            </div>

            <div className="flex flex-col gap-3">
              {MOBILE_NAV.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = openMobileDropdown === item.title;
                const content = (
                  <div className="flex items-center justify-between w-full">
                    <p className="font-tiro-devanagari text-[22px] leading-[32px] text-[#691709]">
                      {item.title}
                    </p>
                    {hasChildren && (
                      <ChevronDownIcon
                        className={`text-[#691709] w-[18px] h-[18px] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                );

                if (hasChildren) {
                  return (
                    <div key={`${item.title}-${index}`} className="w-full">
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setOpenMobileDropdown(isExpanded ? null : item.title)}
                      >
                        {content}
                      </button>
                      {isExpanded ? (
                        <div className="mt-2 ml-4 flex flex-col gap-2">
                          {item.children?.map((child, childIndex) => {
                            const hasNestedChildren = child.children && child.children.length > 0;
                            const isNestedExpanded =
                              openMobileDropdown === `${item.title}-${child.title}`;

                            if (hasNestedChildren) {
                              return (
                                <div key={`${child.title}-${childIndex}`} className="w-full">
                                  <button
                                    type="button"
                                    className="w-full text-left flex items-center justify-between"
                                    onClick={() =>
                                      setOpenMobileDropdown(
                                        isNestedExpanded ? null : `${item.title}-${child.title}`,
                                      )
                                    }
                                  >
                                    <span className="font-mukta text-[18px] leading-[28px] text-[#691709]">
                                      {child.title}
                                    </span>
                                    <ChevronDownIcon
                                      className={`text-[#691709] w-[16px] h-[16px] transition-transform duration-200 ${
                                        isNestedExpanded ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                  {isNestedExpanded ? (
                                    <div className="mt-2 ml-4 flex flex-col gap-2">
                                      {child.children?.map(grandchild => (
                                        <Link
                                          key={grandchild.title}
                                          href={grandchild.link}
                                          onClick={closeMobileMenu}
                                          className="font-mukta text-[16px] leading-[24px] text-[#691709]"
                                        >
                                          {grandchild.title}
                                        </Link>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={`${child.title}-${childIndex}`}
                                href={child.link ?? '#'}
                                onClick={closeMobileMenu}
                                className="font-mukta text-[18px] leading-[28px] text-[#691709]"
                              >
                                {child.title}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (item.link) {
                  return (
                    <Link key={`m-${index}`} href={item.link} onClick={closeMobileMenu}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={`m-${index}`} className="w-full">
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
}

function LandingHeaderFallback() {
  const d = horoscopeEn;
  return (
    <header className="container mx-auto px-6 lg:px-0 py-10">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="block md:hidden w-12" />
          <Link href="/">
            <AstroSewaLogo className="max-w-[84px] text-[#611508] md:max-w-[100px] lg:max-w-[188px] w-full" />
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="hidden max-h-fit items-center gap-1 rounded-3xl border border-solid border-primary px-[15px] py-2 text-primary lg:flex">
            <LanguageEarthIcon />
            <p className="font-mukta text-primary text-sm md:text-lg lg:text-xl leading-7">
              {d.header.langEn}
            </p>
            <ChevronDownIcon />
          </div>
          <button className="bg-primary rounded-3xl px-5 py-2 text-white flex gap-1.5 max-h-fit items-center cursor-pointer">
            <UserLineIcon className="w-3 h-3 lg:w-6 lg:h-6" />
            <p className="font-mukta text-sm md:text-lg lg:text-xl leading-7 max-h-fit">
              {d.header.signIn}
            </p>
          </button>
          <button className="bg-primary p-2.5 rounded-full text-white max-h-fit">
            <TransparentBellIcon />
          </button>
        </div>
      </div>
      <nav className="mt-10 items-center justify-center bg-primary py-3 gap-[22px] rounded-3xl hidden lg:flex">
        {LANDING_NAV.map(value => (
          <Link href={value.link ?? '#'} key={value.title}>
            <div className="text-white flex items-center justify-center py-[7px] px-[17px]">
              <p className="font-mukta font-light text-xl leading-7">{value.title}</p>
              {value.children && <ChevronDownIcon className="text-white" />}
            </div>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export const LandingHeader = () => (
  <Suspense fallback={<LandingHeaderFallback />}>
    <LandingHeaderClient />
  </Suspense>
);
