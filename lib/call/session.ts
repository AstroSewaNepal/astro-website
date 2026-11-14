// One consultation call (voice or video) between the web and the app, on LiveKit.
//
// Built on purpose NOT like the app's wiring (ap src/components/VideoCall): there a <LiveKitRoom> keyed by room,
// a dozen effects copying state into MMKV/contexts and video views remounted per stream grew around a native
// crash. Here one plain object owns the Room from start to end; React only reads its state (getState/subscribe)
// and hands it video/audio elements ONCE. Tracks are attached to and detached from those same elements, never by
// mounting new ones. Only the protocol is the app's, so both sides meet in the same room:
// - POST /video-call/consultation/token { connectionScheduleId, callType } -> { token, roomName, liveKitUrl };
//   getting the token rings the other person (push) and posts the chat's call message (backend #304).
// - The call ends when the booking's time is up, or when the other person leaves (the app does the same).
// - After leaving: POST /video-call/consultation/left, so the chat's call message shows ended or missed.
// - A voice call becomes video when someone turns a camera on (the app offers "turn on video?").

export type CallType = 'audio' | 'video';

export type CallPhase =
  | 'idle'
  /** Getting the token and joining the room. */
  | 'connecting'
  /** In the room, the other person hasn't joined (yet). */
  | 'waiting'
  | 'in-call'
  /** The network dropped; LiveKit is getting the call back. */
  | 'reconnecting'
  | 'ended';

export type CallEndReason =
  | 'hangup'
  | 'time-up'
  | 'other-left'
  | 'connection-lost'
  /** The same account joined this call somewhere else (app or another tab), so LiveKit moved the call there. */
  | 'other-device'
  | 'failed';

export type CallState = {
  phase: CallPhase;
  endReason: CallEndReason | null;
  /** Why it failed, in words for the person. */
  error: string | null;
  /** A video call, or a voice call someone turned a camera on in. */
  video: boolean;
  micOn: boolean;
  cameraOn: boolean;
  facing: 'user' | 'environment';
  /** The camera could not be started (blocked, missing, busy); the call goes on as voice. */
  cameraProblem: string | null;
  other: { present: boolean; micOn: boolean; cameraOn: boolean };
  /** The other person turned their camera on during a voice call (offer to turn ours on, like the app). */
  otherStartedVideo: boolean;
  /** The browser blocks the other person's sound until a tap (iOS Safari): call startAudio() from a tap. */
  audioBlocked: boolean;
  /** Booking end: the call ends here. */
  endsAt: number;
  /** When the other person first joined (talk time). */
  connectedAt: number | null;
};

// ---- The slice of livekit-client's Room this uses (lib/call/livekit-room.ts adapts the real one). ----

export interface CallTrack {
  kind: string;
  attach(element: HTMLMediaElement): HTMLMediaElement;
  detach(element?: HTMLMediaElement): unknown;
  restartTrack?: (options: { facingMode: 'user' | 'environment' }) => Promise<void>;
}

export interface CallPublication {
  kind: string;
  source: string;
  isMuted: boolean;
  track?: CallTrack;
}

export interface CallParticipant {
  identity: string;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
}

export interface CallLocalParticipant extends CallParticipant {
  setMicrophoneEnabled(enabled: boolean): Promise<unknown>;
  setCameraEnabled(
    enabled: boolean,
    options?: { facingMode: 'user' | 'environment' },
  ): Promise<CallPublication | undefined>;
}

export interface CallRoom {
  on(event: string, listener: (...args: never[]) => void): unknown;
  off(event: string, listener: (...args: never[]) => void): unknown;
  connect(url: string, token: string): Promise<void>;
  disconnect(): Promise<void>;
  startAudio(): Promise<void>;
  readonly canPlaybackAudio: boolean;
  readonly localParticipant: CallLocalParticipant;
  readonly remoteParticipants: Map<string, CallParticipant>;
}

/** livekit-client RoomEvent values (checked against the package in session.test.ts). */
export const ROOM_EVENTS = {
  Reconnecting: 'reconnecting',
  Reconnected: 'reconnected',
  Disconnected: 'disconnected',
  ParticipantConnected: 'participantConnected',
  ParticipantDisconnected: 'participantDisconnected',
  TrackSubscribed: 'trackSubscribed',
  TrackUnsubscribed: 'trackUnsubscribed',
  TrackMuted: 'trackMuted',
  TrackUnmuted: 'trackUnmuted',
  LocalTrackUnpublished: 'localTrackUnpublished',
  AudioPlaybackStatusChanged: 'audioPlaybackChanged',
} as const;

/** livekit DisconnectReason.DUPLICATE_IDENTITY: this account joined the room from somewhere else. */
const DISCONNECT_DUPLICATE_IDENTITY = 2;

