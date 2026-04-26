import { LandingHeader } from '@/components/pages/landing/header/landing-header';

export const dynamic = 'force-dynamic';

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
    </>
  );
}
