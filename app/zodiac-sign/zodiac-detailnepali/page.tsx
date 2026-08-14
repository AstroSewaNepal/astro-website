import { redirect } from 'next/navigation';

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
  if (langValue) {
    params.set('lang', langValue);
  }
  params.set('content_lang', ELanguage.NEPALI);
  const path = signValue ? `/zodiac-sign/${signValue}` : '/zodiac-sign';
  const query = params.toString();
  redirect(query ? `${path}?${query}` : path);
}
