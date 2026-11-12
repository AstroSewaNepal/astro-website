import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';

import { ChatSendError, connectChat, type ChatConnectionEvents } from '@/lib/chat/socket';

type Handler = (...args: unknown[]) => void;
type Ack = (err: unknown, res?: unknown) => void;

/** Just enough of a socket.io client socket, with the server's side driven by the test. */
class FakeSocket {
  connected = false;
  active = false;
  handlers = new Map<string, Handler[]>();
  sent: { event: string; data: unknown; ack?: Ack }[] = [];
  handshakes: unknown[] = [];
  /** When false, the handshake waits until the test calls accept(). */
  autoAccept = true;
  private pendingAuth: ((data: unknown) => void) | null = null;

  constructor(readonly options: { auth: (cb: (data: unknown) => void) => void }) {}

  on(event: string, fn: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), fn]);
    return this;
  }
  fire(event: string, ...args: unknown[]) {
    for (const fn of this.handlers.get(event) ?? []) fn(...args);
  }
  removeAllListeners() {
    this.handlers.clear();
    return this;
  }
  connect() {
    if (this.connected) return this;
    this.active = true;
    this.options.auth(data => {
      this.handshakes.push(data);
      this.pendingAuth = () => {
        this.connected = true;
        this.fire('connect');
      };
      if (this.autoAccept) this.accept();
    });
    return this;
  }
  accept() {
    const go = this.pendingAuth;
    this.pendingAuth = null;
    go?.(null);
  }
  disconnect() {
    this.active = false;
    if (this.connected) {
      this.connected = false;
      this.fire('disconnect', 'io client disconnect');
    }
    return this;
  }
  /** Server or network drops the connection. */
  drop(reason: string) {
    this.connected = false;
    if (reason === 'io server disconnect') this.active = false;
    this.fire('disconnect', reason);
  }
  emit(event: string, data: unknown, ack?: Ack) {
    this.sent.push({ event, data, ack });
    return this;
  }
  timeout(ms: number) {
    return {
      emit: (event: string, data: unknown, ack: Ack) => {
        let answered = false;
        const timer = setTimeout(() => {
          if (!answered) ack(new Error('operation has timed out'));
        }, ms);
        this.emit(event, data, (err, res) => {
          answered = true;
          clearTimeout(timer);
          ack(err, res);
        });
      },
    };
  }
  lastMessage() {
    return [...this.sent].reverse().find(s => s.event === 'message');
  }
  count(event: string) {
    return this.sent.filter(s => s.event === event).length;
  }
}

const CHAT = 'chat-1';
const ME = 'me';

function setup(
  opts: {
    token?: () => Promise<string | null>;
    renew?: (t: string) => Promise<string | null>;
  } = {},
) {
  let socket!: FakeSocket;
  const events = {
    status: vi.fn(),
    message: vi.fn(),
    partnerTyping: vi.fn(),
    ended: vi.fn(),
    resync: vi.fn(),
  } satisfies ChatConnectionEvents;
  const token = vi.fn(opts.token ?? (async () => 'tok-1'));
  const renew = vi.fn(opts.renew ?? (async () => 'tok-2'));
  const conn = connectChat({
    url: 'https://api.example',
    chatId: CHAT,
    myId: ME,
    token,
    renew,
    events,
    ackTimeoutMs: 5_000,
    createSocket: (_url, options) => {
      socket = new FakeSocket(options as never);
      return socket as unknown as Socket;
    },
  });
  return { conn, socket: () => socket, events, token, renew };
}

