// One visit to a live stream, viewer side (doc 10; design in C:\jb\safer-live-plan-web.md).
//
// Built on purpose NOT like the app's wiring (ap src/screens/Live): there a <LiveKitRoom> keyed by room is remounted
// on every viewer<->caller change, and "Join Now" disconnects the viewer connection and reconnects with a caller
// token (the host sees a participant leave, a new one join and new tracks), which is the top suspect for the host
// app's native crash when callers rotate. Here one plain object owns one Room for the whole visit:
// - one connect per visit (a lost connection ends the session; "Rejoin" is a new session);
// - viewer -> caller happens on the SAME connection: on queue/accept the backend upgrades this participant's
//   publish permission, we wait for it and publish two tracks we prepared BEFORE accepting (a blocked camera never
//   takes the slot); the end unpublishes our own tracks first, then tells the server;
// - video elements are handed in once and tracks move between them; passive viewers never touch the camera;
// - call modes are subscribe-side only, exactly the app's policy (03-call-modes-and-av.md).
// Only the protocol is the app's: token route, identity = userId, data messages, room metadata history, end rules.

import {
  decodeLiveMessage,
  dedupeMessages,
  encodeLiveMessage,
  giftFromMessage,
  mergeGifts,
  newChatMessageId,
  parseRoomHistory,
  sanitizeChatText,
  type LiveCallType,
  type LiveChatMessage,
  type LiveDataMessage,
  type LiveGift,
} from '@/lib/live/messages';
import { classifyLiveError, type LiveApi, type LiveQueueStatus } from '@/lib/live/api';

export type LivePhase =
  | 'idle'
  /** Asking the server about the room and the queue, then getting a token. */
  | 'loading'
  | 'connecting'
  | 'watching'
  /** Join Now tapped: camera + mic, accept, publish. */
  | 'joining-call'
  | 'in-call'
  | 'reconnecting'
  | 'ended';

export type LiveEndReason =
  | 'left'
  | 'room-ended'
  | 'kicked'
  | 'connection-lost'
  /** The same account joined this room from somewhere else (app or another tab). */
  | 'other-device'
  | 'not-live'
  | 'failed';

export type LiveQueueInfo = {
  waitingCount: number;
  maxWaiting: number;
  isFull: boolean;
  isQueueOpen: boolean;
  canPay: boolean;
  price: { currency: string; amount: number } | null;
};

/** My place in the paid queue. */
export type LiveMyQueue = {
  status: 'waiting' | 'called' | 'active';
  position: number | null;
  callType: LiveCallType;
  queueId: string | null;
  /** Called: when the 60 s window closes (ms). */
  turnExpiresAt: number | null;
};

/** The call going on in the room (mine or someone else's). */
export type LiveActiveCall = {
  mode: LiveCallType;
  callerId: string;
  callerName: string | null;
  /** When the 10-minute slot ends (ms). */
  kickAt: number | null;
};

export type LiveNotice = { id: number; text: string };

export type LiveState = {
  phase: LivePhase;
  endReason: LiveEndReason | null;
  /** A problem, in words. Cleared by the next action. */
  error: string | null;
  /** The host is in the room and their camera is on (false while they paused video or dropped). */
  host: { present: boolean; cameraOn: boolean };
  /** The caller's camera, for the split screen (not me). */
  callerCameraOn: boolean;
  /** People watching, me included (participants whose role is viewer, like the app counts). */
  viewerCount: number;
  likeCount: number;
  hasLiked: boolean;
  /** The browser blocks sound until a tap (iOS Safari): call startAudio() from one. */
  audioBlocked: boolean;
  messages: LiveChatMessage[];
  gifts: LiveGift[];
  queue: LiveQueueInfo | null;
  me: LiveMyQueue | null;
  call: LiveActiveCall | null;
  /** My slot is active on the server but I am not publishing (page reloaded): ask for a tap, then resumeCall(). */
  resumeNeeded: boolean;
  /** In my call: my mic/camera. */
  micOn: boolean;
  cameraOn: boolean;
  facing: 'user' | 'environment';
  /** A call of mine just ended: ask for the review once (clearReview() when shown). */
  reviewFor: string | null;
  /** Something to toast once (your turn expired, removed...). */
  notice: LiveNotice | null;
};

// ---- The slice of livekit-client this uses (lib/call/livekit-room.ts adapts the real one) ----

export interface LiveTrack {
  kind: string;
  attach(element: HTMLMediaElement): HTMLMediaElement;
  attach(): HTMLMediaElement;
  detach(element?: HTMLMediaElement): unknown;
}

export interface LiveLocalTrack extends LiveTrack {
  mute(): Promise<unknown>;
  unmute(): Promise<unknown>;
  stop(): void;
  restartTrack?: (options: { facingMode: 'user' | 'environment' }) => Promise<void>;
}

export interface LiveRemotePublication {
  trackSid: string;
  kind: string;
  source: string;
  isMuted: boolean;
  isSubscribed: boolean;
  track?: LiveTrack;
  setSubscribed(subscribed: boolean): void;
}

export interface LiveRemoteParticipant {
  identity: string;
  metadata?: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  trackPublications: Map<string, LiveRemotePublication>;
}

