import type { Metadata } from 'next';

import { auth } from '@/auth';
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

type FreeKundaliPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function FreeKundaliPage({ searchParams }: FreeKundaliPageProps) {
  const session = await auth();
  const params = await searchParams;
  const oauthError = params?.error === 'OAuthError';

  const defaultFullName = session?.user?.name?.trim();

  return (
    <main className="space-y-10 md:space-y-[100px]">
      <FreeKundali />
      <KundaliFormSection defaultFullName={defaultFullName} oauthError={oauthError} />
      <KundaliEducationalSection />
      <Services />
      <DownloadApp />
    </main>
  );
}
