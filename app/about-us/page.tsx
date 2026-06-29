import type { Metadata } from 'next';

import AboutUsHero from '@/components/pages/about-us/hero';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import DownloadApp from '@/components/pages/landing/download-app';
import AboutUsVision from '@/components/pages/about-us/vision';
import AboutUsWhatWeDo from '@/components/pages/about-us/what-we-do';
import Services from '@/components/pages/landing/services';
import AboutUsWhyUs from '@/components/pages/about-us/why-us';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Learn about Astro Sewa — Nepal's trusted online astrology platform connecting seekers with 1000+ verified Vedic astrologers for personalized guidance.",
  keywords: [
    'about astro sewa',
    'Nepal astrology platform',
    'vedic astrologers Nepal',
    'online astrology Nepal',
    'astro sewa company',
  ],
  alternates: {
    canonical: '/about-us',
  },
  openGraph: {
    title: "About Astro Sewa — Nepal's Trusted Astrology Platform",
    description:
      'Learn about Astro Sewa and how we connect you with verified Vedic astrologers for personalized horoscope, kundali, and spiritual guidance.',
  },
};

const AboutUsPage = () => {
  return (
    <main className="container mx-auto min-h-screen overflow-hidden space-y-[100px] pb-16">
      <div>
        <AboutUsHero />
      </div>
      <AboutUsVision />
      <AboutUsWhatWeDo />
      <AboutUsWhyUs />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
};

export default AboutUsPage;
