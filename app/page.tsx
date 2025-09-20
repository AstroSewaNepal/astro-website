import clsx from 'clsx';

import LandingHero from '@/components/pages/landing/hero';
import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import TodayHoroscope from '@/components/pages/landing/today-horoscope';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';

import LandingPageCSS from './landing-page.module.css';

export default function Home() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <LandingHero />
      <TodayHoroscope />
      <EventsPage />
      <Services />
    </main>
  );
}
