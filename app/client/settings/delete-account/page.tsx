import type { Metadata } from 'next';

import { DeleteAccountForm } from '@/components/account/settings/delete-account-form';

export const metadata: Metadata = { title: 'Delete Account' };

export default function ClientDeleteAccountFormPage() {
  return <DeleteAccountForm kind="client" />;
}