const flush = () => vi.advanceTimersByTimeAsync(0);
const saved = (id: string, text: string) => ({
  success: true,
  data: { _id: id, message: text, createdAt: 'x', sender: ME },
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('connectChat', () => {
  it('connects with the session token and joins the chat', async () => {
    const { socket, events } = setup();
    await flush();
    expect(socket().handshakes).toEqual([{ token: 'tok-1' }]);
    expect(socket().sent[0]).toMatchObject({ event: 'join', data: { chatId: CHAT } });
    expect(events.status).toHaveBeenLastCalledWith('online');
    expect(events.resync).not.toHaveBeenCalled();
  });

  it('does not connect when logged out', async () => {
    const { socket, events } = setup({ token: async () => null });
    await flush();
    expect(socket().handshakes).toEqual([]);
    expect(events.status).toHaveBeenLastCalledWith('failed');
  });

  it('rejoins and resyncs after a dropped connection', async () => {
    const { socket, events } = setup();
    await flush();
    socket().drop('transport close');
    expect(events.status).toHaveBeenLastCalledWith('reconnecting');
    socket().connect(); // socket.io's own retry
    await flush();
    expect(socket().count('join')).toBe(2);
    expect(events.resync).toHaveBeenCalledTimes(1);
  });

  it('renews the token and reconnects when the server kicks the socket', async () => {
    const { socket, renew } = setup();
    await flush();
    socket().drop('io server disconnect');
    await flush();
    expect(renew).toHaveBeenCalledWith('tok-1');
    expect(socket().handshakes.at(-1)).toEqual({ token: 'tok-2' });
    expect(socket().connected).toBe(true);
  });

  it('gives up after repeated kicks and lets a wake try again', async () => {
    const { conn, socket, events, renew } = setup();
    await flush();
    for (let i = 0; i < 4; i++) {
      socket().drop('io server disconnect');
      await flush();
    }
    expect(renew).toHaveBeenCalledTimes(3);
    expect(events.status).toHaveBeenLastCalledWith('failed');
    expect(socket().connected).toBe(false);

    conn.wake(1_000);
    await flush();
    expect(socket().connected).toBe(true);
    expect(events.status).toHaveBeenLastCalledWith('online');
  });

  it('stops when the session cannot be renewed', async () => {
    const { socket, events } = setup({ renew: async () => null });
    await flush();
    socket().drop('io server disconnect');
    await flush();
    expect(events.status).toHaveBeenLastCalledWith('failed');
    expect(socket().connected).toBe(false);
  });

  it('sends a message and resolves with the saved one', async () => {
    const { conn, socket } = setup();
    await flush();
    const p = conn.send('hello');
    await flush();
    const sent = socket().lastMessage()!;
    expect(sent.data).toEqual({ chatId: CHAT, message: 'hello' });
    sent.ack!(null, saved('m1', 'hello'));
    await expect(p).resolves.toMatchObject({ _id: 'm1' });
  });

  it('sends one message at a time, in order', async () => {
    const { conn, socket } = setup();
    await flush();
    const a = conn.send('one');
    const b = conn.send('two');
    await flush();
    expect(socket().count('message')).toBe(1);
    socket().lastMessage()!.ack!(null, saved('m1', 'one'));
    await a;
    await flush();
    expect(socket().count('message')).toBe(2);
    expect(socket().lastMessage()!.data).toMatchObject({ message: 'two' });
    socket().lastMessage()!.ack!(null, saved('m2', 'two'));
    await expect(b).resolves.toMatchObject({ _id: 'm2' });
  });

  it('fails the send in flight with the server refusal', async () => {
    const { conn, socket } = setup();
    await flush();
    const p = conn.send('hi');
    await flush();
    socket().fire('exception', {
      status: 'error',
      message: 'The scheduled time for this connection has ended.',
    });
    await expect(p).rejects.toMatchObject({
      message: 'The scheduled time for this connection has ended.',
      uncertain: false,
    });
  });

  it('resends once after an expired token, with the renewed one', async () => {
    const { conn, socket, renew } = setup();
    await flush();
    const p = conn.send('hi');
    await flush();
    socket().fire('exception', { status: 'error', message: 'Unauthorized' });
    await flush();
    expect(renew).toHaveBeenCalledWith('tok-1');
    expect(socket().handshakes.at(-1)).toEqual({ token: 'tok-2' });
    expect(socket().count('message')).toBe(2);
    socket().lastMessage()!.ack!(null, saved('m1', 'hi'));
    await expect(p).resolves.toMatchObject({ _id: 'm1' });
  });

  it('marks a send uncertain when no answer comes in time', async () => {
    const { conn } = setup();
    await flush();
    const p = conn.send('hi');
    const check = expect(p).rejects.toMatchObject({ uncertain: true });
    await vi.advanceTimersByTimeAsync(5_000);
    await check;
  });

  it('marks a send uncertain when the connection drops before the answer', async () => {
    const { conn, socket } = setup();
    await flush();
    const p = conn.send('hi');
    await flush();
    socket().drop('transport close');
    await expect(p).rejects.toMatchObject({ uncertain: true });
  });

  it('waits for the connection to send, and fails when it never comes', async () => {
    const { conn, socket } = setup();
    await flush();
    socket().drop('transport close');
    socket().autoAccept = false;
    const p = conn.send('hi');
    const check = expect(p).rejects.toBeInstanceOf(ChatSendError);
    await vi.advanceTimersByTimeAsync(5_000);
    await check;
    expect(socket().count('message')).toBe(0);
  });

  it('sends once the connection is back', async () => {
    const { conn, socket } = setup();
    await flush();
    socket().drop('transport close');
    socket().autoAccept = false;
    const p = conn.send('hi');
    socket().connect();
    await flush();
    socket().accept();
    await flush();
    socket().lastMessage()!.ack!(null, saved('m1', 'hi'));
    await expect(p).resolves.toMatchObject({ _id: 'm1' });
  });

  it('emits typing once per burst and stops after a pause or on send', async () => {
    const { conn, socket } = setup();
    await flush();
    conn.typed();
    conn.typed();
    expect(socket().count('typing')).toBe(1);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(socket().count('stop_typing')).toBe(1);
    conn.typed();
    void conn.send('x').catch(() => undefined);
    await flush();
    expect(socket().count('typing')).toBe(2);
    expect(socket().count('stop_typing')).toBe(2);
  });

  it("shows the partner's typing, not this user's own from another device", async () => {
    const { socket, events } = setup();
    await flush();
    socket().fire('typing', { userId: ME, chatId: CHAT });
    expect(events.partnerTyping).not.toHaveBeenCalledWith(true);
    socket().fire('typing', { userId: 'astro', chatId: CHAT });
    expect(events.partnerTyping).toHaveBeenLastCalledWith(true);
    socket().fire('stop_typing', { userId: 'astro', chatId: CHAT });
    expect(events.partnerTyping).toHaveBeenLastCalledWith(false);
    socket().fire('typing', { userId: 'astro', chatId: CHAT });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(events.partnerTyping).toHaveBeenLastCalledWith(false);
  });

  it('passes on messages for this chat and clears typing when the partner sends', async () => {
    const { socket, events } = setup();
    await flush();
    socket().fire('typing', { userId: 'astro', chatId: CHAT });
    const m = { _id: 'm9', chat: CHAT, message: 'hey', createdAt: 'x', sender: { _id: 'astro' } };
    socket().fire('message', m);
    socket().fire('message', { ...m, _id: 'other', chat: 'chat-2' });
    expect(events.message).toHaveBeenCalledTimes(1);
    expect(events.message).toHaveBeenCalledWith(m);
    expect(events.partnerTyping).toHaveBeenLastCalledWith(false);
  });

  it('reports the end of the booking', async () => {
    const { socket, events } = setup();
    await flush();
    socket().fire('chat_ended', { chatId: CHAT, scheduleId: 's' });
    expect(events.ended).toHaveBeenCalledTimes(1);
  });

  it('resyncs on a short wake and reconnects after a long one', async () => {
    const { conn, socket, events } = setup();
    await flush();
    conn.wake(5_000);
    expect(events.resync).toHaveBeenCalledTimes(1);
    expect(socket().count('join')).toBe(1);
    conn.wake(60_000);
    await flush();
    expect(socket().count('join')).toBe(2);
    expect(events.resync).toHaveBeenCalledTimes(2);
  });

  it('stops cleanly: stop typing, disconnect, no more events', async () => {
    const { conn, socket, events } = setup();
    await flush();
    conn.typed();
    conn.stop();
    expect(socket().count('stop_typing')).toBe(1);
    expect(socket().connected).toBe(false);
    vi.mocked(events.status).mockClear();
    socket().fire('message', { _id: 'late', chat: CHAT });
    expect(events.message).not.toHaveBeenCalled();
    await expect(conn.send('x')).rejects.toBeInstanceOf(ChatSendError);
  });
});
