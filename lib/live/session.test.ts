import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEvent } from 'livekit-client';

import { BackendError } from '@/lib/backend/client';
import type { LiveApi, LiveQueueStatus } from '@/lib/live/api';
import { encodeLiveMessage, type LiveDataMessage } from '@/lib/live/messages';
import {
  LIVE_ROOM_EVENTS,
  LiveSession,
  type LiveLocalTrack,
  type LiveRemoteParticipant,
  type LiveRemotePublication,
  type LiveRoom,
  type LiveTrack,
} from '@/lib/live/session';

type Listener = (...args: unknown[]) => void;

/** Stands in for a <video> element: only identity matters. */
const element = (name: string) => ({ name }) as unknown as HTMLVideoElement;

/** A container for <audio> elements, with the two DOM calls the session uses. */
function audioBox() {
  const children: unknown[] = [];
  return {
    children,
    appendChild(el: unknown) {
      children.push(el);
    },
  } as unknown as HTMLElement & { children: unknown[] };
}

class FakeTrack implements LiveTrack {
  attachedTo: unknown[] = [];
  constructor(readonly kind: string) {}
  attach(el?: HTMLMediaElement): HTMLMediaElement {
    const target = el ?? ({ remove: () => this.removed++, tag: 'audio' } as unknown as HTMLMediaElement);
    this.attachedTo.push(target);
    return target;
  }
  detach(el?: HTMLMediaElement) {
    this.attachedTo = this.attachedTo.filter(e => e !== el);
  }
  removed = 0;
}

class FakeLocalTrack extends FakeTrack implements LiveLocalTrack {
  muted = false;
  stopped = false;
  restarts: string[] = [];
  async mute() {
    this.muted = true;
  }
  async unmute() {
    this.muted = false;
  }
  stop() {
    this.stopped = true;
  }
  async restartTrack(options: { facingMode: 'user' | 'environment' }) {
    this.restarts.push(options.facingMode);
  }
}

class FakePublication implements LiveRemotePublication {
  isSubscribed = true;
  isMuted = false;
  setSubscribed = vi.fn((on: boolean) => {
    this.isSubscribed = on;
  });
  constructor(
    readonly trackSid: string,
    readonly kind: string,
    readonly source: string,
    public track: FakeTrack = new FakeTrack(kind),
  ) {}
}

class FakeParticipant implements LiveRemoteParticipant {
  trackPublications = new Map<string, FakePublication>();
  isCameraEnabled = false;
  isMicrophoneEnabled = false;
  constructor(
    readonly identity: string,
    readonly metadata?: string,
  ) {}
  publish(kind: 'video' | 'audio') {
    const pub = new FakePublication(`${this.identity}-${kind}`, kind, kind === 'video' ? 'camera' : 'microphone');
    this.trackPublications.set(pub.trackSid, pub);
    if (kind === 'video') this.isCameraEnabled = true;
    else this.isMicrophoneEnabled = true;
    return pub;
  }
}

class FakeRoom implements LiveRoom {
  listeners = new Map<string, Listener[]>();
  remoteParticipants = new Map<string, FakeParticipant>();
  canPlaybackAudio = true;
  metadata?: string;
  connectedTo: string[] = [];
  disconnects = 0;
  failConnect = false;
  published: FakeLocalTrack[] = [];
  unpublished: FakeLocalTrack[] = [];
  sent: LiveDataMessage[] = [];
  log: string[] = [];
  localParticipant = {
    identity: 'me',
    permissions: { canPublish: false } as { canPublish: boolean } | undefined,
    publishTrack: vi.fn(async (track: LiveLocalTrack) => {
      this.published.push(track as FakeLocalTrack);
      this.log.push(`publish ${track.kind}`);
    }),
    unpublishTrack: vi.fn(async (track: LiveLocalTrack) => {
      this.unpublished.push(track as FakeLocalTrack);
      this.log.push(`unpublish ${track.kind}`);
    }),
    publishData: vi.fn(async (data: Uint8Array) => {
      this.sent.push(JSON.parse(new TextDecoder().decode(data)) as LiveDataMessage);
    }),
  };

  on(event: string, fn: (...args: never[]) => void) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), fn as Listener]);
  }
  off(event: string, fn: (...args: never[]) => void) {
    this.listeners.set(
      event,
      (this.listeners.get(event) ?? []).filter(f => f !== fn),
    );
  }
  fire(event: string, ...args: unknown[]) {
    for (const fn of [...(this.listeners.get(event) ?? [])]) fn(...args);
  }
  listenerCount() {
    return [...this.listeners.values()].reduce((n, fns) => n + fns.length, 0);
  }
  async connect(url: string, token: string) {
    if (this.failConnect) {
      this.fire(LIVE_ROOM_EVENTS.Disconnected, 0);
      throw new Error('could not connect');
    }
    this.connectedTo.push(`${url}|${token}`);
  }
  async disconnect() {
    this.disconnects += 1;
    this.log.push('disconnect');
    this.fire(LIVE_ROOM_EVENTS.Disconnected, 1);
  }
  async startAudio() {
    this.canPlaybackAudio = true;
  }

  // ---- what the room does ----
  join(identity: string, role: 'host' | 'viewer' | 'caller') {
    const p = new FakeParticipant(identity, JSON.stringify({ role }));
    this.remoteParticipants.set(identity, p);
    this.fire(LIVE_ROOM_EVENTS.ParticipantConnected, p);
    return p;
  }
  leave(identity: string) {
    const p = this.remoteParticipants.get(identity);
    this.remoteParticipants.delete(identity);
    this.fire(LIVE_ROOM_EVENTS.ParticipantDisconnected, p);
  }
  /** A participant publishes and we get subscribed (autoSubscribe), as LiveKit reports it. */
  publishes(p: FakeParticipant, kind: 'video' | 'audio') {
    const pub = p.publish(kind);
    this.fire(LIVE_ROOM_EVENTS.TrackPublished, pub, p);
    if (pub.isSubscribed) this.fire(LIVE_ROOM_EVENTS.TrackSubscribed, pub.track, pub, p);
    return pub;
  }
  message(m: LiveDataMessage) {
    this.fire(LIVE_ROOM_EVENTS.DataReceived, encodeLiveMessage(m));
  }
  grantPublish(on = true) {
    this.localParticipant.permissions = { canPublish: on };
    this.fire(LIVE_ROOM_EVENTS.ParticipantPermissionsChanged, undefined, { identity: 'me' });
  }
}

