'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useBackendClient } from '@/hooks/use-backend-client';
import { BackendError } from '@/lib/backend/client';
import { chatImageProblem, ChatImageError, prepareChatImage } from '@/lib/chat/image';
import { emptyLive, liveReducer, type OutgoingImage, type Uploaded } from '@/lib/chat/live';
import {
  chatImageUrls,
  chatSocketUrl,
  messagesPath,
  toChatItem,
  type ChatItem,
  type ChatMessagesPage,
  type UploadedChatImage,
} from '@/lib/chat/messages';
// Types only: socket.io-client is browser-only, so the socket module loads in the effect and stays out of the
// server bundle (the Cloudflare Worker size limit).
import type { ChatConnection, ChatStatus } from '@/lib/chat/socket';

/** The site's backend host; null when the env is missing (the chat then shows offline). */
const SOCKET_URL = chatSocketUrl();

let localSeq = 0;
/** Not crypto.randomUUID: it's missing on plain-http LAN test builds. */
const nextLocalId = () => `local-${Date.now().toString(36)}-${++localSeq}`;

/** A failed upload, in words for the person. */
function uploadError(err: unknown): string {
  if (err instanceof ChatImageError) return err.message;
  if (err instanceof BackendError) {
    if (err.status === 429)
      return 'Not sent. Too many photos at once: wait a minute and try again.';
    if (err.status === 413) return 'Not sent. This photo is too large (20 MB at most).';
    if (err.status === 400) return 'Not sent. This photo could not be read: try another one.';
    if (err.status >= 500) return 'Not sent. The server could not take the photo: try again.';
    return `Not sent. ${err.message}`;
  }
  // fetch() itself failed: no connection.
  return 'Not sent. Check your internet connection and try again.';
}

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
  /** Uploads go one at a time: a burst of photos never loads the server (or a slow phone line) in parallel. */
  const uploads = useRef<Promise<unknown>>(Promise.resolve());
  /** Object URLs of pending photos, freed when their bubble goes and when the page leaves. */
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);
  const dropPreview = useCallback((url: string | null | undefined) => {
    if (url && previews.current.delete(url)) URL.revokeObjectURL(url);
  }, []);

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

  const upload = useCallback(
    (file: File): Promise<Uploaded> => {
      const run = async () => {
        const blob = await prepareChatImage(file);
        const form = new FormData();
        form.append('image', blob, blob === file ? file.name || 'chat-image' : 'chat-image.jpg');
        const saved = await backend.post<UploadedChatImage>('/chat-messages/upload-image', form);
        if (!saved?._id) throw new BackendError('Upload failed', 500);
        return { mediaId: saved._id, ...chatImageUrls(saved) };
      };
      const result = uploads.current.then(run, run);
      uploads.current = result.catch(() => undefined);
      return result;
    },
    [backend],
  );

  const deliverImage = useCallback(
    (localId: string, image: OutgoingImage) => {
      void (async () => {
        let uploaded = image.uploaded;
        if (!uploaded) {
          try {
            uploaded = await upload(image.file);
          } catch (err) {
            dispatch({ type: 'failed', localId, error: uploadError(err) });
            return;
          }
          dispatch({ type: 'uploaded', localId, uploaded });
        }
        const c = conn.current ?? (await connecting.current);
        if (!c) {
          dispatch({ type: 'failed', localId, error: 'Not sent. The chat is not connected.' });
          return;
        }
        try {
          const saved = await c.sendImage(uploaded.mediaId);
          // The answer has the media id only: the bubble shows the uploaded copy's URLs.
          const item = toChatItem(saved, myId);
          dispatch({
            type: 'sent',
            localId,
            item: { ...item, image: uploaded.image, fullImage: uploaded.fullImage },
          });
          dropPreview(image.preview);
        } catch (err) {
          dispatch({
            type: 'failed',
            localId,
            error: err instanceof Error ? err.message : 'Photo not sent.',
            uncertain: (err as { uncertain?: unknown } | null)?.uncertain === true,
          });
        }
      })();
    },
    [dropPreview, myId, upload],
  );

  /** Sends a picked photo; returns why it can't be sent (nothing is queued then), or null. */
  const sendImage = useCallback(
    (file: File): string | null => {
      const problem = chatImageProblem(file);
      if (problem) return problem;
      const localId = nextLocalId();
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      const image: OutgoingImage = { file, preview };
      dispatch({
        type: 'queued',
        message: { localId, text: '', image, at: new Date(), status: 'sending' },
      });
      deliverImage(localId, image);
      return null;
    },
    [deliverImage],
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

  // The outbox entry (with its photo) is looked up from the latest state, not from the rendered item.
  const outboxRef = useRef(live.outbox);
  useEffect(() => {
    outboxRef.current = live.outbox;
  }, [live.outbox]);

  const retry = useCallback(
    (item: ChatItem) => {
      const pending = outboxRef.current.find(o => o.localId === item.id);
      dispatch({ type: 'retry', localId: item.id, at: new Date() });
      if (pending?.image) deliverImage(item.id, pending.image);
      else deliver(item.id, item.text);
    },
    [deliver, deliverImage],
  );

  const discard = useCallback(
    (item: ChatItem) => {
      const pending = outboxRef.current.find(o => o.localId === item.id);
      dispatch({ type: 'discard', localId: item.id });
      dropPreview(pending?.image?.preview);
    },
    [dropPreview],
  );
  const typed = useCallback(() => conn.current?.typed(), []);
  const stopTyping = useCallback(() => conn.current?.stopTyping(), []);
  const reconnect = useCallback(() => conn.current?.wake(Infinity), []);

  return {
    live,
    status: SOCKET_URL ? status : ('failed' as const),
    partnerTyping,
    send,
    sendImage,
    retry,
    discard,
    typed,
    stopTyping,
    reconnect,
  };
}
