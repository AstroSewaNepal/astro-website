import type { Metadata } from 'next';
import clsx from 'clsx';

import LandingPageCSS from '../landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import KundaliDetails from '@/components/pages/kundali-details';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Kundali Details',
  description:
    'Learn what a Kundali is, explore free Janam Kundali and Kundali matching, and connect with Astro Sewa astrologers for personalized guidance.',
  alternates: {
    canonical: '/kundali-details',
  },
};

export default function KundaliDetailsPage() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="space-y-10 md:space-y-[100px]">
        <KundaliDetails />
        <Services />
        <DownloadApp />
      </div>
      <Footer />
    </main>
  );
}