const NOW = new Date('2026-11-16T10:00:00Z').getTime();
const SEC = 1000;
const iso = (ms: number) => new Date(ms).toISOString();

function status(over: Partial<LiveQueueStatus> = {}): LiveQueueStatus {
  return {
    roomId: 'room-1',
    waitingCount: 1,
    maxWaiting: 5,
    isFull: false,
    isQueueOpen: true,
    canPay: true,
    callSlotPrice: { currency: 'NPR', amount: 150 },
    ...over,
  };
}

type SetupOver = {
  api?: Partial<LiveApi>;
  status?: Partial<LiveQueueStatus>;
  now?: () => number;
  /** Give the session a call lock: free to take, or held by another tab. */
  lock?: 'free' | 'taken';
};

function setup(over: SetupOver = {}) {
  const room = new FakeRoom();
  const log = room.log;
  const tracks = { video: new FakeLocalTrack('video'), audio: new FakeLocalTrack('audio') };
  let statusAnswer = status(over.status);
  const api: LiveApi = {
    activeRooms: vi.fn(async () => []),
    queueStatus: vi.fn(async () => {
      log.push('status');
      return statusAnswer;
    }),
    viewerToken: vi.fn(async () => {
      log.push('viewer token');
      return { token: 'viewer-tok', liveKitUrl: 'wss://lk', roomName: 'live-astro' };
    }),
    acceptTurn: vi.fn(async () => {
      log.push('accept');
      return { token: 'caller-tok', liveKitUrl: 'wss://lk', callType: 'public_video' as const, kickAt: iso(NOW + 600 * SEC), queueId: 'q1' };
    }),
    resumeCall: vi.fn(async () => {
      log.push('resume');
      return { token: 'caller-tok', liveKitUrl: 'wss://lk', callType: 'public_audio' as const, kickAt: iso(NOW + 300 * SEC), queueId: 'q1' };
    }),
    completeCall: vi.fn(async () => {
      log.push('complete');
    }),
    likeStatus: vi.fn(async () => ({ likeCount: 7, hasLiked: false })),
    like: vi.fn(async () => ({ likeCount: 8, hasLiked: true })),
    ...over.api,
  };
  const createTracks = vi.fn(async () => {
    log.push('create tracks');
    return [tracks.video, tracks.audio] as LiveLocalTrack[];
  });
  const session = new LiveSession({
    roomId: 'room-1',
    roomName: 'live-astro',
    astrologerId: 'astro',
    me: { id: 'me', name: 'Nibar Lc' },
    countryCode: 'NP',
    api,
    createRoom: () => room,
    createTracks,
    describeError: (e, fallback) => (e instanceof Error && e.message ? `${e.message}.` : fallback),
    now: over.now ?? (() => Date.now()),
    ...(over.lock
      ? {
          takeCallLock: async () => {
            if (over.lock === 'taken') return null;
            log.push('lock');
            let held = true;
            return {
              release: () => {
                if (held) log.push('unlock');
                held = false;
              },
            };
          },
        }
      : {}),
  });
  const setStatus = (next: Partial<LiveQueueStatus>) => {
    statusAnswer = status(next);
  };
  return { room, api, session, createTracks, tracks, log, setStatus };
}

async function watching(over?: Parameters<typeof setup>[0]) {
  const s = setup(over);
  const els = { hostVideo: element('host'), callerVideo: element('caller'), selfVideo: element('self'), audio: audioBox() };
  s.session.setMediaElements(els);
  await s.session.start();
  await flush();
  return { ...s, els };
}

const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('LIVE_ROOM_EVENTS', () => {
  it('names the real livekit-client events', () => {
    expect(LIVE_ROOM_EVENTS.Reconnecting).toBe(RoomEvent.Reconnecting);
    expect(LIVE_ROOM_EVENTS.Reconnected).toBe(RoomEvent.Reconnected);
    expect(LIVE_ROOM_EVENTS.Disconnected).toBe(RoomEvent.Disconnected);
    expect(LIVE_ROOM_EVENTS.ParticipantConnected).toBe(RoomEvent.ParticipantConnected);
    expect(LIVE_ROOM_EVENTS.ParticipantDisconnected).toBe(RoomEvent.ParticipantDisconnected);
    expect(LIVE_ROOM_EVENTS.TrackPublished).toBe(RoomEvent.TrackPublished);
    expect(LIVE_ROOM_EVENTS.TrackUnpublished).toBe(RoomEvent.TrackUnpublished);
    expect(LIVE_ROOM_EVENTS.TrackSubscribed).toBe(RoomEvent.TrackSubscribed);
    expect(LIVE_ROOM_EVENTS.TrackUnsubscribed).toBe(RoomEvent.TrackUnsubscribed);
    expect(LIVE_ROOM_EVENTS.TrackMuted).toBe(RoomEvent.TrackMuted);
    expect(LIVE_ROOM_EVENTS.TrackUnmuted).toBe(RoomEvent.TrackUnmuted);
    expect(LIVE_ROOM_EVENTS.LocalTrackUnpublished).toBe(RoomEvent.LocalTrackUnpublished);
    expect(LIVE_ROOM_EVENTS.ParticipantPermissionsChanged).toBe(RoomEvent.ParticipantPermissionsChanged);
    expect(LIVE_ROOM_EVENTS.RoomMetadataChanged).toBe(RoomEvent.RoomMetadataChanged);
    expect(LIVE_ROOM_EVENTS.DataReceived).toBe(RoomEvent.DataReceived);
    expect(LIVE_ROOM_EVENTS.AudioPlaybackStatusChanged).toBe(RoomEvent.AudioPlaybackStatusChanged);
  });
});

