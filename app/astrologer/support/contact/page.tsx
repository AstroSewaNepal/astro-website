import type { Metadata } from 'next';

import { SupportContact } from '@/components/support/support-pages';

export const metadata: Metadata = { title: 'Contact Details' };

export default function SupportContactPage() {
  return <SupportContact />;
}
