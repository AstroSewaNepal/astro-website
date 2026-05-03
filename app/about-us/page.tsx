import React from 'react';

import AboutUsHero from '@/components/pages/about-us/hero';
import AboutUsVision from '@/components/pages/about-us/vision';
import AboutUsWhatWeDo from '@/components/pages/about-us/what-we-do';
// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import AboutUsWhyUs from '@/components/pages/about-us/why-us';

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
