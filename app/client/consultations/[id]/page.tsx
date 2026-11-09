import type { Metadata } from 'next';

import { ConsultationChat } from '@/components/chat/consultation-chat';

export const metadata: Metadata = { title: 'Chat' };

type Props = { params: Promise<{ id: string }> };

/** A booking's chat, opened from My Consultations (the app's /user-chat-details). */
export default async function ClientConsultationChatPage({ params }: Props) {
  const { id } = await params;
  return <ConsultationChat key={id} bookingId={id} />;
}