export interface LiveLocalParticipant {
  identity: string;
  permissions?: { canPublish: boolean };
  publishTrack(track: LiveLocalTrack, options?: Record<string, unknown>): Promise<unknown>;
  unpublishTrack(track: LiveLocalTrack, stopOnUnpublish?: boolean): Promise<unknown>;
  publishData(data: Uint8Array, options?: { reliable?: boolean }): Promise<void>;
}

export interface LiveRoom {
  on(event: string, listener: (...args: never[]) => void): unknown;
  off(event: string, listener: (...args: never[]) => void): unknown;
  connect(url: string, token: string): Promise<void>;
  disconnect(): Promise<void>;
  startAudio(): Promise<void>;
  readonly canPlaybackAudio: boolean;
  readonly metadata?: string;
  readonly localParticipant: LiveLocalParticipant;
  readonly remoteParticipants: Map<string, LiveRemoteParticipant>;
}

/** livekit-client RoomEvent values (checked against the package in session.test.ts). */
export const LIVE_ROOM_EVENTS = {
  Reconnecting: 'reconnecting',
  Reconnected: 'reconnected',
  Disconnected: 'disconnected',
  ParticipantConnected: 'participantConnected',
  ParticipantDisconnected: 'participantDisconnected',
  TrackPublished: 'trackPublished',
  TrackUnpublished: 'trackUnpublished',
  TrackSubscribed: 'trackSubscribed',
  TrackUnsubscribed: 'trackUnsubscribed',
  TrackMuted: 'trackMuted',
  TrackUnmuted: 'trackUnmuted',
  LocalTrackUnpublished: 'localTrackUnpublished',
  ParticipantPermissionsChanged: 'participantPermissionsChanged',
  RoomMetadataChanged: 'roomMetadataChanged',
  DataReceived: 'dataReceived',
  AudioPlaybackStatusChanged: 'audioPlaybackChanged',
} as const;

/** livekit DisconnectReason.DUPLICATE_IDENTITY. */
const DISCONNECT_DUPLICATE_IDENTITY = 2;

export type LiveMediaElements = {
  hostVideo?: HTMLVideoElement | null;
  /** The other caller's camera (split screen for public_video viewers). */
  callerVideo?: HTMLVideoElement | null;
  /** My own camera while I am the caller. */
  selfVideo?: HTMLVideoElement | null;
  /** Remote sound: one <audio> per remote audio track is created inside this element. */
  audio?: HTMLElement | null;
};

export type LiveSessionOptions = {
  roomId: string;
  roomName: string;
  /** The host's identity in the room (= astrologerId). */
  astrologerId: string;
  me: { id: string; name: string };
  countryCode?: string | null;
  api: LiveApi;
  /** A fresh, unconnected room. */
  createRoom: () => Promise<LiveRoom> | LiveRoom;
  /** Camera + microphone tracks for my call (asks the browser; call from a tap). */
  createTracks: (options: { facingMode: 'user' | 'environment' }) => Promise<LiveLocalTrack[]>;
  /** Words for a refused request. */
  describeError?: (error: unknown, fallback: string) => string;
  now?: () => number;
  /** How often to re-read the queue status (the app: 15 s). 0 = never. */
  statusPollMs?: number;
};

const CONNECT_PROBLEM = 'Could not join the live stream. Check your internet connection and try again.';
const MEDIA_PROBLEM =
  'Camera and microphone access are needed for the call. Allow them for this site and tap Join Now again.';
const ACCEPT_PROBLEM = 'Could not join the call.';
const PUBLISH_PROBLEM = 'The call could not start. Tap Rejoin to try again.';
const DEFAULT_POLL_MS = 15_000;
const PERMISSION_WAIT_MS = 5_000;
const KICKED_NOTICE = 'You were removed from this live stream.';
const TURN_EXPIRED_NOTICE = 'Your turn expired. Pay again if you want to rejoin the queue.';

type Role = 'host' | 'viewer' | 'caller' | string;

export class LiveSession {
  private state: LiveState;
  private readonly listeners = new Set<() => void>();
  private readonly opts: LiveSessionOptions & { countryCode?: string | null };
  private readonly now: () => number;

  private room: LiveRoom | null = null;
  private connected = false;
  private ending = false;
  private readonly detachers: Array<() => void> = [];
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private noticeSeq = 0;

  private elements: LiveMediaElements = {};
  private hostVideoTrack: LiveTrack | null = null;
  private callerVideoTrack: LiveTrack | null = null;
  /** Remote audio tracks and the <audio> element each plays in. */
  private readonly audioElements = new Map<LiveTrack, HTMLMediaElement>();
  /** What we asked LiveKit to subscribe, per publication, so the policy only speaks when something changes. */
  private readonly subscribed = new Map<LiveRemotePublication, boolean>();

  private myVideo: LiveLocalTrack | null = null;
  private myAudio: LiveLocalTrack | null = null;
  /** Set while I take my tracks down myself (End Call), so the server's follow-up isn't a second ending. */
  private endingCall = false;
  private callerToken: { callType: LiveCallType; kickAt: string; queueId: string } | null = null;
  private statusInFlight = false;
  /** When a room message last set the call / my queue place: an older status answer can't undo it. */
  private callMessageAt = 0;
  private meMessageAt = 0;

