import clsx from 'clsx';

import LandingPageCSS from './landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import LandingFAQ from '@/components/pages/landing/faq';
import Clarity from '@/components/pages/landing/clarity';
import LandingHero from '@/components/pages/landing/hero';
import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import WhoWeAre from '@/components/pages/landing/who-we-are';
import HotTopics from '@/components/pages/landing/hot-topics';
import DownloadApp from '@/components/pages/landing/download-app';
import TodayHoroscope from '@/components/pages/landing/today-horoscope';
import CustomerFeedback from '@/components/pages/landing/customer-feedback';
import AstrologerBlogListing from '@/components/pages/landing/blog-listing';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';

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
      {/* <TalkToOurAstrologer /> */}
      <CustomerFeedback />
      <AstrologerBlogListing />
      <WhoWeAre />
      <LandingFAQ />
      <HotTopics />
      <DownloadApp />
      <Footer />
    </main>
  );
}
