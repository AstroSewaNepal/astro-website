import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ELanguage } from '@/components/enums/language.enum';
import { zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';

import { ZodiacSignDetailsClient } from './zodiac-sign-details-client';

export const metadata: Metadata = {
  title: 'Zodiac Sign Details',
  description:
    'Get in-depth details about your zodiac sign — personality traits, love compatibility, career insights, strengths, and weaknesses based on Vedic astrology.',
  keywords: [
    'zodiac sign details',
    'zodiac traits',
    'zodiac compatibility',
    'vedic astrology sign',
    'rashi details',
  ],
  alternates: {
    canonical: '/zodiac-sign/details',
  },
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ZodiacDetailsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sign = sp?.sign;
  const signValue = Array.isArray(sign) ? sign[0] : sign;
  const rawLang = sp?.content_lang ?? sp?.lang;
  const langValue = Array.isArray(rawLang) ? rawLang[0] : rawLang;

  if (langValue === ELanguage.NEPALI && signValue) {
    redirect(zodiacNepaliDetailHref(signValue));
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mukta text-[#6f2618]">
          Loading…
        </div>
      }
    >
      <ZodiacSignDetailsClient />
    </Suspense>
  );
}