describe('starting', () => {
  it('reads the queue status, gets a viewer token and connects once', async () => {
    const { session, room, log } = await watching();
    expect(log).toEqual(['status', 'viewer token']);
    expect(room.connectedTo).toEqual(['wss://lk|viewer-tok']);
    const s = session.getState();
    expect(s.phase).toBe('watching');
    expect(s.queue).toEqual({ waitingCount: 1, maxWaiting: 5, isFull: false, isQueueOpen: true, canPay: true, price: { currency: 'NPR', amount: 150 } });
    expect(s.likeCount).toBe(7);
    expect(s.viewerCount).toBe(1);
    expect(s.resumeNeeded).toBe(false);
  });

  it('reads chat history and gifts from the room metadata', async () => {
    const { session, room } = setup();
    room.metadata = JSON.stringify({
      liveChat: {
        messages: [
          { messageId: 'm1', senderId: 'a', senderName: 'Aisha K', text: 'hi', sentAt: iso(NOW - 60 * SEC) },
          { messageId: 'm1', senderId: 'a', senderName: 'Aisha K', text: 'hi', sentAt: iso(NOW - 60 * SEC) },
          { messageId: 'bad' },
        ],
        gifts: [{ id: 'gift-a-x', name: 'Aisha', giftTitle: 'Rose', sentAt: iso(NOW - 30 * SEC) }],
      },
    });
    await session.start();
    expect(session.getState().messages.map(m => m.messageId)).toEqual(['m1']);
    expect(session.getState().gifts).toEqual([{ id: 'gift-a-x', senderName: 'Aisha', giftTitle: 'Rose', sentAt: iso(NOW - 30 * SEC), origin: 'history' }]);
  });

  it('ends as kicked when the server says the person was removed', async () => {
    const { session } = setup({
      api: { viewerToken: vi.fn(async () => Promise.reject(new BackendError('You have been removed from this stream', 403))) },
    });
    await session.start();
    expect(session.getState().phase).toBe('ended');
    expect(session.getState().endReason).toBe('kicked');
  });

  it('ends as not-live when the room is gone', async () => {
    const { session } = setup({
      api: { queueStatus: vi.fn(async () => Promise.reject(new BackendError('Live room is not active', 404))) },
    });
    await session.start();
    expect(session.getState().endReason).toBe('not-live');
  });

  it('fails cleanly when the connection does not come up', async () => {
    const { session, room } = setup();
    room.failConnect = true;
    await session.start();
    expect(session.getState().phase).toBe('ended');
    expect(session.getState().endReason).toBe('failed');
    expect(session.getState().error).toMatch(/Could not join/);
  });

  it('a returning active caller gets the resume token and is asked to tap Rejoin', async () => {
    const { session, room, log } = await watching({
      status: { userEntry: { queueId: 'q1', position: 1, status: 'active', callType: 'public_audio' }, activeCaller: { userId: 'me', callType: 'public_audio', kickAt: iso(NOW + 300 * SEC) } },
    });
    expect(log).toEqual(['status', 'resume']);
    expect(room.connectedTo).toEqual(['wss://lk|caller-tok']);
    const s = session.getState();
    expect(s.phase).toBe('watching');
    expect(s.resumeNeeded).toBe(true);
    expect(s.me).toEqual({ status: 'active', position: null, callType: 'public_audio', queueId: 'q1', turnExpiresAt: null });
    expect(s.call?.callerId).toBe('me');
  });

  it('Rejoin publishes on the same connection (the caller token already allows it)', async () => {
    const { session, room, els, tracks } = await watching({
      status: { userEntry: { queueId: 'q1', position: 1, status: 'active', callType: 'public_audio' } },
    });
    room.localParticipant.permissions = { canPublish: true };
    await session.resumeCall();
    expect(room.log.slice(-3)).toEqual(['create tracks', 'publish video', 'publish audio']);
    expect(room.connectedTo).toHaveLength(1);
    expect(session.getState().phase).toBe('in-call');
    expect(tracks.video.attachedTo).toEqual([els.selfVideo]);
  });
});

