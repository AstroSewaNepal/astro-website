import type { Metadata, Viewport } from 'next';

import { ConsultationChat } from '@/components/chat/consultation-chat';

export const metadata: Metadata = { title: 'Chat' };

/**
 * The root viewport, plus resizes-content: Android browsers shrink the page together with the keyboard animation, so
 * the full-screen phone chat (hooks/use-phone-full-screen.ts) lifts its composer in step with the keyboard. Only
 * here: elsewhere the phone tabs should stay behind the keyboard. iPhones ignore it (the hook handles them).
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
  interactiveWidget: 'resizes-content',
};

type Props = { params: Promise<{ id: string }> };

/** A booking's chat, opened from My Consultations (the app's /user-chat-details). */
export default async function ClientConsultationChatPage({ params }: Props) {
  const { id } = await params;
  return <ConsultationChat key={id} bookingId={id} />;
}
