import type { Metadata } from 'next';
import clsx from 'clsx';

import LandingPageCSS from '../landing-page.module.css';
import CalanderPageContent from '@/components/pages/calander/index';
import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Calander',
  description: 'Panchang information page',
};

export default function CalanderPage() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="space-y-10 md:space-y-[100px]">
        <CalanderPageContent />
        <Services />
        <DownloadApp />
      </div>
      <Footer />
    </main>
  );
}
