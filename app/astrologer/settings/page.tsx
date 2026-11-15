import type { Metadata } from 'next';

import { SettingsMenu } from '@/components/account/settings/settings-menu';

export const metadata: Metadata = { title: 'Settings' };

/** For now Add to Home Screen + Sign out; the rest of the astrologer's Settings comes with doc 17. */
export default function AstrologerSettingsMenuPage() {
  return <SettingsMenu kind="astrologer" />;
}
