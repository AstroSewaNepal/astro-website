import type { Metadata } from 'next';

import { SupportHome } from '@/components/support/support-pages';

export const metadata: Metadata = { title: 'Customer Support' };

export default function SupportPage() {
  return <SupportHome kind="astrologer" />;
}