export type CallApi = {
  mintToken(
    bookingId: string,
    callType: CallType,
  ): Promise<{ token: string; roomName: string; liveKitUrl: string }>;
  /** `keepalive` when the page is closing, so the request outlives it. */
  reportLeft(bookingId: string, options?: { keepalive?: boolean }): Promise<unknown>;
};

export type CallMediaElements = {
  remoteVideo?: HTMLVideoElement | null;
  localVideo?: HTMLVideoElement | null;
  remoteAudio?: HTMLAudioElement | null;
};

export type CallSessionOptions = {
  bookingId: string;
  callType: CallType;
  /** Booking end (ms): the call ends then. */
  endsAt: number;
  api: CallApi;
  /** Makes a fresh, unconnected room (lib/call/livekit-room.ts). */
  createRoom: () => Promise<CallRoom> | CallRoom;
  /** Words for a failed token request (e.g. a BackendError's message). */
  describeError?: (error: unknown) => string;
  now?: () => number;
};

/** setTimeout's ceiling (about 24.8 days). */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const MIC_PROBLEM =
  'The microphone could not be started. Allow microphone access for this site and try again.';
const CAMERA_PROBLEM =
  'The camera could not be started, so this call continues as voice. Check camera access for this site.';
const CONNECT_PROBLEM = 'Could not join the call. Check your internet connection and try again.';

export class CallSession {
  private state: CallState;
  private readonly listeners = new Set<() => void>();
  private readonly opts: CallSessionOptions;
  private readonly now: () => number;

  private room: CallRoom | null = null;
  /** A token was issued: the other person was rung and the chat shows a call message, so leaving must be reported. */
  private minted = false;
  /** The leave was already reported (leavePage sends it before disconnecting). */
  private leftReported = false;
  /** room.connect() succeeded. A failing connect also fires Disconnected; that one is a failed join, not a drop. */
  private connected = false;
  private endTimer: ReturnType<typeof setTimeout> | null = null;
  private ending = false;
  private readonly detachers: Array<() => void> = [];

  private elements: CallMediaElements = {};
  private remoteVideoTrack: CallTrack | null = null;
  private remoteAudioTrack: CallTrack | null = null;
  private localVideoTrack: CallTrack | null = null;

  constructor(opts: CallSessionOptions) {
    this.opts = opts;
    this.now = opts.now ?? Date.now;
    this.state = {
      phase: 'idle',
      endReason: null,
      error: null,
      video: opts.callType === 'video',
      micOn: false,
      cameraOn: false,
      facing: 'user',
      cameraProblem: null,
      other: { present: false, micOn: false, cameraOn: false },
      otherStartedVideo: false,
      audioBlocked: false,
      endsAt: opts.endsAt,
      connectedAt: null,
    };
  }

  // ---- For React (useSyncExternalStore) ----

  getState = (): CallState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * The elements the call plays into. They should stay mounted for the whole call; calling this again with new
   * elements moves the tracks over.
   */
  setMediaElements(elements: CallMediaElements): void {
    const previous = this.elements;
    this.elements = { ...previous, ...elements };
    this.moveTrack(this.remoteVideoTrack, previous.remoteVideo, this.elements.remoteVideo);
    this.moveTrack(this.remoteAudioTrack, previous.remoteAudio, this.elements.remoteAudio);
    this.moveTrack(this.localVideoTrack, previous.localVideo, this.elements.localVideo);
  }

  // ---- Actions ----

