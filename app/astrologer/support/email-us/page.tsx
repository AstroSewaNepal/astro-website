import type { Metadata } from 'next';

import { SupportEmailUs } from '@/components/support/support-pages';

export const metadata: Metadata = { title: 'Email Us' };

export default function SupportEmailUsPage() {
  return <SupportEmailUs kind="astrologer" />;
}
