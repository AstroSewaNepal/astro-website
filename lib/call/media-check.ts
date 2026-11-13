// Camera and microphone before a call: ask once (after a tap: iOS Safari wants one), show a preview, and when the
// browser says no, explain how to fix it on this kind of device. The call itself (CallSession) asks again through
// LiveKit; browsers remember the answer for the page, so that second ask doesn't prompt.

import type { CallType } from '@/lib/call/session';

export type MediaProblem =
  /** Plain http (not localhost): browsers only allow camera and mic on https. */
  | 'insecure'
  /** The person or the browser blocked access. */
  | 'denied'
  /** No microphone (or camera) on this device. */
  | 'not-found'
  /** Another app or tab is using it. */
  | 'busy'
  | 'unknown';

export class MediaCheckError extends Error {
  constructor(readonly problem: MediaProblem) {
    super(problem);
    this.name = 'MediaCheckError';
  }
}

export function mediaProblem(error: unknown): MediaProblem {
  const name = (error as { name?: string } | null)?.name ?? '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'denied';
  }
  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'OverconstrainedError'
  ) {
    return 'not-found';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError')
    return 'busy';
  return 'unknown';
}

export type CallMedia = {
  stream: MediaStream;
  /** A video call whose camera couldn't start: it goes ahead as voice, and this says why. */
  cameraProblem: MediaProblem | null;
};

/**
 * Asks for the mic (and camera for video calls). A video call without a usable camera falls back to the mic alone
 * rather than failing; no usable mic throws MediaCheckError.
 */
export async function getCallMedia(
  callType: CallType,
  devices: Pick<MediaDevices, 'getUserMedia'> | undefined = globalThis.navigator?.mediaDevices,
): Promise<CallMedia> {
  if (!devices?.getUserMedia) throw new MediaCheckError('insecure');
  if (callType === 'video') {
    try {
      const stream = await devices.getUserMedia({ audio: true, video: { facingMode: 'user' } });
      return { stream, cameraProblem: null };
    } catch (error) {
      const problem = mediaProblem(error);
      // Blocked: the mic was blocked too (one prompt for both), so don't ask again.
      if (problem === 'denied') throw new MediaCheckError(problem);
      try {
        const stream = await devices.getUserMedia({ audio: true });
        return { stream, cameraProblem: problem };
      } catch (micError) {
        throw new MediaCheckError(mediaProblem(micError));
      }
    }
  }
  try {
    return { stream: await devices.getUserMedia({ audio: true }), cameraProblem: null };
  } catch (error) {
    throw new MediaCheckError(mediaProblem(error));
  }
}

/** Stops the camera and mic of a preview (frees them for the call, turns the camera light off). */
export function stopMedia(stream: MediaStream | null | undefined): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

export type Platform = 'ios' | 'android' | 'desktop';

export function platformOf(userAgent: string, maxTouchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  // iPadOS asks for the desktop site: a "Mac" with a touch screen.
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'desktop';
}

export type MediaHelp = { title: string; steps: string[] };

/** What went wrong and how to fix it, for this device. */
export function mediaHelp(
  problem: MediaProblem,
  callType: CallType,
  platform: Platform,
): MediaHelp {
  const what = callType === 'video' ? 'camera and microphone' : 'microphone';
  switch (problem) {
    case 'insecure':
      return {
        title: 'Calls need a secure connection',
        steps: ['Open this page with https:// (www.astrosewa.com), then try again.'],
      };
    case 'not-found':
      return {
        title: 'No microphone found',
        steps: ['Connect a microphone or headset, or use another device, then try again.'],
      };
    case 'busy':
      return {
        title: `Your ${what} is in use`,
        steps: [
          'Another app or browser tab is using it. Close that call or app, then try again.',
          ...(platform === 'desktop' ? [] : ['If that does not help, restart the browser.']),
        ],
      };
    case 'denied':
      if (platform === 'ios') {
        return {
          title: `Allow ${what} access`,
          steps: [
            'Tap "aA" (or the page menu) in the address bar, then Website Settings.',
            `Set ${callType === 'video' ? 'Camera and Microphone' : 'Microphone'} to Allow, then try again.`,
            'Still blocked? Open iPhone Settings > Apps > Safari and allow them there.',
          ],
        };
      }
      if (platform === 'android') {
        return {
          title: `Allow ${what} access`,
          steps: [
            'Tap the icon at the left of the address bar, then Permissions.',
            `Allow ${callType === 'video' ? 'Camera and Microphone' : 'Microphone'}, then try again.`,
            'Still blocked? In Android Settings > Apps > your browser > Permissions, allow them.',
          ],
        };
      }
      return {
        title: `Allow ${what} access`,
        steps: [
          'Click the camera or lock icon in the address bar.',
          `Allow ${callType === 'video' ? 'the camera and microphone' : 'the microphone'} for this site, then try again.`,
        ],
      };
    default:
      return {
        title: `Could not start your ${what}`,
        steps: ['Try again. If it keeps failing, restart the browser or use another device.'],
      };
  }
}

/** A short note when a video call goes ahead without the camera. */
export function cameraFallbackNote(problem: MediaProblem): string {
  if (problem === 'not-found') return 'No camera found: you will join with voice only.';
  if (problem === 'busy')
    return 'Your camera is in use by another app: you will join with voice only.';
  return 'Your camera could not start: you will join with voice only.';
}
