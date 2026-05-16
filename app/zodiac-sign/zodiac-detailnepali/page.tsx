import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ELanguage } from '@/components/enums/language.enum';

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ZodiacDetailNepaliPage({ searchParams }: Props) {
  const sign = searchParams?.sign;
  const signValue = Array.isArray(sign) ? sign[0] : sign;
  const lang = searchParams?.lang;
  const langValue = Array.isArray(lang) ? lang[0] : lang;
  const params = new URLSearchParams();
  if (signValue) {
    params.set('sign', signValue);
  }
  if (langValue) {
    params.set('lang', langValue);
  }
  params.set('content_lang', ELanguage.NEPALI);
  redirect(`/zodiac-sign/details?${params.toString()}`);
}
