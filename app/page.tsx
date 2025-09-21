import clsx from 'clsx';

import LandingHero from '@/components/pages/landing/hero';
import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import TodayHoroscope from '@/components/pages/landing/today-horoscope';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';

import LandingPageCSS from './landing-page.module.css';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';

export default function Home() {
  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        <LandingHero />
      </div>
      <TodayHoroscope />
      <EventsPage />
      <Services />
      <Clarity />
      <TalkToOurAstrologer />
    </main>
  );
}
