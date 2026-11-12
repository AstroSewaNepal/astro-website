// The live side of a consultation chat (the app's ChatSocketService + useChatDetails), on the backend's socket.io
// gateway (astro-sewa-backend src/chat/gateways/chat.gateway.ts).
//
// What the server does, and what this relies on:
// - The token rides in the handshake. An expired or refused one gets the socket kicked ("io server disconnect"),
//   which socket.io never retries by itself; a token that expires while connected makes every later event answer
//   with an `exception` "Unauthorized". Both renew the token and reconnect.
// - `message` is acknowledged with `{ success, data: savedMessage }` and broadcast to the room without the sender.
//   Refusals (outside the booking's time, not a participant) come back as an `exception` event with no ack, so
//   sends go one at a time and an exception belongs to the send in flight.
// - Messages are only broadcast live, never replayed: after any reconnect the caller refetches the latest page.

import { io, type ManagerOptions, type Socket, type SocketOptions } from 'socket.io-client';

import type { BackendChatMessage } from '@/lib/chat/messages';

export type ChatStatus = 'connecting' | 'online' | 'reconnecting' | 'failed';

export type ChatConnectionEvents = {
  status: (status: ChatStatus) => void;
  /** A message from the other person (or from this user on another device). */
  message: (message: BackendChatMessage) => void;
  partnerTyping: (typing: boolean) => void;
  /** Someone ended the booking (End Chat, or the app's timer): who did, when the server says. */
  ended: (endedByUserId: string | null) => void;
  /** Messages may have been missed (reconnected, or back from the background): fetch the latest page. */
  resync: () => void;
};

export type ChatConnectionOptions = {
  url: string;
  chatId: string;
  myId: string | undefined;
  /** Token for the next handshake; null when logged out. */
  token: () => Promise<string | null>;
  /** New token after the server refused `failedToken`; null when the session is over. */
  renew: (failedToken: string) => Promise<string | null>;
  events: ChatConnectionEvents;
  createSocket?: (url: string, options: Partial<ManagerOptions & SocketOptions>) => Socket;
  ackTimeoutMs?: number;
};

export class ChatSendError extends Error {
  /** True when the server may have saved the message anyway (no answer in time). */
  readonly uncertain: boolean;
  constructor(message: string, uncertain = false) {
    super(message);
    this.name = 'ChatSendError';
    this.uncertain = uncertain;
  }
}

export type ChatConnection = {
  /** Sends a text message; resolves with the saved message. */
  send: (text: string) => Promise<BackendChatMessage>;
  /** Sends a photo uploaded with POST /chat-messages/upload-image; resolves with the saved message (media = id). */
  sendImage: (mediaId: string) => Promise<BackendChatMessage>;
  /** Call on every keystroke in the composer. */
  typed: () => void;
  stopTyping: () => void;
  /** The page is visible again after `awayMs` (or the network came back: Infinity). */
  wake: (awayMs: number) => void;
  stop: () => void;
};

const ACK_TIMEOUT_MS = 15_000;
/** Like the app's typingDebounceTime: "typing" ends after this long without a keystroke. */
const TYPING_IDLE_MS = 2_000;
/** Hide the other person's "typing" if their stop never arrives. */
const PARTNER_TYPING_MAX_MS = 30_000;
/** A connection that lasts this long proves the token works. */
const STABLE_MS = 15_000;
/** Kicked for the token this many times in a row: stop and let the user retry. */
const MAX_AUTH_FAILURES = 3;
/** A background tab this long may hold a dead connection the browser hasn't noticed yet (iOS Safari). */
const STALE_AFTER_MS = 20_000;

const NO_CONNECTION = 'Not sent. Check your internet connection and try again.';
const NO_ANSWER = 'Not sent. The connection dropped before the message was confirmed.';

type SendPayload = { message: string } | { mediaId: string };

type SendOutcome = { saved: BackendChatMessage } | { error: ChatSendError } | { authExpired: true };