  constructor(opts: LiveSessionOptions) {
    this.opts = { ...opts };
    this.now = opts.now ?? Date.now;
    this.state = {
      phase: 'idle',
      endReason: null,
      error: null,
      host: { present: false, cameraOn: false },
      callerCameraOn: false,
      viewerCount: 0,
      likeCount: 0,
      hasLiked: false,
      audioBlocked: false,
      messages: [],
      gifts: [],
      queue: null,
      me: null,
      call: null,
      resumeNeeded: false,
      micOn: false,
      cameraOn: false,
      facing: 'user',
      reviewFor: null,
      notice: null,
    };
  }

  // ---- For React (useSyncExternalStore) ----

  getState = (): LiveState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** The elements video and sound play into. They should stay mounted; calling again moves the tracks over. */
  setMediaElements(elements: LiveMediaElements): void {
    const previous = this.elements;
    this.elements = { ...previous, ...elements };
    this.moveTrack(this.hostVideoTrack, previous.hostVideo, this.elements.hostVideo);
    this.moveTrack(this.callerVideoTrack, previous.callerVideo, this.elements.callerVideo);
    this.moveTrack(this.myVideo, previous.selfVideo, this.elements.selfVideo);
    if (previous.audio !== this.elements.audio) {
      for (const el of this.audioElements.values()) {
        el.remove();
        this.elements.audio?.appendChild(el);
      }
    }
  }

  // ---- Actions ----

  /** Joins the stream: queue status first (it decides viewer or returning caller), then one connect. */
  async start(): Promise<void> {
    if (this.state.phase !== 'idle') return;
    this.set({ phase: 'loading' });

    let status: LiveQueueStatus;
    const askedAt = this.now();
    try {
      status = await this.opts.api.queueStatus(this.opts.roomId, this.opts.countryCode);
    } catch (error) {
      await this.finishWith(error, CONNECT_PROBLEM);
      return;
    }
    if (this.ending) return;
    this.applyStatus(status, askedAt);

    let token: { token: string; liveKitUrl: string };
    try {
      if (status.userEntry?.status === 'active') {
        const caller = await this.opts.api.resumeCall(this.opts.roomId);
        this.callerToken = caller;
        token = caller;
      } else {
        token = await this.opts.api.viewerToken(this.opts.astrologerId, this.opts.roomName);
      }
    } catch (error) {
      await this.finishWith(error, CONNECT_PROBLEM);
      return;
    }
    if (this.ending) return;

    this.set({ phase: 'connecting' });
    try {
      const room = await this.opts.createRoom();
      if (this.ending) return;
      this.room = room;
      this.listen(room);
      await room.connect(token.liveKitUrl, token.token);
      this.connected = true;
    } catch {
      await this.finish('failed', CONNECT_PROBLEM);
      return;
    }
    if (this.ending) return;

    this.applyHistory(this.room.metadata);
    this.syncParticipants();
    this.applyPolicy();
    this.set({
      phase: 'watching',
      audioBlocked: !this.room.canPlaybackAudio,
      resumeNeeded: this.callerToken !== null,
    });
    if (this.callerToken) {
      const c = this.callerToken;
      this.set({
        me: { status: 'active', position: null, callType: c.callType, queueId: c.queueId, turnExpiresAt: null },
        call: { mode: c.callType, callerId: this.opts.me.id, callerName: this.opts.me.name, kickAt: ms(c.kickAt) },
      });
    }
    this.startPolling();
    void this.opts.api
      .likeStatus(this.opts.roomId)
      .then(r => !this.ending && this.set({ likeCount: r.likeCount, hasLiked: r.hasLiked }))
      .catch(() => undefined);
  }

  /** The buyer's country arrived (or changed): the next status poll prices the call slot for it. */
  setCountry(countryCode: string | null | undefined): void {
    const next = countryCode ?? null;
    if ((this.opts.countryCode ?? null) === next) return;
    this.opts.countryCode = next;
    if (this.live()) void this.refreshStatus();
  }

  /** Lets sound play. Call from a tap when `audioBlocked`. */
  async startAudio(): Promise<void> {
    if (!this.room) return;
    await this.room.startAudio().catch(() => undefined);
    this.set({ audioBlocked: !this.room.canPlaybackAudio });
  }

  async like(): Promise<void> {
    if (this.state.hasLiked || !this.live()) return;
    this.set({ hasLiked: true, likeCount: this.state.likeCount + 1 });
    try {
      const r = await this.opts.api.like(this.opts.roomId);
      this.set({ likeCount: r.likeCount, hasLiked: r.hasLiked });
    } catch {
      this.set({ hasLiked: false, likeCount: Math.max(0, this.state.likeCount - 1) });
    }
  }

