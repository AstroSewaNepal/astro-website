import type { Metadata } from 'next';

import { HeroSectionImage } from '@/components/images';
import LandingFAQ from '@/components/pages/landing/faq';
import { FAQ_LIST } from '@/components/pages/landing/faq/faq.const';
import Clarity from '@/components/pages/landing/clarity';
import LandingHero from '@/components/pages/landing/hero';
// import EventsPage from '@/components/pages/landing/events';
import Services from '@/components/pages/landing/services';
import WhoWeAre from '@/components/pages/landing/who-we-are';
import HotTopics from '@/components/pages/landing/hot-topics';
import DownloadApp from '@/components/pages/landing/download-app';
// import TodayHoroscope from '@/components/pages/landing/today-horoscope';
// import CustomerFeedback from '@/components/pages/landing/customer-feedback';
import AstrologerBlogListing from '@/components/pages/landing/blog-listing';

export const metadata: Metadata = {
  description:
    'Astro Sewa combines ancient Vedic wisdom with modern insight to help you transform uncertainty into opportunity. Get daily horoscopes, connect with verified astrologers, and access personalized astrology guidance for love, career, health, and finances.',
  keywords: [
    'astrology Nepal',
    'online astrology consultation',
    'daily horoscope',
    'vedic astrology',
    'astrologer chat',
    'birth chart reading',
    'astrology app',
    'Nepal astrologer',
    'astrology services',
    'horoscope today',
  ],
  openGraph: {
    title: 'Astro Sewa - Astrology Made Personal',
    description:
      'Transform uncertainty into opportunity with personalized Vedic astrology guidance. Connect with 1000+ verified astrologers, get daily horoscopes, and expert consultations.',
    images: [
      {
        url: HeroSectionImage.src,
        width: 516,
        height: 516,
        alt: 'Astro Sewa - Astrology Made Personal',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astro Sewa - Astrology Made Personal',
    description:
      'Transform uncertainty into opportunity with personalized Vedic astrology guidance. Connect with 1000+ verified astrologers.',
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
    <main className="min-h-screen space-y-[100px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div>
        <LandingHero />
      </div>
      {/* <TodayHoroscope /> */}
      {/* <EventsPage /> */}
      <Services />
      <Clarity />
      {/* <TalkToOurAstrologer /> */}
      {/* <CustomerFeedback /> */}
      <AstrologerBlogListing />
      <WhoWeAre />
      <LandingFAQ />
      <HotTopics />
      <DownloadApp />
    </main>
  );
}