describe('watching', () => {
  it('plays the host into the host element and sound into the audio box; counts viewers only', async () => {
    const { session, room, els } = await watching();
    const host = room.join('astro', 'host');
    const video = room.publishes(host, 'video');
    const audio = room.publishes(host, 'audio');
    room.join('v1', 'viewer');
    room.join('v2', 'viewer');
    room.join('c1', 'caller');
    expect(video.track.attachedTo).toEqual([els.hostVideo]);
    expect(els.audio.children).toHaveLength(1);
    expect(audio.track.attachedTo).toHaveLength(1);
    const s = session.getState();
    expect(s.host).toEqual({ present: true, cameraOn: true });
    expect(s.viewerCount).toBe(3);
    room.leave('astro');
    expect(session.getState().host.present).toBe(false);
  });

  it('moves tracks when the elements change (no remount needed)', async () => {
    const { session, room, els } = await watching();
    const host = room.join('astro', 'host');
    const video = room.publishes(host, 'video');
    const other = element('host-2');
    session.setMediaElements({ hostVideo: other });
    expect(video.track.attachedTo).toEqual([other]);
    expect(els.hostVideo).not.toBe(other);
  });

  it('like() counts at once and takes the server answer', async () => {
    const { session, api } = await watching();
    await session.like();
    expect(api.like).toHaveBeenCalledTimes(1);
    expect(session.getState()).toMatchObject({ likeCount: 8, hasLiked: true });
    await session.like();
    expect(api.like).toHaveBeenCalledTimes(1);
  });

  it('sends chat in the app shape and shows incoming chat, 15 at most, no doubles', async () => {
    const { session, room } = await watching({ now: () => NOW });
    expect(session.sendChat('  hello   ')).toBe(true);
    expect(room.sent[0]).toMatchObject({ type: 'chat:message', senderId: 'me', senderName: 'Nibar Lc', text: 'hello', sentAt: iso(NOW) });
    expect(room.sent[0]).toHaveProperty('messageId', expect.stringMatching(/^me-/));
    expect(session.sendChat('   ')).toBe(false);
    for (let i = 0; i < 20; i++)
      room.message({ type: 'chat:message', messageId: `x${i}`, senderId: 'v', senderName: 'V', text: `${i}`, sentAt: iso(NOW + i) });
    room.message({ type: 'chat:message', messageId: 'x19', senderId: 'v', senderName: 'V', text: '19', sentAt: iso(NOW + 19) });
    const texts = session.getState().messages.map(m => m.text);
    expect(texts).toHaveLength(15);
    expect(texts.at(-1)).toBe('19');
  });

  it('a gift broadcast wins over its history copy', async () => {
    const { session, room } = await watching();
    room.fire(LIVE_ROOM_EVENTS.RoomMetadataChanged, JSON.stringify({ liveChat: { gifts: [{ id: 'gift-v-' + iso(NOW), name: 'Aisha', giftTitle: 'Rose', sentAt: iso(NOW) }] } }));
    expect(session.getState().gifts[0].origin).toBe('history');
    room.message({ type: 'gift:sent', giftTitle: 'Rose', senderName: 'Aisha K', senderId: 'v', sentAt: iso(NOW) });
    expect(session.getState().gifts).toHaveLength(1);
    expect(session.getState().gifts[0].origin).toBe('live');
    room.message({ type: 'react:sync', likeCount: 42 });
    expect(session.getState().likeCount).toBe(42);
  });

  it('my own gift shows at once and the server broadcast of it does not double it', async () => {
    const { session, room } = await watching();
    session.showOwnGift({ giftTitle: 'Lotus', sentAt: iso(NOW), giftImageUrl: 'https://cdn/lotus.png' });
    expect(session.getState().gifts).toEqual([
      { id: `gift-me-${iso(NOW)}`, senderName: 'Nibar Lc', giftTitle: 'Lotus', sentAt: iso(NOW), giftImageUrl: 'https://cdn/lotus.png', origin: 'live' },
    ]);
    room.message({ type: 'gift:sent', giftTitle: 'Lotus', senderName: 'Nibar Lc', senderId: 'me', sentAt: iso(NOW) });
    expect(session.getState().gifts).toHaveLength(1);
    await session.end();
    session.showOwnGift({ giftTitle: 'Rose', sentAt: iso(NOW + 1) });
    expect(session.getState().gifts).toHaveLength(1);
  });

  it('polls the queue status every 15 s and stops after the end', async () => {
    const { session, api } = await watching();
    expect(api.queueStatus).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(15 * SEC);
    expect(api.queueStatus).toHaveBeenCalledTimes(2);
    await session.end();
    await vi.advanceTimersByTimeAsync(60 * SEC);
    expect(api.queueStatus).toHaveBeenCalledTimes(2);
  });

  it('a poll that finds the room gone ends the session', async () => {
    const { session, api } = await watching();
    (api.queueStatus as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new BackendError('Live room is not active', 404));
    await vi.advanceTimersByTimeAsync(15 * SEC);
    expect(session.getState().endReason).toBe('room-ended');
  });
});

describe('call modes for a passive viewer (subscribe-side only)', () => {
  async function roomWithCall(mode: 'public_video' | 'public_audio' | 'private_audio') {
    const w = await watching();
    const host = w.room.join('astro', 'host');
    const hostVideo = w.room.publishes(host, 'video');
    const hostAudio = w.room.publishes(host, 'audio');
    w.room.message({ type: 'call-mode:active', callType: mode, callerId: 'c1', callerName: 'Soni', kickAt: iso(NOW + 600 * SEC) });
    const caller = w.room.join('c1', 'caller');
    const callerVideo = w.room.publishes(caller, 'video');
    const callerAudio = w.room.publishes(caller, 'audio');
    return { ...w, hostVideo, hostAudio, callerVideo, callerAudio };
  }

  it('public_video: everything, caller in the caller element', async () => {
    const r = await roomWithCall('public_video');
    expect([r.hostVideo, r.hostAudio, r.callerVideo, r.callerAudio].map(p => p.isSubscribed)).toEqual([true, true, true, true]);
    expect(r.callerVideo.track.attachedTo).toEqual([r.els.callerVideo]);
    expect(r.session.getState().call).toEqual({ mode: 'public_video', callerId: 'c1', callerName: 'Soni', kickAt: NOW + 600 * SEC });
    expect(r.session.getState().callerCameraOn).toBe(true);
  });

  it("public_audio: the caller's video is not subscribed", async () => {
    const r = await roomWithCall('public_audio');
    expect(r.callerVideo.setSubscribed).toHaveBeenCalledWith(false);
    expect([r.hostVideo, r.hostAudio, r.callerAudio].map(p => p.isSubscribed)).toEqual([true, true, true]);
    expect(r.callerVideo.isSubscribed).toBe(false);
  });

  it("private_audio: no caller video, no call audio from either side; the host's video stays", async () => {
    const r = await roomWithCall('private_audio');
    expect([r.hostVideo, r.hostAudio, r.callerVideo, r.callerAudio].map(p => p.isSubscribed)).toEqual([true, false, false, false]);
    expect(r.hostVideo.setSubscribed).not.toHaveBeenCalled();
  });

  it('cleared: the host audio comes back and the ex-caller is just another viewer', async () => {
    const r = await roomWithCall('private_audio');
    r.room.message({ type: 'call-mode:cleared' });
    expect(r.hostAudio.isSubscribed).toBe(true);
    expect(r.callerVideo.isSubscribed).toBe(false);
    expect(r.session.getState().call).toBeNull();
  });

  it('a participant who is neither host nor caller is never subscribed', async () => {
    const { room } = await watching();
    const stranger = room.join('v9', 'viewer');
    const pub = room.publishes(stranger, 'audio');
    expect(pub.isSubscribed).toBe(false);
  });

  it('each publication is told once per change', async () => {
    const r = await roomWithCall('public_audio');
    r.room.fire(LIVE_ROOM_EVENTS.TrackPublished);
    r.room.fire(LIVE_ROOM_EVENTS.Reconnected);
    expect(r.callerVideo.setSubscribed).toHaveBeenCalledTimes(1);
  });
});

