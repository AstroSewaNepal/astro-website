import Image from 'next/image';
import Link from 'next/link';

/**
 * Free Services (Figma _loose/Free-Services, the app's FreeServicesScreen): links to the website's own free tools.
 * Astro Reports asks guests to log in first (/client pages do). Calendar is hidden in the app but the website has
 * had a full one for a long time, so it is listed here, as in the Figma. Ideas to Ask is out of scope (doc 00).
 */
const SERVICES = [
  {
    title: 'Kundali Chart',
    description: 'Enter your birth details to generate your Janam Kundali chart.',
    href: '/free-kundali',
    icon: '/images/client-home/kundali.png',
  },
  {
    title: 'Match Making',
    description: 'Find your ideal life partner by checking compatibility scores.',
    href: '/kundali-matching',
    icon: '/images/client-home/matchmaking.png',
  },
  {
    title: 'Horoscope',
    description: 'Read your daily horoscope and plan your day around important dates.',
    href: '/horoscope',
    icon: '/images/client-home/horoscope.png',
  },
  {
    title: 'Astro Reports',
    description: 'Open the kundalis and match makings you saved.',
    href: '/client/reports',
    icon: '/images/client-home/astro-reports.png',
  },
  {
    title: 'Calendar & Events',
    description: 'Tithis, festivals and auspicious timings from the Nepali calendar.',
    href: '/calendar',
    icon: '/images/free-services/calendar.svg',
  },
];

export function FreeServices() {
  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-left lg:text-[34px]">
        Free Services
      </h1>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {SERVICES.map(s => (
          <li key={s.href} className="flex">
            <Link href={s.href} className="group flex w-full flex-col">
              <span className="flex h-[110px] items-center justify-center rounded-[16px] border border-[#e3c9b5] bg-[#fbf6ee] transition-colors group-hover:bg-[#f6ecdc] sm:h-[136px]">
                <Image
                  src={s.icon}
                  alt=""
                  width={160}
                  height={160}
                  className="h-[64px] object-contain sm:h-[84px]"
                  style={{ width: 'auto' }}
                />
              </span>
              <span className="mt-2 px-1 font-app text-[16px] text-primary">{s.title}</span>
              <span className="line-clamp-2 flex-1 px-1 font-app text-[13px] leading-snug text-[#2f2f2f] sm:text-[14px]">
                {s.description}
              </span>
              <span className="mt-2 flex h-[38px] items-center justify-center rounded-full bg-primary font-app text-[15px] text-white">
                View
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
