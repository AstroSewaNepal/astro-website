import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CallSession,
  ROOM_EVENTS,
  type CallApi,
  type CallParticipant,
  type CallPublication,
  type CallRoom,
  type CallTrack,
} from '@/lib/call/session';

type Listener = (...args: unknown[]) => void;

/** Stands in for an <audio>/<video> element: only identity matters. */
const element = (name: string) => ({ name }) as unknown as HTMLVideoElement;

class FakeTrack implements CallTrack {
  attachedTo: unknown[] = [];
  restarts: string[] = [];
  constructor(readonly kind: string) {}
  attach(el: HTMLMediaElement) {
    this.attachedTo.push(el);
    return el;
  }
  detach(el?: HTMLMediaElement) {
    this.attachedTo = this.attachedTo.filter(e => e !== el);
  }
  async restartTrack(options: { facingMode: string }) {
    this.restarts.push(options.facingMode);
  }
}

class FakeRoom implements CallRoom {
  listeners = new Map<string, Listener[]>();
  remoteParticipants = new Map<string, CallParticipant>();
  canPlaybackAudio = true;
  connectedTo: string[] = [];
  disconnects = 0;
  failConnect = false;
  failMic = false;
  failCamera = false;
  cameraTrack = new FakeTrack('video');
  localParticipant = {
    identity: 'me',
    isMicrophoneEnabled: false,
    isCameraEnabled: false,
    setMicrophoneEnabled: vi.fn(async (on: boolean) => {
      if (this.failMic) throw new Error('NotAllowedError');
      this.localParticipant.isMicrophoneEnabled = on;
    }),
    setCameraEnabled: vi.fn(async (on: boolean): Promise<CallPublication | undefined> => {
      if (on && this.failCamera) throw new Error('NotAllowedError');
      this.localParticipant.isCameraEnabled = on;
      return on
        ? { kind: 'video', source: 'camera', isMuted: false, track: this.cameraTrack }
        : undefined;
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
    for (const fn of this.listeners.get(event) ?? []) fn(...args);
  }
  listenerCount() {
    return [...this.listeners.values()].reduce((n, fns) => n + fns.length, 0);
  }
  async connect(url: string, token: string) {
    if (this.failConnect) throw new Error('could not connect');
    this.connectedTo.push(`${url}|${token}`);
  }
  async disconnect() {
    this.disconnects += 1;
    this.fire(ROOM_EVENTS.Disconnected, 1);
  }
  async startAudio() {
    this.canPlaybackAudio = true;
  }

  // The other person, as LiveKit reports them.
  otherJoins(camera = false) {
    this.remoteParticipants.set('them', {
      identity: 'them',
      isMicrophoneEnabled: true,
      isCameraEnabled: camera,
    });
    this.fire(ROOM_EVENTS.ParticipantConnected);
  }
  otherLeaves() {
    this.remoteParticipants.delete('them');
    this.fire(ROOM_EVENTS.ParticipantDisconnected);
  }
}

const NOW = new Date('2026-11-13T09:40:00Z').getTime();
const MIN = 60_000;

function setup(
  overrides: { callType?: 'audio' | 'video'; endsAt?: number; api?: Partial<CallApi> } = {},
) {
  const room = new FakeRoom();
  const calls: string[] = [];
  const api: CallApi = {
    mintToken: vi.fn(async () => {
      calls.push('mint');
      return { token: 'tok', roomName: 'call-a-b', liveKitUrl: 'wss://lk' };
    }),
    reportLeft: vi.fn(async () => {
      calls.push(`left after ${room.disconnects} disconnect(s)`);
    }),
    ...overrides.api,
  };
  const createRoom = vi.fn(() => room);
  const session = new CallSession({
    bookingId: 'booking-1',
    callType: overrides.callType ?? 'video',
    endsAt: overrides.endsAt ?? NOW + 20 * MIN,
    api,
    createRoom,
    describeError: e => `refused: ${(e as Error).message}`,
    now: () => Date.now(),
  });
  return { room, api, session, createRoom, calls };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('CallSession', () => {
  it('uses the real livekit-client event names', async () => {
    const { RoomEvent } = await import('livekit-client');
    for (const [name, value] of Object.entries(ROOM_EVENTS)) {
      expect(RoomEvent[name as keyof typeof RoomEvent], name).toBe(value);
    }
  });

  it('joins a video call: token for this booking, mic and camera on, waits for the other person', async () => {
    const { session, room, api } = setup();
    await session.start();
    expect(api.mintToken).toHaveBeenCalledWith('booking-1', 'video');
    expect(room.connectedTo).toEqual(['wss://lk|tok']);
    expect(session.getState()).toMatchObject({
      phase: 'waiting',
      micOn: true,
      cameraOn: true,
      video: true,
      connectedAt: null,
    });
  });

  it('a voice call leaves the camera off', async () => {
    const { session, room } = setup({ callType: 'audio' });
    await session.start();
    expect(room.localParticipant.setCameraEnabled).not.toHaveBeenCalled();
    expect(session.getState()).toMatchObject({ video: false, cameraOn: false, micOn: true });
  });

  it('answering a call that is already running goes straight to in-call', async () => {
    const { session, room } = setup();
    room.remoteParticipants.set('them', {
      identity: 'them',
      isMicrophoneEnabled: true,
      isCameraEnabled: false,
    });
    await session.start();
    expect(session.getState()).toMatchObject({ phase: 'in-call', connectedAt: NOW });
  });

  it('goes in-call when the other person joins, and plays their video and sound in the given elements', async () => {
    const { session, room } = setup();
    await session.start();
    const remoteVideo = element('remote-video');
    const remoteAudio = element('remote-audio') as unknown as HTMLAudioElement;
    session.setMediaElements({ remoteVideo, remoteAudio });

    vi.setSystemTime(NOW + 5_000);
    room.otherJoins(true);
    const theirVideo = new FakeTrack('video');
    const theirAudio = new FakeTrack('audio');
    room.fire(ROOM_EVENTS.TrackSubscribed, theirVideo);
    room.fire(ROOM_EVENTS.TrackSubscribed, theirAudio);

    expect(session.getState()).toMatchObject({
      phase: 'in-call',
      connectedAt: NOW + 5_000,
      other: { present: true, micOn: true, cameraOn: true },
    });
    expect(theirVideo.attachedTo).toEqual([remoteVideo]);
    expect(theirAudio.attachedTo).toEqual([remoteAudio]);
  });

  it('moves tracks to elements handed over later, without new elements per track', async () => {
    const { session, room } = setup();
    await session.start();
    room.otherJoins(true);
    const theirVideo = new FakeTrack('video');
    room.fire(ROOM_EVENTS.TrackSubscribed, theirVideo);

    const first = element('v1');
    session.setMediaElements({ remoteVideo: first, localVideo: element('me') });
    expect(theirVideo.attachedTo).toEqual([first]);
    expect(room.cameraTrack.attachedTo).toHaveLength(1);

    const second = element('v2');
    session.setMediaElements({ remoteVideo: second });
    expect(theirVideo.attachedTo).toEqual([second]);
  });

  it('ends when the other person leaves, then reports leaving after disconnecting', async () => {
    const { session, room, calls } = setup();
    await session.start();
    room.otherJoins();
    room.otherLeaves();
    await vi.runAllTimersAsync();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'other-left' });
    expect(room.disconnects).toBe(1);
    expect(calls).toEqual(['mint', 'left after 1 disconnect(s)']);
  });

  it('keeps waiting while the other person has not joined', async () => {
    const { session, room } = setup();
    await session.start();
    room.fire(ROOM_EVENTS.ParticipantDisconnected);
    expect(session.getState().phase).toBe('waiting');
  });

  it('ends when the booking time is up', async () => {
    const { session, room } = setup({ endsAt: NOW + 2 * MIN });
    await session.start();
    room.otherJoins();
    await vi.advanceTimersByTimeAsync(2 * MIN - 1);
    expect(session.getState().phase).toBe('in-call');
    await vi.advanceTimersByTimeAsync(1);
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'time-up' });
    expect(room.disconnects).toBe(1);
  });