describe('a status answer older than a room message', () => {
  it('cannot clear a call that call-mode:active just announced', async () => {
    const { session, room, api } = await watching({ now: () => Date.now() });
    let release: (() => void) | null = null;
    (api.queueStatus as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(resolve => { release = () => resolve(status()); }),
    );
    void session.refreshStatus(); // leaves before the call starts...
    await vi.advanceTimersByTimeAsync(50);
    room.message({ type: 'call-mode:active', callType: 'private_audio', callerId: 'c1', callerName: 'Soni', kickAt: iso(NOW + 600 * SEC) });
    release!(); // ...and answers after it, without an active caller
    await flush();
    expect(session.getState().call?.mode).toBe('private_audio');
  });

  it('cannot undo a your-turn prompt either', async () => {
    const { session, room, api } = await watching({ now: () => Date.now(), status: { userEntry: { queueId: 'q1', position: 1, status: 'waiting', callType: 'public_video' } } });
    let release: (() => void) | null = null;
    (api.queueStatus as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(resolve => { release = () => resolve(status({ userEntry: { queueId: 'q1', position: 1, status: 'waiting', callType: 'public_video' } })); }),
    );
    void session.refreshStatus();
    await vi.advanceTimersByTimeAsync(50);
    room.message({ type: 'queue:your-turn-prompt', queueId: 'q1', callType: 'public_video', expiresAt: iso(NOW + 60 * SEC) });
    release!();
    await flush();
    expect(session.getState().me?.status).toBe('called');
  });
});

describe('the paid queue', () => {
  it('your turn arrives as a data message, position from queue:update, no-show clears me with a notice', async () => {
    const { session, room } = await watching({ status: { userEntry: { queueId: 'q1', position: 3, status: 'waiting', callType: 'public_video' } } });
    expect(session.getState().me).toMatchObject({ status: 'waiting', position: 3 });
    room.message({ type: 'queue:update', waitingCount: 2, positions: { me: 2 } });
    expect(session.getState().me?.position).toBe(2);
    expect(session.getState().queue?.waitingCount).toBe(2);
    room.message({ type: 'queue:your-turn-prompt', queueId: 'q1', callType: 'public_video', expiresAt: iso(NOW + 60 * SEC) });
    expect(session.getState().me).toEqual({ status: 'called', position: 1, callType: 'public_video', queueId: 'q1', turnExpiresAt: NOW + 60 * SEC });
    room.message({ type: 'queue:no-show', userId: 'someone-else' });
    expect(session.getState().me?.status).toBe('called');
    room.message({ type: 'queue:no-show', userId: 'me' });
    expect(session.getState().me).toBeNull();
    expect(session.getState().notice?.text).toMatch(/turn expired/);
  });

  it('queue:open-changed patches canPay', async () => {
    const { session, room } = await watching();
    room.message({ type: 'queue:open-changed', isQueueOpen: false });
    expect(session.getState().queue).toMatchObject({ isQueueOpen: false, canPay: false });
  });
});

async function called(over?: SetupOver) {
  const w = await watching(over);
  w.room.message({ type: 'queue:your-turn-prompt', queueId: 'q1', callType: 'public_video', expiresAt: iso(NOW + 60 * SEC) });
  return w;
}

