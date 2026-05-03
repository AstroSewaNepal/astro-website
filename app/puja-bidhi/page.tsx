import React from 'react';

// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';

import DownloadApp from '@/components/pages/landing/download-app';
import PujaBidhiHeader from '@/components/pages/puja-bidhi/header';

const PujaBidhiPage = () => {
  return (
    <main className="min-h-screen space-y-[100px]">
      <div>
        <PujaBidhiHeader />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
    </main>
  );
};

export default PujaBidhiPage;
