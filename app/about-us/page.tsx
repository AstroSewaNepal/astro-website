import type { Metadata } from 'next';

import AboutUsHero from '@/components/pages/about-us/hero';
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
    <main className="min-h-screen space-y-[100px]">
      <div>
        <AboutUsHero />
      </div>
      <AboutUsVision />
      <AboutUsWhatWeDo />
      <AboutUsWhyUs />
      {/* <TalkToOurAstrologer /> */}
      <Services />
    </main>
  );
};

export default AboutUsPage;
