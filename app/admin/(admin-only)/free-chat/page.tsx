'use client';

import Link from 'next/link';
import { FreeChatSettingsCard } from '@/components/admin/free-chat/free-chat-settings-card';

export default function FreeChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Free Chat</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          One free chat per client with the astrologers you pick. Pick them in{' '}
          <Link href="/admin/astrologers" className="text-[#611508] underline">
            Astrologers
          </Link>{' '}
          (Free Chat column).
        </p>
      </div>

      <FreeChatSettingsCard />
    </div>
  );
}
