import type { Metadata } from 'next';

import { ChangeEmailForm } from '@/components/account/settings/change-email-form';

export const metadata: Metadata = { title: 'Change Email' };

export default function ClientChangeEmailFormPage() {
  return <ChangeEmailForm kind="client" />;
}