export function connectChat({
  url,
  chatId,
  myId,
  token,
  renew,
  events,
  createSocket = io,
  ackTimeoutMs = ACK_TIMEOUT_MS,
}: ChatConnectionOptions): ChatConnection {
  let stopped = false;
  let status: ChatStatus = 'connecting';
  let everConnected = false;
  /** Token the last handshake carried (the one to report as refused). */
  let handshakeToken: string | null = null;
  /** Fresh token from a renew, used by the next handshake before asking the session again. */
  let renewedToken: string | null = null;
  let authFailures = 0;
  let recovering = false;
  let typing = false;
  let inFlight: ((outcome: SendOutcome) => void) | null = null;
  let sendQueue: Promise<unknown> = Promise.resolve();
  const connectWaiters = new Set<() => void>();
  let stableTimer: ReturnType<typeof setTimeout> | undefined;
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  let partnerTimer: ReturnType<typeof setTimeout> | undefined;

  const setStatus = (next: ChatStatus) => {
    if (stopped || next === status) return;
    status = next;
    events.status(next);
  };

  const setPartnerTyping = (on: boolean) => {
    clearTimeout(partnerTimer);
    if (on) partnerTimer = setTimeout(() => events.partnerTyping(false), PARTNER_TYPING_MAX_MS);
    events.partnerTyping(on);
  };

  const fromPartner = (userId: unknown) => !myId || userId !== myId;
  const forThisChat = (id: unknown) => id === undefined || id === null || String(id) === chatId;

  const socket = createSocket(url, {
    // Asked on every (re)connect, so a reconnect after a long sleep carries a current token.
    auth: cb => {
      void (async () => {
        const next = renewedToken ?? (await token().catch(() => null));
        renewedToken = null;
        if (stopped) return;
        if (!next) {
          // Logged out: nothing to connect with (the backend client signs the user out).
          setStatus('failed');
          socket.disconnect();
          return;
        }
        handshakeToken = next;
        cb({ token: next });
      })();
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    timeout: 20_000,
    autoConnect: false,
    // Own manager per chat: a shared one hands back the same Socket with the old listeners still attached.
    forceNew: true,
  });

  async function recoverAuth() {
    if (recovering || stopped) return;
    recovering = true;
    try {
      if (authFailures >= MAX_AUTH_FAILURES) {
        setStatus('failed');
        return;
      }
      authFailures++;
      setStatus('reconnecting');
      const failed = handshakeToken;
      const next = failed ? await renew(failed) : await token();
      if (stopped) return;
      if (!next) {
        setStatus('failed');
        return;
      }
      renewedToken = next;
      // Still connected after an "Unauthorized" exception: the handshake must be redone to carry the new token.
      if (socket.connected) socket.disconnect();
      socket.connect();
    } catch {
      setStatus('failed');
    } finally {
      recovering = false;
    }
  }

  socket.on('connect', () => {
    if (stopped) return;
    socket.emit('join', { chatId });
    const again = everConnected;
    everConnected = true;
    setStatus('online');
    clearTimeout(stableTimer);
    stableTimer = setTimeout(() => {
      authFailures = 0;
    }, STABLE_MS);
    for (const wake of [...connectWaiters]) wake();
    if (again) events.resync();
  });

  socket.on('disconnect', reason => {
    clearTimeout(stableTimer);
    typing = false;
    setPartnerTyping(false);
    // Its answer died with the connection, so it may or may not have been saved.
    inFlight?.({ error: new ChatSendError(NO_ANSWER, true) });
    if (stopped) return;
    if (reason === 'io server disconnect') void recoverAuth();
    else if (reason !== 'io client disconnect') setStatus('reconnecting');
  });

  socket.on('connect_error', () => {
    if (!recovering) setStatus(everConnected ? 'reconnecting' : 'connecting');
  });

  socket.on('exception', (payload: { message?: unknown } | undefined) => {
    const message =
      typeof payload?.message === 'string' && payload.message
        ? payload.message
        : 'Something went wrong';
    if (message === 'Unauthorized') {
      inFlight?.({ authExpired: true });
      void recoverAuth();
      return;
    }
    inFlight?.({ error: new ChatSendError(message) });
  });

  socket.on('message', (message: BackendChatMessage & { chat?: unknown }) => {
    if (!message?._id || !forThisChat(message.chat)) return;
    const sender = typeof message.sender === 'object' ? message.sender?._id : message.sender;
    if (fromPartner(sender)) setPartnerTyping(false);
    events.message(message);
  });

  const onTypingEvent =
    (on: boolean) => (data: { userId?: unknown; chatId?: unknown } | undefined) => {
      if (!forThisChat(data?.chatId) || !fromPartner(data?.userId)) return;
      setPartnerTyping(on);
    };
  socket.on('typing', onTypingEvent(true));
  socket.on('stop_typing', onTypingEvent(false));
  socket.on('user_disconnected', onTypingEvent(false));

  socket.on('chat_ended', (data: { chatId?: unknown; endedByUser?: unknown } | undefined) => {
    if (!forThisChat(data?.chatId)) return;
    events.ended(typeof data?.endedByUser === 'string' ? data.endedByUser : null);
  });

  function waitConnected(timeoutMs: number): Promise<void> {
    if (socket.connected) return Promise.resolve();
    if (!socket.active && !recovering && status !== 'failed') socket.connect();
    return new Promise((resolve, reject) => {
      const done = () => {
        clearTimeout(timer);
        connectWaiters.delete(done);
        if (stopped) reject(new ChatSendError(NO_CONNECTION));
        else resolve();
      };
      const timer = setTimeout(() => {
        connectWaiters.delete(done);
        reject(new ChatSendError(NO_CONNECTION));
      }, timeoutMs);
      connectWaiters.add(done);
    });
  }

  async function attempt(
    payload: SendPayload,
    retryAfterAuth: boolean,
  ): Promise<BackendChatMessage> {
    if (stopped) throw new ChatSendError(NO_CONNECTION);
    const started = Date.now();
    await waitConnected(ackTimeoutMs);
    const remaining = Math.max(1_000, ackTimeoutMs - (Date.now() - started));
    stopTyping();

    const outcome = await new Promise<SendOutcome>(resolve => {
      let settled = false;
      const settle = (o: SendOutcome) => {
        if (settled) return;
        settled = true;
        if (inFlight === settle) inFlight = null;
        resolve(o);
      };
      inFlight = settle;
      socket
        .timeout(remaining)
        .emit(
          'message',
          { chatId, ...payload },
          (
            err: unknown,
            res: { success?: boolean; data?: BackendChatMessage; message?: string },
          ) => {
            if (err) settle({ error: new ChatSendError(NO_ANSWER, true) });
            else if (res?.success && res.data?._id) settle({ saved: res.data });
            else settle({ error: new ChatSendError(res?.message || 'Message not sent.') });
          },
        );
    });

    if ('saved' in outcome) {
      authFailures = 0;
      return outcome.saved;
    }
    // The guard refuses before saving, so sending again after the reconnect can't double it.
    if ('authExpired' in outcome) {
      if (retryAfterAuth) return attempt(payload, false);
      throw new ChatSendError(NO_CONNECTION);
    }
    throw outcome.error;
  }

  function enqueue(payload: SendPayload): Promise<BackendChatMessage> {
    const run = () => attempt(payload, true);
    const result = sendQueue.then(run, run);
    sendQueue = result.catch(() => undefined);
    return result;
  }
  const send = (text: string) => enqueue({ message: text });
  const sendImage = (mediaId: string) => enqueue({ mediaId });

  function stopTyping() {
    clearTimeout(typingTimer);
    if (!typing) return;
    typing = false;
    if (socket.connected) socket.emit('stop_typing', { chatId });
  }

  function typed() {
    if (stopped || !socket.connected) return;
    if (!typing) {
      typing = true;
      socket.emit('typing', { chatId });
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(stopTyping, TYPING_IDLE_MS);
  }

  function wake(awayMs: number) {
    if (stopped || recovering) return;
    if (status === 'failed') {
      // Coming back is a fresh try.
      authFailures = 0;
      setStatus('reconnecting');
    }
    if (socket.connected) {
      if (awayMs <= STALE_AFTER_MS) {
        events.resync();
        return;
      }
      // A long sleep can leave a socket that looks connected but is dead: reconnect.
      socket.disconnect();
    }
    // Reconnecting resyncs on 'connect'; one already retrying by itself is left alone.
    if (!socket.active) socket.connect();
  }

  function stop() {
    if (stopped) return;
    stopTyping();
    stopped = true;
    clearTimeout(stableTimer);
    clearTimeout(partnerTimer);
    inFlight?.({ error: new ChatSendError(NO_CONNECTION) });
    for (const done of [...connectWaiters]) done();
    socket.removeAllListeners();
    socket.disconnect();
  }

  events.status(status);
  socket.connect();

  return { send, sendImage, typed, stopTyping, wake, stop };
}