  /** Publishes a chat line to the room (the app's shape); shown at once on our side. */
  sendChat(rawText: string): boolean {
    const text = sanitizeChatText(rawText);
    if (!text || !this.room || !this.live()) return false;
    const message: LiveChatMessage = {
      type: 'chat:message',
      messageId: newChatMessageId(this.opts.me.id, this.now()),
      senderId: this.opts.me.id,
      senderName: this.opts.me.name.trim() || 'Viewer',
      text,
      sentAt: new Date(this.now()).toISOString(),
    };
    this.addMessage(message);
    void this.room.localParticipant.publishData(encodeLiveMessage(message), { reliable: true }).catch(() => undefined);
    return true;
  }

  /** Re-reads the queue status now (after a payment, a data message...). */
  async refreshStatus(): Promise<void> {
    if (!this.live() || this.statusInFlight) return;
    this.statusInFlight = true;
    const askedAt = this.now();
    try {
      const status = await this.opts.api.queueStatus(this.opts.roomId, this.opts.countryCode);
      if (!this.ending) this.applyStatus(status, askedAt);
    } catch (error) {
      if (!this.ending && classifyLiveError(error) === 'not-live') await this.finish('room-ended', null);
    } finally {
      this.statusInFlight = false;
    }
  }

  /**
   * Join Now (my turn). Order matters for the host (see the file comment): camera + mic first, then accept, then
   * publish on this same connection. A blocked camera never takes the slot.
   */
  async acceptTurn(): Promise<void> {
    if (this.state.me?.status !== 'called' || !this.room || !this.live()) return;
    this.set({ phase: 'joining-call', error: null });

    const tracks = await this.prepareTracks();
    if (!tracks) return;

    let caller: { callType: LiveCallType; kickAt: string; queueId: string };
    try {
      caller = await this.opts.api.acceptTurn(this.opts.roomId);
    } catch (error) {
      this.stopMyTracks();
      if (this.ending) return;
      this.set({ phase: 'watching', error: this.describe(error, ACCEPT_PROBLEM) });
      void this.refreshStatus();
      return;
    }
    if (this.ending) return this.stopMyTracks();
    this.callerToken = caller;
    this.set({
      me: { status: 'active', position: null, callType: caller.callType, queueId: caller.queueId, turnExpiresAt: null },
      call: { mode: caller.callType, callerId: this.opts.me.id, callerName: this.opts.me.name, kickAt: ms(caller.kickAt) },
    });
    await this.publishMyTracks();
  }

  /** My slot is active but I'm not publishing (page reloaded, or publishing failed): try again from a tap. */
  async resumeCall(): Promise<void> {
    if (this.state.me?.status !== 'active' || !this.room || !this.live() || this.myVideo) return;
    this.set({ phase: 'joining-call', error: null, resumeNeeded: false });
    const tracks = await this.prepareTracks();
    if (!tracks) return;
    await this.publishMyTracks();
  }

  async toggleMic(): Promise<void> {
    const track = this.myAudio;
    if (!track || this.state.phase !== 'in-call') return;
    const next = !this.state.micOn;
    try {
      await (next ? track.unmute() : track.mute());
      this.set({ micOn: next });
    } catch {
      // Keep what we had.
    }
  }

  async toggleCamera(): Promise<void> {
    const track = this.myVideo;
    if (!track || this.state.phase !== 'in-call') return;
    const next = !this.state.cameraOn;
    try {
      await (next ? track.unmute() : track.mute());
      this.set({ cameraOn: next });
    } catch {
      // Keep what we had.
    }
  }

  /** Front/back camera on phones: the same track restarts, nothing is republished. */
  async flipCamera(): Promise<void> {
    const track = this.myVideo;
    if (!track?.restartTrack || this.state.phase !== 'in-call') return;
    const facing = this.state.facing === 'user' ? 'environment' : 'user';
    try {
      await track.restartTrack({ facingMode: facing });
      this.set({ facing });
    } catch {
      // One camera, or the other one is busy.
    }
  }

  /** End my call early: my tracks come down first (clean for the host), then the server is told. */
  async endCall(): Promise<void> {
    if (this.state.phase !== 'in-call' || this.endingCall) return;
    this.endingCall = true;
    const queueId = this.state.me?.queueId ?? null;
    try {
      await this.unpublishMyTracks();
      this.backToWatching(queueId);
      await this.opts.api.completeCall(this.opts.roomId);
    } catch (error) {
      if (!this.ending) this.set({ error: this.describe(error, 'Could not end the call.') });
    } finally {
      this.endingCall = false;
    }
    void this.refreshStatus();
  }

  clearReview(): void {
    this.set({ reviewFor: null });
  }

  clearNotice(): void {
    this.set({ notice: null });
  }

  clearError(): void {
    this.set({ error: null });
  }

  /** Leave the stream. Safe to call more than once and from anywhere (button, page leaving, unmount). */
  end(): Promise<void> {
    return this.finish('left', null);
  }

  // ---- Inside: my call ----

  private async prepareTracks(): Promise<LiveLocalTrack[] | null> {
    let tracks: LiveLocalTrack[];
    try {
      tracks = await this.opts.createTracks({ facingMode: this.state.facing });
    } catch {
      if (!this.ending) this.set({ phase: 'watching', error: MEDIA_PROBLEM, resumeNeeded: this.state.me?.status === 'active' });
      return null;
    }
    if (this.ending) {
      for (const t of tracks) t.stop();
      return null;
    }
    this.myVideo = tracks.find(t => t.kind === 'video') ?? null;
    this.myAudio = tracks.find(t => t.kind === 'audio') ?? null;
    if (!this.myVideo || !this.myAudio) {
      this.stopMyTracks();
      this.set({ phase: 'watching', error: MEDIA_PROBLEM, resumeNeeded: this.state.me?.status === 'active' });
      return null;
    }
    return tracks;
  }

