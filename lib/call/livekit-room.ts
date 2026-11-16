// The real LiveKit room for CallSession and LiveSession. livekit-client is browser-only and large, so it is imported
// here, on demand, when a call or a live stream starts: it stays out of the server bundle (Cloudflare Worker size)
// and other pages.

import type { CallRoom } from '@/lib/call/session';
import type { LiveLocalTrack, LiveRoom } from '@/lib/live/session';

type TestHooks = {
  __callTestRoom?: () => CallRoom;
  __liveTestRoom?: () => LiveRoom;
  __liveTestTracks?: () => LiveLocalTrack[];
};

// Development builds only (removed from production): browser tests hand in fake rooms to look at the screens
// without LiveKit.
const hooks = (): TestHooks => (process.env.NODE_ENV !== 'production' ? (globalThis as TestHooks) : {});

export async function createLiveKitRoom(): Promise<CallRoom> {
  const fake = hooks().__callTestRoom;
  if (fake) return fake();
  const { Room, VideoPresets } = await import('livekit-client');
  // Same media settings as the app (ap src/constants/consultation-media.constants.ts): 360p, simulcast.
  const room = new Room({
    videoCaptureDefaults: { resolution: VideoPresets.h360.resolution },
    publishDefaults: { videoEncoding: VideoPresets.h360.encoding, simulcast: true },
  });
  return room as unknown as CallRoom;
}

/** A room for watching a live stream (doc 10): adaptive stream on, dynacast off, like the app's live rooms. */
export async function createLiveKitLiveRoom(): Promise<LiveRoom> {
  const fake = hooks().__liveTestRoom;
  if (fake) return fake();
  const { Room, VideoPresets } = await import('livekit-client');
  const room = new Room({
    adaptiveStream: true,
    dynacast: false,
    videoCaptureDefaults: { resolution: VideoPresets.h360.resolution },
    publishDefaults: { videoEncoding: VideoPresets.h360.encoding, simulcast: true },
  });
  return room as unknown as LiveRoom;
}

/** Camera + microphone for a live call, made before the slot is taken (asks the browser: call from a tap). */
export async function createLiveKitTracks(options: {
  facingMode: 'user' | 'environment';
}): Promise<LiveLocalTrack[]> {
  const fake = hooks().__liveTestTracks;
  if (fake) return fake();
  const { createLocalTracks, VideoPresets } = await import('livekit-client');
  const tracks = await createLocalTracks({
    audio: true,
    video: { facingMode: options.facingMode, resolution: VideoPresets.h360.resolution },
  });
  return tracks as unknown as LiveLocalTrack[];
}
