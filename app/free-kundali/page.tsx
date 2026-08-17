import type { Metadata } from 'next';

import { auth } from '@/auth';
import FreeKundali from '@/components/pages/free-kundali';
import KundaliFormSection from '@/components/pages/free-kundali/kundali-form-section';
import QNASComponent from '@/components/common/qnas-component';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Generate Your Birth Chart Online Free | AstroSewa',
  description:
    'Generate your free Janam Kundali in seconds. Planetary positions, Lagna, Nakshatras, Doshas and life predictions. Enter your birth details now.',
  keywords: [
    'free Kundali',
    'Janam Kundali online',
    'free birth chart generator',
    'Kundali online free',
    'free Kundali chart',
    'online Kundali',
  ],
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
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="px-6 lg:px-0">
        <FreeKundali />
        <SectionDivider className="mt-[20px] mb-[50px]" />
        <KundaliFormSection defaultFullName={defaultFullName} oauthError={oauthError} />
        <section className="container mx-auto px-6 lg:px-0 pt-14 mt-14 lg:pt-16 lg:mt-16">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
            <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
              Frequently Asked Questions
            </h2>
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
              Answers to the most common questions about your Free Kundali.
            </p>
          </div>
          <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
            <QNASComponent
              question="What Is a Janam Kundali?"
              answer={`A Janam Kundali is a Vedic birth chart drawn for the exact moment you were born. It maps the nine planets (Navagrahas) across twelve houses and twelve zodiac signs based on your birth date, time, and location. It also shows your Lagna, which is the rising sign, the zodiac sign that was on the eastern horizon at the moment of your birth. The Lagna is one of the most important placements in Vedic astrology.`}
              isDefaultOpen={true}
            />
            <QNASComponent
              question="What Will My Kundali Show Me?"
              answer={`Your Kundali covers every major area of life. The Lagna and Moon sign reveal personality and emotional nature. The 7th house shows relationship patterns and marriage timing. The 10th house covers career and professional strengths. The Dasha timeline shows which planetary periods are active across your lifetime and when major changes are likely. Beyond predictions, your Kundali highlights where focused effort will bring the most growth.`}
            />
            <QNASComponent
              question="How Accurate Is This Kundali?"
              answer={`AstroSewa generates your Kundali using the Lahiri ayanamsa and real ephemeris data. This produces a genuine sidereal Vedic chart, not a simplified approximation. The more accurate your birth time, the more precise your chart. If you are unsure of your birth time, check family records or your birth certificate. For charts where timing is critical, such as Dasha periods or Dosha analysis, our astrologers can help narrow it down through chart rectification.`}
            />
            <QNASComponent
              question="What Is the Difference Between a Free Kundali and a Paid Astrology Report?"
              answer={`The free Kundali shows you your complete birth chart with planetary positions, Lagna, Nakshatras, Doshas, and Dasha timeline. A paid astrology report adds a detailed written interpretation by a verified astrologer. The astrologer explains what your specific chart placements mean for your life, answers questions tailored to your situation, and provides guidance on how to work with the energies in your chart. The free chart gives you the data and the paid report gives you the meaning.`}
            />
            <QNASComponent
              question="What Are Navagrahas?"
              answer={`Navagraha means nine planets in Sanskrit. In Vedic astrology, these nine celestial bodies are the Sun (Surya), Moon (Chandra), Mars (Mangal), Mercury (Budha), Jupiter (Guru), Venus (Shukra), Saturn (Shani), Rahu (north lunar node), and Ketu (south lunar node). Rahu and Ketu are not physical planets but mathematical points where the Moon's orbit crosses the Sun's apparent path. All nine are tracked in your Kundali because each governs specific areas of life and influences different aspects of your personality and destiny.`}
            />
          </div>
        </section>
      </div>
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[40px] mb-[10px]" />
      <DownloadApp noBorder />
    </main>
  );
}