  /** Waits for the server's permission upgrade, then publishes camera and mic on this connection. */
  private async publishMyTracks(): Promise<void> {
    const room = this.room;
    if (!room) return this.stopMyTracks();
    let allowed = await this.waitForPublishPermission();
    if (!allowed && !this.ending) {
      // The permission message was missed: queue/resume makes the server apply it again.
      await this.opts.api.resumeCall(this.opts.roomId).catch(() => undefined);
      allowed = await this.waitForPublishPermission();
    }
    if (this.ending) return this.stopMyTracks();
    if (!allowed) {
      this.stopMyTracks();
      this.set({ phase: 'watching', error: PUBLISH_PROBLEM, resumeNeeded: true });
      return;
    }
    try {
      await room.localParticipant.publishTrack(this.myVideo!);
      await room.localParticipant.publishTrack(this.myAudio!);
    } catch {
      await this.unpublishMyTracks().catch(() => undefined);
      if (!this.ending) this.set({ phase: 'watching', error: PUBLISH_PROBLEM, resumeNeeded: true });
      return;
    }
    if (this.ending) return;
    const selfVideo = this.elements.selfVideo;
    if (selfVideo && this.myVideo) this.myVideo.attach(selfVideo);
    this.set({ phase: 'in-call', micOn: true, cameraOn: true, resumeNeeded: false, error: null });
    this.applyPolicy();
  }

  private waitForPublishPermission(): Promise<boolean> {
    const room = this.room;
    if (!room) return Promise.resolve(false);
    if (room.localParticipant.permissions?.canPublish) return Promise.resolve(true);
    return new Promise<boolean>(resolve => {
      const done = (ok: boolean) => {
        clearTimeout(timer);
        room.off(LIVE_ROOM_EVENTS.ParticipantPermissionsChanged, onChange);
        resolve(ok);
      };
      const onChange = () => {
        if (room.localParticipant.permissions?.canPublish) done(true);
      };
      const timer = setTimeout(() => done(!!room.localParticipant.permissions?.canPublish), PERMISSION_WAIT_MS);
      room.on(LIVE_ROOM_EVENTS.ParticipantPermissionsChanged, onChange);
    });
  }

  private async unpublishMyTracks(): Promise<void> {
    const room = this.room;
    const video = this.myVideo;
    const audio = this.myAudio;
    this.myVideo = null;
    this.myAudio = null;
    const selfVideo = this.elements.selfVideo;
    if (video && selfVideo) video.detach(selfVideo);
    if (room) {
      if (video) await room.localParticipant.unpublishTrack(video, true).catch(() => undefined);
      if (audio) await room.localParticipant.unpublishTrack(audio, true).catch(() => undefined);
    }
    video?.stop();
    audio?.stop();
  }

  private stopMyTracks(): void {
    const selfVideo = this.elements.selfVideo;
    if (this.myVideo && selfVideo) this.myVideo.detach(selfVideo);
    this.myVideo?.stop();
    this.myAudio?.stop();
    this.myVideo = null;
    this.myAudio = null;
  }

  /** My call is over (I ended it, the host did, or the 10 minutes passed): keep watching, ask for the review. */
  private backToWatching(queueId: string | null): void {
    this.callerToken = null;
    this.set({
      phase: this.state.phase === 'reconnecting' ? 'reconnecting' : 'watching',
      me: null,
      call: null,
      micOn: false,
      cameraOn: false,
      resumeNeeded: false,
      reviewFor: queueId ?? this.state.reviewFor,
    });
    this.applyPolicy();
  }

  /** The server took my call down (kick timer, host, permission revoked) while I was still publishing. */
  private async callEndedByServer(): Promise<void> {
    if (this.endingCall || this.state.phase !== 'in-call') return;
    this.endingCall = true;
    const queueId = this.state.me?.queueId ?? null;
    try {
      await this.unpublishMyTracks();
    } finally {
      this.endingCall = false;
    }
    if (!this.ending) this.backToWatching(queueId);
  }

  // ---- Inside: the room ----

  private live(): boolean {
    const p = this.state.phase;
    return p === 'watching' || p === 'joining-call' || p === 'in-call' || p === 'reconnecting';
  }

  private amCaller(): boolean {
    return this.state.me?.status === 'active';
  }

