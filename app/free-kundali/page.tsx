import type { Metadata } from 'next';

import FreeKundali from '@/components/pages/free-kundali';
import KundaliFormSection from '@/components/pages/free-kundali/kundali-form-section';
import KundaliEducationalSection from '@/components/pages/free-kundali/kundali-educational-section';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Kundali',
  description:
    'Discover your detailed Janam Kundli instantly with Astro Sewa. Free online Kundli with insights on personality, career, relationships, and life path.',
  keywords: [
    'free kundali',
    'janam kundli',
    'birth chart',
    'kundali online',
    'free birth chart Nepal',
    'vedic kundli',
    'kundali reading',
    'astrology birth chart',
  ],
  alternates: {
    canonical: '/free-kundali',
  },
  openGraph: {
    title: 'Free Kundali — Janam Birth Chart Online | Astro Sewa',
    description:
      'Generate your free Janam Kundli online. Get detailed Vedic astrology birth chart insights for personality, career, love, and life path.',
  },
};

export default function FreeKundaliPage() {
  return (
    <main className="min-h-screen">
      <div className="space-y-10 md:space-y-[100px]">
        <FreeKundali />
        <KundaliFormSection />
        <KundaliEducationalSection />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
