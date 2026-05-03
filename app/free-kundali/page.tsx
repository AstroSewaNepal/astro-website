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
  alternates: {
    canonical: '/free-kundali',
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
