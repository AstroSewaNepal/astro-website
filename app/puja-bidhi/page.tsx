import React from 'react';

import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';

import LandingPageCSS from '../landing-page.module.css';
import DownloadApp from '@/components/pages/landing/download-app';
import PujaBidhiHeader from '@/components/pages/puja-bidhi/header';

const PujaBidhiPage = () => {
  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        <PujaBidhiHeader />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
      <Footer />
    </main>
  );
};

export default PujaBidhiPage;