  private listen(room: LiveRoom): void {
    const on = (event: string, listener: (...args: never[]) => void) => {
      room.on(event, listener);
      this.detachers.push(() => room.off(event, listener));
    };
    const guard = (fn: (...args: never[]) => void) =>
      ((...args: never[]) => {
        if (!this.ending) fn(...args);
      }) as (...args: never[]) => void;

    on(LIVE_ROOM_EVENTS.ParticipantConnected, guard(() => this.syncParticipants()));
    on(LIVE_ROOM_EVENTS.ParticipantDisconnected, guard(() => this.syncParticipants()));
    on(
      LIVE_ROOM_EVENTS.TrackPublished,
      guard(() => {
        this.applyPolicy();
        this.syncParticipants();
      }),
    );
    on(LIVE_ROOM_EVENTS.TrackUnpublished, guard(() => this.syncParticipants()));
    on(
      LIVE_ROOM_EVENTS.TrackSubscribed,
      guard(((track: LiveTrack, _publication: LiveRemotePublication, participant: LiveRemoteParticipant) => {
        this.onTrackSubscribed(track, participant);
        this.syncParticipants();
      }) as (...args: never[]) => void),
    );
    on(
      LIVE_ROOM_EVENTS.TrackUnsubscribed,
      guard(((track: LiveTrack) => {
        this.onTrackUnsubscribed(track);
        this.syncParticipants();
      }) as (...args: never[]) => void),
    );
    on(LIVE_ROOM_EVENTS.TrackMuted, guard(() => this.syncParticipants()));
    on(LIVE_ROOM_EVENTS.TrackUnmuted, guard(() => this.syncParticipants()));

    on(
      LIVE_ROOM_EVENTS.LocalTrackUnpublished,
      guard(((publication: { track?: LiveTrack }) => {
        // The server unpublished my track (permission revoked at the end of the slot) while I was still in the call.
        if (publication.track && (publication.track === this.myVideo || publication.track === this.myAudio))
          void this.callEndedByServer();
      }) as (...args: never[]) => void),
    );
    on(
      LIVE_ROOM_EVENTS.ParticipantPermissionsChanged,
      guard(((_prev: unknown, participant: { identity: string }) => {
        if (
          participant.identity === room.localParticipant.identity &&
          room.localParticipant.permissions?.canPublish === false
        )
          void this.callEndedByServer();
      }) as (...args: never[]) => void),
    );

    on(LIVE_ROOM_EVENTS.RoomMetadataChanged, guard(((metadata: string) => this.applyHistory(metadata)) as (...args: never[]) => void));
    on(
      LIVE_ROOM_EVENTS.DataReceived,
      guard(((payload: Uint8Array) => {
        const message = decodeLiveMessage(payload);
        if (message) void this.onMessage(message);
      }) as (...args: never[]) => void),
    );

    on(
      LIVE_ROOM_EVENTS.Reconnecting,
      guard(() => {
        if (this.state.phase === 'watching' || this.state.phase === 'in-call') this.set({ phase: 'reconnecting' });
      }),
    );
    on(
      LIVE_ROOM_EVENTS.Reconnected,
      guard(() => {
        if (this.state.phase === 'reconnecting') this.set({ phase: this.myVideo ? 'in-call' : 'watching' });
        this.syncParticipants();
        this.applyPolicy();
        void this.refreshStatus();
      }),
    );
    on(LIVE_ROOM_EVENTS.Disconnected, ((reason?: number) => {
      if (this.ending || !this.connected) return;
      void this.finish(reason === DISCONNECT_DUPLICATE_IDENTITY ? 'other-device' : 'connection-lost', null);
    }) as (...args: never[]) => void);
    on(LIVE_ROOM_EVENTS.AudioPlaybackStatusChanged, guard(() => this.set({ audioBlocked: !room.canPlaybackAudio })));
  }

  private async onMessage(message: LiveDataMessage): Promise<void> {
    const myId = this.opts.me.id;
    switch (message.type) {
      case 'chat:message':
        this.addMessage(message);
        return;
      case 'gift:sent':
        this.set({ gifts: mergeGifts(this.state.gifts, [giftFromMessage(message)]) });
        return;
      case 'react:sync':
        this.set({ likeCount: message.likeCount });
        return;
      case 'queue:update': {
        const position = message.positions[myId];
        if (position != null && this.state.me?.status === 'waiting') this.set({ me: { ...this.state.me, position } });
        if (this.state.queue) this.set({ queue: { ...this.state.queue, waitingCount: message.waitingCount } });
        void this.refreshStatus();
        return;
      }
      case 'queue:open-changed':
        if (this.state.queue)
          this.set({
            queue: {
              ...this.state.queue,
              isQueueOpen: message.isQueueOpen,
              canPay: message.isQueueOpen && !this.state.queue.isFull && !this.state.me,
            },
          });
        return;
      case 'queue:your-turn-prompt':
        this.meMessageAt = this.now();
        this.set({
          me: {
            status: 'called',
            position: 1,
            callType: message.callType,
            queueId: message.queueId,
            turnExpiresAt: ms(message.expiresAt),
          },
        });
        return;
      case 'queue:accepted':
        // We accept through the API and keep this connection; the token here is for the app's reconnect. Nothing to do.
        return;
      case 'call-mode:active':
        if (message.callerId === myId && !this.amCaller()) return; // my own accept on another device: status will say
        this.callMessageAt = this.now();
        if (message.callerId !== myId)
          this.set({
            call: {
              mode: message.callType,
              callerId: message.callerId,
              callerName: message.callerName ?? null,
              kickAt: ms(message.kickAt),
            },
          });
        this.applyPolicy();
        this.syncParticipants();
        return;
      case 'call-mode:cleared':
        this.callMessageAt = this.now();
        if (this.amCaller()) {
          if (this.state.phase === 'in-call') await this.callEndedByServer();
          else this.backToWatching(this.state.me?.queueId ?? null);
        } else {
          this.set({ call: null, callerCameraOn: false });
          this.applyPolicy();
        }
        void this.refreshStatus();
        return;
      case 'queue:no-show':
        if (message.userId === myId) {
          this.meMessageAt = this.now();
          this.set({ me: null, notice: this.notice(TURN_EXPIRED_NOTICE) });
          void this.refreshStatus();
        }
        return;
      case 'participant:kicked':
        await this.finish('kicked', null);
        return;
      case 'room:ended':
        await this.finish('room-ended', null);
        return;
    }
  }

