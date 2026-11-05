import type { Metadata } from 'next';

import { SettingsMenu } from '@/components/account/settings/settings-menu';

export const metadata: Metadata = { title: 'Settings' };

export default function ClientSettingsMenuPage() {
  return <SettingsMenu kind="client" />;
}