  it('hanging up twice disconnects and reports once, and stops listening to the room', async () => {
    const { session, room, api } = setup();
    await session.start();
    await Promise.all([session.end(), session.end()]);
    await session.end();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'hangup' });
    expect(room.disconnects).toBe(1);
    expect(api.reportLeft).toHaveBeenCalledTimes(1);
    expect(room.listenerCount()).toBe(0);
  });

  it('a refused token ends with the reason and creates no room', async () => {
    const { session, createRoom, api } = setup({
      api: {
        mintToken: vi.fn(async () => Promise.reject(new Error('This consultation has ended'))),
      },
    });
    await session.start();
    expect(session.getState()).toMatchObject({
      phase: 'ended',
      endReason: 'failed',
      error: 'refused: This consultation has ended',
    });
    expect(createRoom).not.toHaveBeenCalled();
    expect(api.reportLeft).not.toHaveBeenCalled();
  });

  it('hanging up while the token is on its way still reports leaving (the other side was already rung)', async () => {
    let release!: () => void;
    const { session, createRoom, api } = setup({
      api: {
        mintToken: vi.fn(
          () =>
            new Promise<{ token: string; roomName: string; liveKitUrl: string }>(resolve => {
              release = () => resolve({ token: 't', roomName: 'r', liveKitUrl: 'u' });
            }),
        ),
      },
    });
    const starting = session.start();
    await session.end();
    release();
    await starting;
    expect(createRoom).not.toHaveBeenCalled();
    expect(session.getState().endReason).toBe('hangup');
    expect(api.reportLeft).toHaveBeenCalledTimes(1);
  });

  it('a failed connection ends the call and reports leaving', async () => {
    const { session, room, api } = setup();
    room.failConnect = true;
    await session.start();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'failed' });
    expect(session.getState().error).toMatch(/internet connection/);
    expect(api.reportLeft).toHaveBeenCalledTimes(1);
  });

  it('a blocked microphone ends the call with help', async () => {
    const { session, room } = setup();
    room.failMic = true;
    await session.start();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'failed' });
    expect(session.getState().error).toMatch(/microphone/);
  });

  it('a blocked camera keeps the call going as voice', async () => {
    const { session, room } = setup();
    room.failCamera = true;
    await session.start();
    expect(session.getState()).toMatchObject({ phase: 'waiting', cameraOn: false, micOn: true });
    expect(session.getState().cameraProblem).toMatch(/camera/);
  });

  it('voice call: the other person turning video on is offered, and turning ours on accepts it', async () => {
    const { session, room } = setup({ callType: 'audio' });
    await session.start();
    room.otherJoins(false);
    expect(session.getState().otherStartedVideo).toBe(false);

    room.remoteParticipants.set('them', {
      identity: 'them',
      isMicrophoneEnabled: true,
      isCameraEnabled: true,
    });
    room.fire(ROOM_EVENTS.TrackSubscribed, new FakeTrack('video'));
    expect(session.getState()).toMatchObject({ otherStartedVideo: true, video: true });

    await session.toggleCamera();
    expect(session.getState()).toMatchObject({ cameraOn: true, otherStartedVideo: false });
  });

  it('mute and camera off/on', async () => {
    const { session, room } = setup();
    await session.start();
    const localVideo = element('me');
    session.setMediaElements({ localVideo });
    await session.toggleMic();
    expect(session.getState().micOn).toBe(false);
    await session.toggleCamera();
    expect(session.getState().cameraOn).toBe(false);
    expect(room.cameraTrack.attachedTo).toEqual([]);
    await session.toggleCamera();
    expect(room.cameraTrack.attachedTo).toEqual([localVideo]);
  });

  it('flips between front and back camera', async () => {
    const { session, room } = setup();
    await session.start();
    await session.flipCamera();
    expect(room.cameraTrack.restarts).toEqual(['environment']);
    expect(session.getState().facing).toBe('environment');
  });

  it('shows reconnecting while LiveKit gets the call back', async () => {
    const { session, room } = setup();
    await session.start();
    room.otherJoins();
    room.fire(ROOM_EVENTS.Reconnecting);
    expect(session.getState().phase).toBe('reconnecting');
    room.fire(ROOM_EVENTS.Reconnected);
    expect(session.getState().phase).toBe('in-call');
  });

  it('joining the same call on another device ends it here with that reason', async () => {
    const { session, room, api } = setup();
    await session.start();
    room.fire(ROOM_EVENTS.Disconnected, 2);
    await vi.runAllTimersAsync();
    expect(session.getState()).toMatchObject({ phase: 'ended', endReason: 'other-device' });
    expect(api.reportLeft).toHaveBeenCalledTimes(1);
  });

  it('a dropped connection that could not recover ends the call', async () => {
    const { session, room } = setup();
    await session.start();
    room.fire(ROOM_EVENTS.Disconnected, 0);
    await vi.runAllTimersAsync();
    expect(session.getState().endReason).toBe('connection-lost');
  });

  it('asks for a tap when the browser blocks sound, and clears after startAudio', async () => {
    const { session, room } = setup();
    room.canPlaybackAudio = false;
    await session.start();
    expect(session.getState().audioBlocked).toBe(true);
    await session.startAudio();
    expect(session.getState().audioBlocked).toBe(false);
  });

  it('tells subscribers only when something changed', async () => {
    const { session, room } = setup();
    await session.start();
    room.otherJoins();
    const seen = vi.fn();
    session.subscribe(seen);
    room.fire(ROOM_EVENTS.TrackMuted);
    room.fire(ROOM_EVENTS.TrackUnmuted);
    expect(seen).not.toHaveBeenCalled();
  });
});