  /** `askedAt`: when the request left, so an answer older than the latest room message doesn't undo it. */
  private applyStatus(status: LiveQueueStatus, askedAt: number): void {
    const entry = status.userEntry;
    const me: LiveMyQueue | null =
      entry && (entry.status === 'waiting' || entry.status === 'called' || entry.status === 'active')
        ? {
            status: entry.status,
            position: entry.status === 'waiting' ? entry.position : entry.status === 'called' ? 1 : null,
            callType: entry.callType,
            queueId: entry.queueId,
            turnExpiresAt: entry.status === 'called' && entry.turnExpiresAt ? ms(entry.turnExpiresAt) : null,
          }
        : null;
    const queue: LiveQueueInfo = {
      waitingCount: status.waitingCount,
      maxWaiting: status.maxWaiting,
      isFull: status.isFull,
      isQueueOpen: status.isQueueOpen,
      canPay: status.canPay,
      price: status.callSlotPrice ?? null,
    };
    const active = status.activeCaller;
    let call: LiveActiveCall | null = null;
    if (active) {
      call = {
        mode: active.callType,
        callerId: active.userId,
        callerName: active.callerName ?? (active.userId === this.opts.me.id ? this.opts.me.name : null),
        kickAt: active.kickAt ? ms(active.kickAt) : null,
      };
    }
    // While I'm publishing, my own slot is the truth until the room says it ended (a stale poll must not cut it).
    const inMyCall = this.state.phase === 'in-call' || this.state.phase === 'joining-call' || this.endingCall;
    this.set({
      queue,
      ...(inMyCall || askedAt < this.meMessageAt ? {} : { me }),
      ...(inMyCall || askedAt < this.callMessageAt ? {} : { call }),
    });
    if (!inMyCall && this.state.phase === 'watching' && me?.status === 'active' && !this.myVideo)
      this.set({ resumeNeeded: true });
    this.applyPolicy();
    this.syncParticipants();
  }

  private applyHistory(metadata: string | null | undefined): void {
    const history = parseRoomHistory(metadata);
    if (history.messages.length)
      this.set({ messages: dedupeMessages([...history.messages, ...this.state.messages]) });
    if (history.gifts.length) this.set({ gifts: mergeGifts(this.state.gifts, history.gifts) });
  }

  private addMessage(message: LiveChatMessage): void {
    if (this.state.messages.some(m => m.messageId === message.messageId)) return;
    this.set({ messages: dedupeMessages([...this.state.messages, message]) });
  }

  private roleOf(participant: LiveRemoteParticipant): Role {
    if (participant.identity === this.opts.astrologerId) return 'host';
    try {
      const meta = JSON.parse(participant.metadata ?? '{}') as { role?: string };
      return meta.role ?? 'viewer';
    } catch {
      return 'viewer';
    }
  }

  /** Who is here and what the host/caller cameras are doing, from the room. */
  private syncParticipants(): void {
    const room = this.room;
    if (!room) return;
    let host: LiveRemoteParticipant | undefined;
    let viewers = 1; // me
    const callerId = this.state.call && this.state.call.callerId !== this.opts.me.id ? this.state.call.callerId : null;
    let caller: LiveRemoteParticipant | undefined;
    for (const p of room.remoteParticipants.values()) {
      if (p.identity === this.opts.astrologerId) host = p;
      else if (this.roleOf(p) === 'viewer') viewers += 1;
      if (callerId && p.identity === callerId) caller = p;
    }
    this.set({
      host: { present: !!host, cameraOn: !!host?.isCameraEnabled && !!this.hostVideoTrack },
      callerCameraOn: !!caller?.isCameraEnabled && !!this.callerVideoTrack,
      viewerCount: viewers,
    });
  }

