import type { Metadata } from 'next';

import { auth } from '@/auth';
import FreeKundali from '@/components/pages/free-kundali';
import KundaliFormSection from '@/components/pages/free-kundali/kundali-form-section';
import KundaliEducationalSection from '@/components/pages/free-kundali/kundali-educational-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
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
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-10 md:space-y-[100px]">
      <div className="px-6 lg:px-0">
        <FreeKundali />
        <KundaliFormSection defaultFullName={defaultFullName} oauthError={oauthError} />
      </div>
      <KundaliEducationalSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
