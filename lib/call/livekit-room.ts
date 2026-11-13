// The real LiveKit room for CallSession. livekit-client is browser-only and large, so it is imported here, on
// demand, when a call starts: it stays out of the server bundle (Cloudflare Worker size) and other pages.

import type { CallRoom } from '@/lib/call/session';

export async function createLiveKitRoom(): Promise<CallRoom> {
  const { Room, VideoPresets } = await import('livekit-client');
  // Same media settings as the app (ap src/constants/consultation-media.constants.ts): 360p, simulcast.
  const room = new Room({
    videoCaptureDefaults: { resolution: VideoPresets.h360.resolution },
    publishDefaults: { videoEncoding: VideoPresets.h360.encoding, simulcast: true },
  });
  return room as unknown as CallRoom;
}
