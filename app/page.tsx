import clsx from 'clsx';

import LandingHero from '@/components/pages/landing/hero';
import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import TodayHoroscope from '@/components/pages/landing/today-horoscope';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import CustomerFeedback from '@/components/pages/landing/customer-feedback';

import LandingPageCSS from './landing-page.module.css';
import AstrologerBlogListing from '@/components/pages/landing/blog-listing';
import WhoWeAre from '@/components/pages/landing/who-we-are';
import HotTopics from '@/components/pages/landing/hot-topics';
import LandingFAQ from '@/components/pages/landing/faq';
import DownloadApp from '@/components/pages/landing/download-app';
import Footer from '@/components/pages/landing/footer';

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