describe('Join Now (my call), the order the host sees', () => {
  it('camera first, then accept, then publish on the same connection once the permission arrives', async () => {
    const { session, room, els, tracks, log } = await called();
    const joining = session.acceptTurn();
    await flush();
    expect(log.slice(-2)).toEqual(['create tracks', 'accept']);
    expect(session.getState().phase).toBe('joining-call');
    expect(room.published).toHaveLength(0);
    room.grantPublish();
    await joining;
    expect(log.slice(-4)).toEqual(['create tracks', 'accept', 'publish video', 'publish audio']);
    expect(room.connectedTo).toHaveLength(1);
    const s = session.getState();
    expect(s.phase).toBe('in-call');
    expect(s).toMatchObject({ micOn: true, cameraOn: true });
    expect(s.me).toEqual({ status: 'active', position: null, callType: 'public_video', queueId: 'q1', turnExpiresAt: null });
    expect(s.call).toEqual({ mode: 'public_video', callerId: 'me', callerName: 'Nibar Lc', kickAt: NOW + 600 * SEC });
    expect(tracks.video.attachedTo).toEqual([els.selfVideo]);
  });

  it('a blocked camera never takes the slot', async () => {
    const { session, api, createTracks } = await called();
    createTracks.mockRejectedValueOnce(new Error('NotAllowedError'));
    await session.acceptTurn();
    expect(api.acceptTurn).not.toHaveBeenCalled();
    const s = session.getState();
    expect(s.phase).toBe('watching');
    expect(s.me?.status).toBe('called');
    expect(s.error).toMatch(/Camera and microphone/);
  });

  it('a refused accept stops the prepared tracks and publishes nothing', async () => {
    const { session, api, room, tracks } = await called();
    (api.acceptTurn as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new BackendError('Your turn to join the call has expired', 400));
    await session.acceptTurn();
    expect(room.published).toHaveLength(0);
    expect(tracks.video.stopped && tracks.audio.stopped).toBe(true);
    expect(session.getState().phase).toBe('watching');
    expect(session.getState().error).toMatch(/expired/);
  });

  it('a missed permission message is retried once through queue/resume', async () => {
    const { session, api, room } = await called();
    const joining = session.acceptTurn();
    await vi.advanceTimersByTimeAsync(5 * SEC);
    expect(api.resumeCall).toHaveBeenCalledTimes(1);
    room.grantPublish();
    await joining;
    expect(session.getState().phase).toBe('in-call');
    expect(room.connectedTo).toHaveLength(1);
  });

  it('still no permission: tracks stopped, Rejoin offered', async () => {
    const { session, room, tracks } = await called();
    const joining = session.acceptTurn();
    await vi.advanceTimersByTimeAsync(11 * SEC);
    await joining;
    expect(room.published).toHaveLength(0);
    expect(tracks.video.stopped).toBe(true);
    expect(session.getState()).toMatchObject({ phase: 'watching', resumeNeeded: true });
  });

  it('a stale status poll during my call cannot cut it', async () => {
    const { session, room, setStatus } = await called();
    const joining = session.acceptTurn();
    await flush();
    room.grantPublish();
    await joining;
    setStatus({});
    await vi.advanceTimersByTimeAsync(15 * SEC);
    expect(session.getState().phase).toBe('in-call');
    expect(session.getState().me?.status).toBe('active');
  });
});

async function inCall(over?: SetupOver) {
  const w = await called(over);
  const joining = w.session.acceptTurn();
  await flush();
  w.room.grantPublish();
  await joining;
  w.room.log.length = 0;
  return w;
}

describe('in my call', () => {
  it('mute and camera are track mutes, flip restarts the same track', async () => {
    const { session, tracks, room } = await inCall();
    await session.toggleMic();
    expect(tracks.audio.muted).toBe(true);
    await session.toggleCamera();
    expect(tracks.video.muted).toBe(true);
    await session.flipCamera();
    expect(tracks.video.restarts).toEqual(['environment']);
    expect(session.getState()).toMatchObject({ micOn: false, cameraOn: false, facing: 'environment' });
    expect(room.unpublished).toHaveLength(0);
  });

  it('End Call takes my tracks down first, then tells the server; the review is asked once', async () => {
    const { session, room, tracks, els } = await inCall();
    await session.endCall();
    expect(room.log.filter(l => l !== 'status')).toEqual(['unpublish video', 'unpublish audio', 'complete']);
    expect(tracks.video.stopped && tracks.audio.stopped).toBe(true);
    expect(tracks.video.attachedTo).not.toContain(els.selfVideo);
    const s = session.getState();
    expect(s.phase).toBe('watching');
    expect(s).toMatchObject({ me: null, call: null, micOn: false, cameraOn: false, reviewFor: 'q1' });
    expect(room.connectedTo).toHaveLength(1);
    session.clearReview();
    expect(session.getState().reviewFor).toBeNull();
    await session.endCall();
    expect(room.log.filter(l => l !== 'status')).toHaveLength(3);
  });

  it('the server ending the slot (permission revoked, then cleared) brings me back to watching', async () => {
    const { session, room, tracks } = await inCall();
    room.grantPublish(false);
    await flush();
    expect(room.log).toEqual(['unpublish video', 'unpublish audio']);
    room.message({ type: 'call-mode:cleared' });
    await flush();
    const s = session.getState();
    expect(s.phase).toBe('watching');
    expect(s).toMatchObject({ me: null, call: null, reviewFor: 'q1' });
    expect(tracks.audio.stopped).toBe(true);
    expect(room.log.filter(l => l !== 'status')).toHaveLength(2);
  });

  it('call-mode:cleared alone ends it too', async () => {
    const { session, room } = await inCall();
    room.message({ type: 'call-mode:cleared' });
    await flush();
    expect(room.log.filter(l => l !== 'status')).toEqual(['unpublish video', 'unpublish audio']);
    expect(session.getState()).toMatchObject({ phase: 'watching', reviewFor: 'q1' });
  });

  it('a track the server unpublished counts as the end as well', async () => {
    const { session, room, tracks } = await inCall();
    room.fire(LIVE_ROOM_EVENTS.LocalTrackUnpublished, { track: tracks.video });
    await flush();
    expect(session.getState().phase).toBe('watching');
  });

  it('leaving the page mid-call unpublishes before disconnecting and keeps the slot (no review)', async () => {
    const { session, room } = await inCall();
    await session.end();
    expect(room.log).toEqual(['unpublish video', 'unpublish audio', 'disconnect']);
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'left', reviewFor: null });
  });

  it("another device's call-mode:active about me does not disturb my call", async () => {
    const { session, room } = await inCall();
    room.message({ type: 'call-mode:active', callType: 'public_video', callerId: 'me', kickAt: iso(NOW + 600 * SEC) });
    expect(session.getState().phase).toBe('in-call');
  });
});

