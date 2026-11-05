import type { Metadata } from 'next';

import { EditProfileForm } from '@/components/account/profile/edit-profile-form';

export const metadata: Metadata = { title: 'Edit Profile' };

export default function ClientProfilePage() {
  return <EditProfileForm />;
}
