import type { Metadata } from 'next';
import clsx from 'clsx';

import LandingPageCSS from '../landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import FreeKundali from '@/components/pages/free-kundali';
import KundaliFormSection from '@/components/pages/free-kundali/kundali-form-section';
import KundaliEducationalSection from '@/components/pages/free-kundali/kundali-educational-section';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Kundali',
  description:
    'Discover your detailed Janam Kundli instantly with Astro Sewa. Free online Kundli with insights on personality, career, relationships, and life path.',
  alternates: {
    canonical: '/free-kundali',
  },
};

export default function FreeKundaliPage() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="space-y-10 md:space-y-[100px]">
        <FreeKundali />
        <KundaliFormSection />
        <KundaliEducationalSection />
        <Services />
        <DownloadApp />
      </div>
      <Footer />
    </main>
  );
}