  /**
   * The app's subscribe policy (03-call-modes-and-av.md), subscribe-side only: the host's video always; the caller's
   * video only in public_video (or when I am the host's counterpart); in private_audio nobody but the caller hears
   * the call. Nothing from anyone else. Each publication is told once per change.
   */
  private applyPolicy(): void {
    const room = this.room;
    if (!room) return;
    const mode = this.state.call?.mode ?? null;
    const callerId = this.state.call?.callerId ?? null;
    const amCaller = this.amCaller();
    for (const p of room.remoteParticipants.values()) {
      const isHost = p.identity === this.opts.astrologerId;
      const isCaller = !!callerId && p.identity === callerId && !isHost;
      for (const pub of p.trackPublications.values()) {
        let want: boolean;
        if (isHost) {
          want = pub.kind === 'video' || amCaller || mode !== 'private_audio';
        } else if (isCaller) {
          if (amCaller) want = false; // someone else is listed as caller while I am: stale; wait for the room
          else if (pub.kind === 'video') want = mode === 'public_video';
          else want = mode !== 'private_audio';
        } else {
          want = false;
        }
        if (this.subscribed.get(pub) === want) continue;
        this.subscribed.set(pub, want);
        if (pub.isSubscribed !== want) {
          try {
            pub.setSubscribed(want);
          } catch {
            // Nothing to do; the next event re-applies.
          }
        }
      }
    }
  }

  private onTrackSubscribed(track: LiveTrack, participant: LiveRemoteParticipant): void {
    const isHost = participant.identity === this.opts.astrologerId;
    if (track.kind === 'video') {
      if (isHost) this.swapTrack('host', track);
      else this.swapTrack('caller', track);
    } else if (track.kind === 'audio') {
      if (this.audioElements.has(track)) return;
      const el = track.attach();
      this.audioElements.set(track, el);
      this.elements.audio?.appendChild(el);
    }
  }

  private onTrackUnsubscribed(track: LiveTrack): void {
    if (track === this.hostVideoTrack) this.swapTrack('host', null);
    if (track === this.callerVideoTrack) this.swapTrack('caller', null);
    const el = this.audioElements.get(track);
    if (el) {
      track.detach(el);
      el.remove();
      this.audioElements.delete(track);
    }
  }

  private swapTrack(slot: 'host' | 'caller', track: LiveTrack | null): void {
    const element = slot === 'host' ? this.elements.hostVideo : this.elements.callerVideo;
    const current = slot === 'host' ? this.hostVideoTrack : this.callerVideoTrack;
    if (current === track) return;
    if (current && element) current.detach(element);
    if (track && element) track.attach(element);
    if (slot === 'host') this.hostVideoTrack = track;
    else this.callerVideoTrack = track;
  }

  private moveTrack(
    track: LiveTrack | null,
    from: HTMLMediaElement | null | undefined,
    to: HTMLMediaElement | null | undefined,
  ): void {
    if (!track || from === to) return;
    if (from) track.detach(from);
    if (to) track.attach(to);
  }

  private startPolling(): void {
    const every = this.opts.statusPollMs ?? DEFAULT_POLL_MS;
    if (every <= 0) return;
    this.pollTimer = setInterval(() => void this.refreshStatus(), every);
  }

  private notice(text: string): LiveNotice {
    this.noticeSeq += 1;
    return { id: this.noticeSeq, text };
  }

  private describe(error: unknown, fallback: string): string {
    return this.opts.describeError?.(error, fallback) ?? fallback;
  }

  private finishWith(error: unknown, fallback: string): Promise<void> {
    const kind = classifyLiveError(error);
    if (kind === 'kicked') return this.finish('kicked', null);
    if (kind === 'not-live') return this.finish('not-live', null);
    return this.finish('failed', this.describe(error, fallback));
  }

  private async finish(reason: LiveEndReason, error: string | null): Promise<void> {
    if (this.ending) return;
    this.ending = true;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;

    const wasInCall = this.state.phase === 'in-call';
    const queueId = this.state.me?.queueId ?? null;
    // My tracks first, so the host sees a clean unpublish before the participant goes.
    await this.unpublishMyTracks().catch(() => undefined);
    this.swapTrack('host', null);
    this.swapTrack('caller', null);
    for (const [track, el] of this.audioElements) {
      track.detach(el);
      el.remove();
    }
    this.audioElements.clear();
    this.set({
      phase: 'ended',
      endReason: reason,
      error,
      micOn: false,
      cameraOn: false,
      resumeNeeded: false,
      host: { present: false, cameraOn: false },
      callerCameraOn: false,
      ...(reason === 'kicked' ? { notice: this.notice(KICKED_NOTICE), me: null, call: null } : {}),
      // Leaving mid-call keeps the slot on the server (the app does the same); the review waits for a real end.
      ...(wasInCall && (reason === 'room-ended' || reason === 'kicked') ? { reviewFor: queueId } : {}),
    });

    const room = this.room;
    this.room = null;
    if (room) {
      await room.disconnect().catch(() => undefined);
      for (const detach of this.detachers.splice(0)) detach();
    }
  }

  /** Object fields (host, queue, me, call...) count as changed only when a value inside changed. */
  private set(patch: Partial<LiveState>): void {
    let next: LiveState | null = null;
    for (const key of Object.keys(patch) as Array<keyof LiveState>) {
      if (sameValue(this.state[key], patch[key])) continue;
      next ??= { ...this.state };
      (next as Record<string, unknown>)[key] = patch[key];
    }
    if (!next) return;
    this.state = next;
    for (const listener of this.listeners) listener();
  }
}

function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  return ka.every(k => Object.is(ra[k], rb[k]) || (ra[k] !== null && typeof ra[k] === 'object' && sameValue(ra[k], rb[k])));
}

function ms(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}