  /**
   * Joins the call. Call it from a tap: browsers (iOS Safari) only allow sound and camera after one. `mic` and
   * `camera` are the before-call choices (camera only applies to video calls).
   */
  async start(choices: { mic?: boolean; camera?: boolean } = {}): Promise<void> {
    if (this.state.phase !== 'idle') return;
    this.set({ phase: 'connecting' });

    let details: { token: string; liveKitUrl: string };
    try {
      details = await this.opts.api.mintToken(this.opts.bookingId, this.opts.callType);
      this.minted = true;
    } catch (error) {
      await this.finish('failed', this.opts.describeError?.(error) ?? CONNECT_PROBLEM);
      return;
    }
    if (this.ending) {
      // Hung up while the token was on its way: the other side was still rung and the chat got a call message.
      await this.opts.api.reportLeft(this.opts.bookingId).catch(() => undefined);
      return;
    }

    try {
      const room = await this.opts.createRoom();
      if (this.ending) return;
      this.room = room;
      this.listen(room);
      await room.connect(details.liveKitUrl, details.token);
      this.connected = true;
    } catch {
      await this.finish('failed', CONNECT_PROBLEM);
      return;
    }
    if (this.ending) return;

    this.armEndTimer();
    this.syncOther();
    this.set({
      phase: this.state.other.present ? 'in-call' : 'waiting',
      connectedAt: this.state.other.present ? this.now() : null,
      audioBlocked: !this.room.canPlaybackAudio,
    });

    if (choices.mic !== false) {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        this.set({ micOn: true });
      } catch {
        await this.finish('failed', MIC_PROBLEM);
        return;
      }
    }
    if (this.opts.callType === 'video' && choices.camera !== false) await this.turnCameraOn();
  }

  async toggleMic(): Promise<void> {
    if (!this.room || !this.live()) return;
    const next = !this.state.micOn;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(next);
      this.set({ micOn: next });
    } catch {
      if (next) this.set({ error: MIC_PROBLEM });
    }
  }

  /** Camera on/off. Turning it on in a voice call makes it a video call (the app's upgrade). */
  async toggleCamera(): Promise<void> {
    if (!this.room || !this.live()) return;
    if (this.state.cameraOn) {
      await this.room.localParticipant.setCameraEnabled(false).catch(() => undefined);
      this.setLocalVideo(null);
      this.set({ cameraOn: false });
      return;
    }
    await this.turnCameraOn();
  }

  /** Front/back camera on phones. */
  async flipCamera(): Promise<void> {
    const track = this.localVideoTrack;
    if (!track?.restartTrack || !this.state.cameraOn) return;
    const facing = this.state.facing === 'user' ? 'environment' : 'user';
    try {
      await track.restartTrack({ facingMode: facing });
      this.set({ facing });
    } catch {
      // This device has one camera, or the other one is busy: keep the current one.
    }
  }

  /** The other person turned video on in a voice call: we were asked and said no (or yes, via toggleCamera). */
  dismissVideoOffer(): void {
    this.set({ otherStartedVideo: false });
  }

  /** Lets the other person's sound play. Call from a tap when `audioBlocked`. */
  async startAudio(): Promise<void> {
    if (!this.room) return;
    await this.room.startAudio().catch(() => undefined);
    this.set({ audioBlocked: !this.room.canPlaybackAudio });
  }

  /** Hang up. Safe to call more than once and from anywhere (timer, button, page leaving). */
  end(): Promise<void> {
    return this.finish('hangup', null);
  }

  /**
   * The page is going away (pagehide: tab closed, reloaded, or left for another site). Leaves at once, and reports
   * the leave first with keepalive: once the page is gone nothing after an await runs, so finish() would never get to
   * it. The backend re-checks the room 30 s after a leave report, so sending it before disconnecting is fine.
   */
  leavePage(): void {
    if (this.ending) return;
    if (this.minted) {
      this.leftReported = true;
      void this.opts.api
        .reportLeft(this.opts.bookingId, { keepalive: true })
        .catch(() => undefined);
    }
    void this.finish('hangup', null);
  }

  // ---- Inside ----

  private live(): boolean {
    return (
      this.state.phase === 'waiting' ||
      this.state.phase === 'in-call' ||
      this.state.phase === 'reconnecting'
    );
  }

  private async turnCameraOn(): Promise<void> {
    if (!this.room) return;
    try {
      const publication = await this.room.localParticipant.setCameraEnabled(true, {
        facingMode: this.state.facing,
      });
      if (this.ending) return;
      this.setLocalVideo(publication?.track ?? null);
      this.set({ cameraOn: true, video: true, cameraProblem: null, otherStartedVideo: false });
    } catch {
      this.set({ cameraOn: false, cameraProblem: CAMERA_PROBLEM });
    }
  }

  private armEndTimer(): void {
    const tick = () => {
      const left = this.state.endsAt - this.now();
      if (left <= 0) {
        void this.finish('time-up', null);
        return;
      }
      this.endTimer = setTimeout(tick, Math.min(left, MAX_TIMEOUT_MS));
    };
    tick();
  }

  private listen(room: CallRoom): void {
    const on = (event: string, listener: (...args: never[]) => void) => {
      room.on(event, listener);
      this.detachers.push(() => room.off(event, listener));
    };

    on(ROOM_EVENTS.ParticipantConnected, () => {
      if (this.ending) return;
      this.syncOther();
      if (this.state.phase === 'waiting') {
        this.set({ phase: 'in-call', connectedAt: this.state.connectedAt ?? this.now() });
      }
    });

    on(ROOM_EVENTS.ParticipantDisconnected, () => {
      if (this.ending) return;
      this.syncOther();
      // LiveKit reports this after the other side hung up or failed to reconnect: the call is over (app rule).
      if (this.room?.remoteParticipants.size === 0 && this.state.connectedAt !== null) {
        void this.finish('other-left', null);
      }
    });

    on(ROOM_EVENTS.TrackSubscribed, ((track: CallTrack) => {
      if (this.ending) return;
      if (track.kind === 'video') this.setRemoteTrack('video', track);
      else if (track.kind === 'audio') this.setRemoteTrack('audio', track);
      this.syncOther();
    }) as (...args: never[]) => void);

    on(ROOM_EVENTS.TrackUnsubscribed, ((track: CallTrack) => {
      if (track === this.remoteVideoTrack) this.setRemoteTrack('video', null);
      if (track === this.remoteAudioTrack) this.setRemoteTrack('audio', null);
      if (!this.ending) this.syncOther();
    }) as (...args: never[]) => void);

    const mutedChanged = () => {
      if (!this.ending) this.syncOther();
    };
    on(ROOM_EVENTS.TrackMuted, mutedChanged);
    on(ROOM_EVENTS.TrackUnmuted, mutedChanged);

    on(ROOM_EVENTS.LocalTrackUnpublished, ((publication: CallPublication) => {
      if (publication.track && publication.track === this.localVideoTrack) {
        this.setLocalVideo(null);
        if (!this.ending) this.set({ cameraOn: false });
      }
    }) as (...args: never[]) => void);

    on(ROOM_EVENTS.Reconnecting, () => {
      if (!this.ending && this.live()) this.set({ phase: 'reconnecting' });
    });
    on(ROOM_EVENTS.Reconnected, () => {
      if (this.ending) return;
      this.syncOther();
      this.set({
        phase: this.state.connectedAt !== null && this.state.other.present ? 'in-call' : 'waiting',
      });
    });

    on(ROOM_EVENTS.Disconnected, ((reason?: number) => {
      if (this.ending || !this.connected) return;
      void this.finish(
        reason === DISCONNECT_DUPLICATE_IDENTITY ? 'other-device' : 'connection-lost',
        null,
      );
    }) as (...args: never[]) => void);

    on(ROOM_EVENTS.AudioPlaybackStatusChanged, () => {
      if (!this.ending && this.room) this.set({ audioBlocked: !this.room.canPlaybackAudio });
    });
  }

  /** The other person's presence and mic/camera, from the room. */
  private syncOther(): void {
    const other = this.room ? [...this.room.remoteParticipants.values()][0] : undefined;
    const next = {
      present: !!other,
      micOn: !!other?.isMicrophoneEnabled,
      cameraOn: !!other?.isCameraEnabled && !!this.remoteVideoTrack,
    };
    const was = this.state.other;
    if (was.present === next.present && was.micOn === next.micOn && was.cameraOn === next.cameraOn)
      return;
    const startedVideo = next.cameraOn && !was.cameraOn && !this.state.video;
    this.set({
      other: next,
      ...(startedVideo && { otherStartedVideo: true, video: true }),
    });
  }

  private setRemoteTrack(kind: 'video' | 'audio', track: CallTrack | null): void {
    const element = kind === 'video' ? this.elements.remoteVideo : this.elements.remoteAudio;
    const current = kind === 'video' ? this.remoteVideoTrack : this.remoteAudioTrack;
    if (current === track) return;
    if (current && element) current.detach(element);
    if (track && element) track.attach(element);
    if (kind === 'video') this.remoteVideoTrack = track;
    else this.remoteAudioTrack = track;
  }

  private setLocalVideo(track: CallTrack | null): void {
    const element = this.elements.localVideo;
    if (this.localVideoTrack === track) return;
    if (this.localVideoTrack && element) this.localVideoTrack.detach(element);
    if (track && element) track.attach(element);
    this.localVideoTrack = track;
  }

  private moveTrack(
    track: CallTrack | null,
    from: HTMLMediaElement | null | undefined,
    to: HTMLMediaElement | null | undefined,
  ): void {
    if (!track || from === to) return;
    if (from) track.detach(from);
    if (to) track.attach(to);
  }

  private async finish(reason: CallEndReason, error: string | null): Promise<void> {
    if (this.ending) return;
    this.ending = true;
    if (this.endTimer) clearTimeout(this.endTimer);
    this.endTimer = null;

    this.setRemoteTrack('video', null);
    this.setRemoteTrack('audio', null);
    this.setLocalVideo(null);
    this.set({
      phase: 'ended',
      endReason: reason,
      error,
      micOn: false,
      cameraOn: false,
      otherStartedVideo: false,
    });

    const room = this.room;
    this.room = null;
    if (room) {
      await room.disconnect().catch(() => undefined);
      for (const detach of this.detachers.splice(0)) detach();
    }
    // After disconnecting, so the server sees this person gone (chat call message -> ended / missed).
    if (this.minted && !this.leftReported)
      await this.opts.api.reportLeft(this.opts.bookingId).catch(() => undefined);
  }

  private set(patch: Partial<CallState>): void {
    let changed = false;
    for (const key of Object.keys(patch) as Array<keyof CallState>) {
      if (!Object.is(this.state[key], patch[key])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
