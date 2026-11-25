import type { Metadata } from 'next';

import { SupportPolicies } from '@/components/support/support-pages';

export const metadata: Metadata = { title: 'Policies' };

export default function SupportPoliciesPage() {
  return <SupportPolicies />;
}
