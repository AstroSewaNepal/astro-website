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
  title: 'Vedic Astrology Built for Real Life | AstroSewa',
  description:
    'Verified astrologers, honest readings, and Vedic tools built for real life. Learn who we are, what we believe, and why thousands use AstroSewa.',
  keywords: [
    'about AstroSewa',
    'Vedic astrology platform',
    'verified astrologers',
    'online astrology service',
    'Jyotish platform',
    'astrology consultation service',
  ],
  alternates: {
    canonical: '/about-us',
  },
  openGraph: {
    title: 'Vedic Astrology Built for Real Life | AstroSewa',
    description:
      'Verified astrologers, honest readings, and Vedic tools built for real life. Learn who we are, what we believe, and why thousands use AstroSewa.',
  },
};

const SectionDivider = () => (
  <div className="mt-[20px] mb-[50px] flex items-center justify-center">
    <div className="w-full border-t border-[#79787A]" />
  </div>
);

const AboutUsPage = () => {
  return (
    <main className="container mx-auto min-h-screen overflow-hidden pb-16">
      <div>
        <AboutUsHero />
      </div>
      <SectionDivider />
      <AboutUsVision />
      <SectionDivider />
      <AboutUsWhatWeDo compact />
      <SectionDivider />
      <AboutUsWhyUs compact />
      <SectionDivider />
      <Clarity />
      <SectionDivider />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider />
      <Services />
      <SectionDivider />
      <DownloadApp noBorder />
    </main>
  );
};

export default AboutUsPage;
