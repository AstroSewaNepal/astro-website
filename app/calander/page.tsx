import type { Metadata } from 'next';

import CalanderPageContent from '@/components/pages/calander/index';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Calander',
  description: 'Panchang information page',
};

export default function CalanderPage() {
  return (
    <main className="min-h-screen">
      <div className="space-y-10 md:space-y-[100px]">
        <CalanderPageContent />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
