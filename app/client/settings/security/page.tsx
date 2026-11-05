import type { Metadata } from 'next';

import { SecurityInfo } from '@/components/account/settings/security-info';

export const metadata: Metadata = { title: 'Security' };

export default function ClientSecurityInfoPage() {
  return <SecurityInfo kind="client" />;
}
