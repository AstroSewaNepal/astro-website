import React from 'react';

import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import AboutUsHero from '@/components/pages/about-us/hero';
import AboutUsVision from '@/components/pages/about-us/vision';
import AboutUsWhatWeDo from '@/components/pages/about-us/what-we-do';
// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import AboutUsWhyUs from '@/components/pages/about-us/why-us';

import LandingPageCSS from '../landing-page.module.css';

const AboutUsPage = () => {
  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        <AboutUsHero />
      </div>
      <AboutUsVision />
      <AboutUsWhatWeDo />
      <AboutUsWhyUs />
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <Footer />
    </main>
  );
};

export default AboutUsPage;
