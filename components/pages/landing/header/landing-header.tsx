import AstroSewaLogo from '@/components/logo';
import TransparentBellIcon from '@/components/icons/bell';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import LanguageEarthIcon from '@/components/icons/language/earth';
import Link from 'next/link';

const LANDING_NAV = [
  { title: 'Zodiac Signs', children: [] },
  { title: 'Kundali', children: [] },
  { title: 'Compatibility' },
  { title: 'Puja Bidhi', children: [] },
  { title: 'Calculator', children: [] },
  { title: 'About Us', link: '/about-us' },
  { title: 'Blog' },
  { title: 'Calendar' },
];

export const LandingHeader = () => {
  return (
    <header className="container mx-auto px-6 lg:px-0 py-10">
      <div className="flex justify-between">
        <AstroSewaLogo />
        <div className="flex gap-4">
          <div className="px-[15px] py-2 rounded-3xl border border-solid border-primary max-h-fit flex items-center gap-1 text-primary">
            <LanguageEarthIcon />
            <p className="font-mukta text-primary text-xl leading-7">EN</p>
            <ChevronDownIcon />
          </div>
          <button className="bg-primary rounded-3xl px-5 py-2 text-white flex gap-1.5 max-h-fit items-center cursor-pointer">
            <UserLineIcon />
            <p className="font-mukta text-xl leading-7 max-h-fit">Sign in</p>
          </button>
          <button className="bg-primary p-2.5 rounded-full text-white max-h-fit">
            <TransparentBellIcon />
          </button>
        </div>
      </div>
      <nav className="mt-10 flex items-center justify-center bg-primary py-3 gap-[22px] rounded-3xl">
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
  );
};
