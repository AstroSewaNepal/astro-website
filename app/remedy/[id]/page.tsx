import type { Metadata } from 'next';

import DownloadApp from '@/components/pages/landing/download-app';

import OpenInApp from './open-in-app';

export const metadata: Metadata = {
  title: 'Remedy | Astro Sewa',
  robots: { index: false },
};

export default async function RemedyLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="pt-2 md:pt-4">
      <div className="container mx-auto px-6 lg:px-0">
        <OpenInApp path={`remedy/${encodeURIComponent(id)}`} />
        <DownloadApp className="border-none !pb-0" paddingClassName="py-4 md:py-6 lg:py-8" />
      </div>
    </main>
  );
}
