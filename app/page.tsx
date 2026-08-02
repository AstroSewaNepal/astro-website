import type { Metadata } from 'next';

import { HeroSectionImage } from '@/components/images';
import LandingFAQ from '@/components/pages/landing/faq';
import { FAQ_LIST } from '@/components/pages/landing/faq/faq.const';
import Clarity from '@/components/pages/landing/clarity';
import LandingHero from '@/components/pages/landing/hero';
// import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import WhoWeAre from '@/components/pages/landing/who-we-are';
import HotTopics from '@/components/pages/landing/hot-topics';
import DownloadApp from '@/components/pages/landing/download-app';
// import TodayHoroscope from '@/components/pages/landing/today-horoscope';
// import CustomerFeedback from '@/components/pages/landing/customer-feedback';
import AstrologerBlogListing from '@/components/pages/landing/blog-listing';

export const metadata: Metadata = {
  title: 'Astrologer, Free Kundali and Horoscope | AstroSewa',
  description:
    "Talk to a verified Vedic astrologer, get your free Kundali, and read today's horoscope. Your complete astrology platform. Start exploring now.",
  keywords: [
    'talk to an astrologer online',
    'free Kundali',
    'daily horoscope',
    'online astrology consultation',
    'Kundali matching',
    'Vedic astrology',
  ],
  openGraph: {
    title: 'Astrologer, Free Kundali and Horoscope | AstroSewa',
    description:
      "Talk to a verified Vedic astrologer, get your free Kundali, and read today's horoscope. Your complete astrology platform. Start exploring now.",
    images: [
      {
        url: HeroSectionImage.src,
        width: 516,
        height: 516,
        alt: 'Astrologer, Free Kundali and Horoscope | AstroSewa',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrologer, Free Kundali and Horoscope | AstroSewa',
    description:
      "Talk to a verified Vedic astrologer, get your free Kundali, and read today's horoscope. Your complete astrology platform. Start exploring now.",
    images: [HeroSectionImage.src],
  },
  alternates: {
    canonical: '/',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_LIST.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <main className="container mx-auto min-h-screen overflow-hidden space-y-12 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="overflow-hidden">
        <LandingHero />
      </div>
      {/* <TodayHoroscope /> */}
      {/* <EventsPage /> */}
      <Services noPaddingBottom />
      <section className="container mx-auto px-6 lg:px-0" style={{ marginTop: 0, marginBottom: 0 }}>
        <div className="pt-5 pb-10 md:pt-[25px] md:pb-[75px]">
          <hr className="border-t border-[#79787A] opacity-70" />
        </div>
      </section>
      <Clarity style={{ marginTop: 0 }} />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <AstrologerBlogListing />
      <WhoWeAre />
      <LandingFAQ />
      <HotTopics />
      <DownloadApp className="border-none" paddingClassName="py-4 md:py-6" />
      {/* <CustomerFeedback /> */}
    </main>
  );
}