describe('joining a call safely', () => {
  const calls = (log: string[]) => log.filter(l => l !== 'status');

  it('takes the one-call lock before the camera, and gives it back when the call ends', async () => {
    const { session, room, log } = await called({ lock: 'free' });
    const joining = session.acceptTurn();
    await flush();
    room.grantPublish();
    await joining;
    expect(calls(log).slice(-5)).toEqual(['lock', 'create tracks', 'accept', 'publish video', 'publish audio']);
    await session.endCall();
    expect(calls(log).slice(-4)).toEqual(['unpublish video', 'unpublish audio', 'unlock', 'complete']);
  });

  it('a call open in another tab: no camera, no accept, the turn is kept', async () => {
    const { session, api, createTracks } = await called({ lock: 'taken' });
    await session.acceptTurn();
    expect(createTracks).not.toHaveBeenCalled();
    expect(api.acceptTurn).not.toHaveBeenCalled();
    expect(session.getState()).toMatchObject({ phase: 'watching', resumeNeeded: false });
    expect(session.getState().me?.status).toBe('called');
    expect(session.getState().error).toMatch(/Another call is open/);
  });

  it('a second Join Now tap while the first is joining does nothing', async () => {
    const { session, room, api, createTracks } = await called();
    const first = session.acceptTurn();
    const second = session.acceptTurn();
    await flush();
    room.grantPublish();
    await Promise.all([first, second]);
    expect(createTracks).toHaveBeenCalledTimes(1);
    expect(api.acceptTurn).toHaveBeenCalledTimes(1);
    expect(room.published).toHaveLength(2);
  });

  it('the turn runs out while the browser asks for the camera: no accept, camera closed, lock back', async () => {
    const { session, room, api, createTracks, tracks, log } = await called({ lock: 'free' });
    let open: (t: LiveLocalTrack[]) => void = () => {};
    createTracks.mockImplementationOnce(() => new Promise<LiveLocalTrack[]>(resolve => (open = resolve)));
    const joining = session.acceptTurn();
    await flush();
    room.message({ type: 'queue:no-show', userId: 'me' });
    open([tracks.video, tracks.audio]);
    await joining;
    expect(api.acceptTurn).not.toHaveBeenCalled();
    expect(tracks.video.stopped && tracks.audio.stopped).toBe(true);
    expect(log).toContain('unlock');
    expect(session.getState()).toMatchObject({ phase: 'watching', me: null, error: null, resumeNeeded: false });
  });

  it('the host ends the call while I wait for the permission: nothing is published, no error', async () => {
    const { session, room, tracks, log } = await called({ lock: 'free' });
    const joining = session.acceptTurn();
    await flush();
    room.message({ type: 'call-mode:cleared' });
    room.grantPublish();
    await joining;
    expect(room.published).toHaveLength(0);
    expect(tracks.video.stopped && tracks.audio.stopped).toBe(true);
    expect(log).toContain('unlock');
    expect(session.getState()).toMatchObject({ phase: 'watching', me: null, call: null, error: null, resumeNeeded: false });
  });

  it('the call ends between my two tracks: the camera comes down again, the mic never goes up', async () => {
    const { session, room, tracks } = await called();
    room.localParticipant.publishTrack.mockImplementationOnce(async (track: LiveLocalTrack) => {
      room.published.push(track as FakeLocalTrack);
      room.log.push(`publish ${track.kind}`);
      room.message({ type: 'call-mode:cleared' });
    });
    const joining = session.acceptTurn();
    await flush();
    room.grantPublish();
    await joining;
    expect(calls(room.log).slice(-2)).toEqual(['publish video', 'unpublish video']);
    expect(room.published).toHaveLength(1);
    expect(tracks.audio.stopped).toBe(true);
    expect(session.getState()).toMatchObject({ phase: 'watching', me: null, error: null, resumeNeeded: false });
  });

  it('publishing fails: what went up comes down, Rejoin is offered and works on the same connection', async () => {
    const { session, room, tracks, createTracks, log } = await called({ lock: 'free' });
    room.localParticipant.publishTrack
      .mockImplementationOnce(async (track: LiveLocalTrack) => {
        room.published.push(track as FakeLocalTrack);
        room.log.push(`publish ${track.kind}`);
      })
      .mockRejectedValueOnce(new Error('negotiation failed'));
    const joining = session.acceptTurn();
    await flush();
    room.grantPublish();
    await joining;
    expect(calls(log).slice(-4)).toEqual(['publish video', 'unpublish video', 'unpublish audio', 'unlock']);
    expect(tracks.video.stopped && tracks.audio.stopped).toBe(true);
    const s = session.getState();
    expect(s).toMatchObject({ phase: 'watching', resumeNeeded: true });
    expect(s.me?.status).toBe('active');
    expect(s.error).toMatch(/could not start/);

    const again = { video: new FakeLocalTrack('video'), audio: new FakeLocalTrack('audio') };
    createTracks.mockResolvedValueOnce([again.video, again.audio]);
    await session.resumeCall();
    expect(calls(log).slice(-3)).toEqual(['lock', 'publish video', 'publish audio']);
    expect(room.published.slice(-2)).toEqual([again.video, again.audio]);
    expect(session.getState()).toMatchObject({ phase: 'in-call', resumeNeeded: false, error: null });
    expect(room.connectedTo).toHaveLength(1);
  });

  it('a second Rejoin tap does nothing either', async () => {
    const { session, room, createTracks } = await watching({
      status: { userEntry: { queueId: 'q1', position: 0, status: 'active', callType: 'public_audio' } },
    });
    room.localParticipant.permissions = { canPublish: true };
    await Promise.all([session.resumeCall(), session.resumeCall()]);
    expect(createTracks).toHaveBeenCalledTimes(1);
    expect(room.published).toHaveLength(2);
  });

  it('leaving the page gives the lock back', async () => {
    const { session, log } = await inCall({ lock: 'free' });
    await session.end();
    expect(calls(log).slice(-4)).toEqual(['unpublish video', 'unpublish audio', 'unlock', 'disconnect']);
  });

  it('says once that the call has started', async () => {
    const { session } = await inCall();
    expect(session.getState().notice?.text).toMatch(/You're live with the astrologer/);
  });
});

describe('End Call and the server', () => {
  it('asks for the review only after the server closed the slot', async () => {
    let close: () => void = () => {};
    const { session, api } = await inCall();
    (api.completeCall as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise<void>(resolve => (close = resolve)));
    const ending = session.endCall();
    await flush();
    expect(session.getState()).toMatchObject({ phase: 'watching', me: null, reviewFor: null });
    close();
    await ending;
    expect(session.getState().reviewFor).toBe('q1');
  });

  it('a network failure is tried once more', async () => {
    const { session, api } = await inCall();
    (api.completeCall as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const ending = session.endCall();
    await vi.advanceTimersByTimeAsync(1 * SEC);
    await ending;
    expect(api.completeCall).toHaveBeenCalledTimes(2);
    expect(session.getState()).toMatchObject({ reviewFor: 'q1', error: null });
  });

  it('a slot the server already closed counts as ended', async () => {
    const { session, api } = await inCall();
    (api.completeCall as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new BackendError('You are not in an active live call slot.', 400));
    await session.endCall();
    expect(api.completeCall).toHaveBeenCalledTimes(1);
    expect(session.getState()).toMatchObject({ reviewFor: 'q1', error: null });
  });

  it('the server never hears it: no review, the problem is said, and the status brings Rejoin back', async () => {
    const { session, api, setStatus } = await inCall();
    (api.completeCall as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError('Failed to fetch'));
    setStatus({ userEntry: { queueId: 'q1', position: 0, status: 'active', callType: 'public_video' } });
    const ending = session.endCall();
    await vi.advanceTimersByTimeAsync(1 * SEC);
    await ending;
    await flush();
    const s = session.getState();
    expect(s.reviewFor).toBeNull();
    expect(s.error).toMatch(/could not be closed/);
    expect(s).toMatchObject({ phase: 'watching', resumeNeeded: true });
  });

  it('a status answer that left before the slot closed cannot bring the call back', async () => {
    let t = NOW;
    const { session, api, room } = await inCall({ now: () => t });
    let answer: (s: LiveQueueStatus) => void = () => {};
    (api.queueStatus as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise<LiveQueueStatus>(resolve => (answer = resolve)));
    void session.refreshStatus();
    t += 500;
    room.message({ type: 'call-mode:cleared' });
    await flush();
    answer(status({ userEntry: { queueId: 'q1', position: 0, status: 'active', callType: 'public_video' } }));
    await flush();
    expect(session.getState()).toMatchObject({ phase: 'watching', me: null, resumeNeeded: false });
  });
});

describe('endings', () => {
  it('room:ended', async () => {
    const { session, room } = await watching();
    room.message({ type: 'room:ended' });
    await flush();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'room-ended' });
    expect(room.disconnects).toBe(1);
    expect(room.listenerCount()).toBe(0);
  });

  it('participant:kicked carries a notice', async () => {
    const { session, room } = await watching();
    room.message({ type: 'participant:kicked' });
    await flush();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'kicked' });
    expect(session.getState().notice?.text).toMatch(/removed/);
  });

  it('a dropped connection ends the session (Rejoin is a new one); duplicate identity says other-device', async () => {
    const a = await watching();
    a.room.fire(LIVE_ROOM_EVENTS.Disconnected, 1);
    await flush();
    expect(a.session.getState().endReason).toBe('connection-lost');
    const b = await watching();
    b.room.fire(LIVE_ROOM_EVENTS.Disconnected, 2);
    await flush();
    expect(b.session.getState().endReason).toBe('other-device');
  });

  it('reconnecting is shown and cleared', async () => {
    const { session, room } = await watching();
    room.fire(LIVE_ROOM_EVENTS.Reconnecting);
    expect(session.getState().phase).toBe('reconnecting');
    room.fire(LIVE_ROOM_EVENTS.Reconnected);
    expect(session.getState().phase).toBe('watching');
  });

  it('end() is safe twice and detaches everything', async () => {
    const { session, room, els } = await watching();
    const host = room.join('astro', 'host');
    const video = room.publishes(host, 'video');
    room.publishes(host, 'audio');
    await session.end();
    await session.end();
    expect(room.disconnects).toBe(1);
    expect(video.track.attachedTo).toEqual([]);
    expect(els.audio.children).toHaveLength(1); // the box keeps its node list in this fake; the element was told to remove itself
    expect(room.listenerCount()).toBe(0);
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'left', host: { present: false, cameraOn: false } });
  });

  it('start() after the end does nothing', async () => {
    const { session, room } = await watching();
    await session.end();
    await session.start();
    expect(room.connectedTo).toHaveLength(1);
  });

  it('listeners are only woken when a value really changed', async () => {
    const { session, room } = await watching();
    let wakes = 0;
    session.subscribe(() => wakes++);
    room.fire(LIVE_ROOM_EVENTS.TrackMuted);
    room.fire(LIVE_ROOM_EVENTS.TrackMuted);
    expect(wakes).toBe(0);
    await vi.advanceTimersByTimeAsync(15 * SEC);
    expect(wakes).toBe(0);
  });
});
