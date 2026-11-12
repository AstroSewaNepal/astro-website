'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useBackendClient } from '@/hooks/use-backend-client';
import { emptyLive, liveReducer } from '@/lib/chat/live';
import {
  chatSocketUrl,
  messagesPath,
  toChatItem,
  type ChatItem,
  type ChatMessagesPage,
} from '@/lib/chat/messages';
// Types only: socket.io-client is browser-only, so the socket module loads in the effect and stays out of the
// server bundle (the Cloudflare Worker size limit).
import type { ChatConnection, ChatStatus } from '@/lib/chat/socket';

/** The site's backend host; null when the env is missing (the chat then shows offline). */
const SOCKET_URL = chatSocketUrl();

let localSeq = 0;
/** Not crypto.randomUUID: it's missing on plain-http LAN test builds. */
const nextLocalId = () => `local-${Date.now().toString(36)}-${++localSeq}`;

/**
 * The live part of a consultation chat: socket connection, messages that arrive or are sent after the history
 * loaded, and the other person typing. Waking up (tab visible again, network back, page restored from the
 * back/forward cache) checks the connection and pulls the latest page, since the server never replays messages.
 */
export function useChatLive({
  chatId,
  myId,
  bookingId,
  enabled = true,
  onEnded,
}: {
  chatId: string | null;
  myId: string | undefined;
  bookingId: string;
  /** Connect only while the session runs (the server refuses messages outside it anyway). */
  enabled?: boolean;
  /** The booking was ended over the socket; `endedByUserId` says by whom (null when the server doesn't say). */
  onEnded?: (endedByUserId: string | null) => void;
}) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const [live, dispatch] = useReducer(liveReducer, emptyLive);
  const [status, setStatus] = useState<ChatStatus>('connecting');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const conn = useRef<ChatConnection | null>(null);
  // Latest callback without reconnecting the socket when it changes.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  /** The connection once its module has loaded (null if the page left first): sends wait for it. */
  const connecting = useRef<Promise<ChatConnection | null>>(Promise.resolve(null));

  useEffect(() => {
    const url = SOCKET_URL;
    if (!enabled || !chatId || !myId || !url) return;
    let cancelled = false;
    let c: ChatConnection | null = null;

    const resync = async () => {
      try {
        const page = await backend.bare.get<ChatMessagesPage>(messagesPath(chatId, 1));
        if (cancelled) return;
        dispatch({ type: 'arrived', items: (page.messages ?? []).map(m => toChatItem(m, myId)) });
      } catch {
        // The next wake or reconnect tries again.
      }
    };

    connecting.current = import('@/lib/chat/socket').then(
      ({ connectChat }) => {
        if (cancelled) return null;
        c = connectChat({
          url,
          chatId,
          myId,
          token: backend.auth.token,
          renew: backend.auth.renew,
          events: {
            status: setStatus,
            message: m => dispatch({ type: 'arrived', items: [toChatItem(m, myId)] }),
            partnerTyping: setPartnerTyping,
            // Step 3 shows the ended state from the refetched booking.
            // The refetched booking (now COMPLETED) moves the page to its ended state.
            ended: endedBy => {
              onEndedRef.current?.(endedBy);
              void queryClient.invalidateQueries({ queryKey: ['chat', 'booking', bookingId] });
            },
            resync: () => void resync(),
          },
        });
        conn.current = c;
        return c;
      },
      () => {
        // The chunk didn't load (offline at open, or a deploy replaced it): show offline.
        if (!cancelled) setStatus('failed');
        return null;
      },
    );

    let hiddenAt: number | null = document.hidden ? Date.now() : null;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        c?.stopTyping();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      c?.wake(away);
    };
    const onOnline = () => c?.wake(Infinity);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) c?.wake(Infinity);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      c?.stop();
      conn.current = null;
      connecting.current = Promise.resolve(null);
      setPartnerTyping(false);
    };
  }, [backend, bookingId, chatId, enabled, myId, queryClient]);

  const deliver = useCallback(
    (localId: string, text: string) => {
      void (async () => {
        const c = conn.current ?? (await connecting.current);
        if (!c) {
          dispatch({ type: 'failed', localId, error: 'Not sent. The chat is not connected.' });
          return;
        }
        try {
          const saved = await c.send(text);
          dispatch({ type: 'sent', localId, item: toChatItem(saved, myId) });
        } catch (err) {
          dispatch({
            type: 'failed',
            localId,
            error: err instanceof Error ? err.message : 'Message not sent.',
            // ChatSendError.uncertain, read without importing the socket module.
            uncertain: (err as { uncertain?: unknown } | null)?.uncertain === true,
          });
        }
      })();
    },
    [myId],
  );

  /** Sends `text` (trimmed, like the app); false when there's nothing to send. */
  const send = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!message) return false;
      const localId = nextLocalId();
      dispatch({
        type: 'queued',
        message: { localId, text: message, at: new Date(), status: 'sending' },
      });
      deliver(localId, message);
      return true;
    },
    [deliver],
  );

  const retry = useCallback(
    (item: ChatItem) => {
      dispatch({ type: 'retry', localId: item.id, at: new Date() });
      deliver(item.id, item.text);
    },
    [deliver],
  );

  const discard = useCallback(
    (item: ChatItem) => dispatch({ type: 'discard', localId: item.id }),
    [],
  );
  const typed = useCallback(() => conn.current?.typed(), []);
  const stopTyping = useCallback(() => conn.current?.stopTyping(), []);
  const reconnect = useCallback(() => conn.current?.wake(Infinity), []);

  return {
    live,
    status: SOCKET_URL ? status : ('failed' as const),
    partnerTyping,
    send,
    retry,
    discard,
    typed,
    stopTyping,
    reconnect,
  };
}
