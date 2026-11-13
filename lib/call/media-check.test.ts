import { describe, expect, it, vi } from 'vitest';

import {
  getCallMedia,
  MediaCheckError,
  mediaHelp,
  mediaProblem,
  platformOf,
} from '@/lib/call/media-check';

const domError = (name: string) => Object.assign(new Error(name), { name });
const fakeStream = (label: string) => ({ label, getTracks: () => [] }) as unknown as MediaStream;

describe('mediaProblem', () => {
  it.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'not-found'],
    ['OverconstrainedError', 'not-found'],
    ['NotReadableError', 'busy'],
    ['AbortError', 'busy'],
    ['TypeError', 'unknown'],
  ])('%s -> %s', (name, problem) => {
    expect(mediaProblem(domError(name))).toBe(problem);
  });
});

describe('getCallMedia', () => {
  it('needs https (no mediaDevices on plain http)', async () => {
    await expect(getCallMedia('audio', undefined)).rejects.toMatchObject({ problem: 'insecure' });
  });

  it('asks for camera and mic together for a video call', async () => {
    const getUserMedia = vi.fn(async () => fakeStream('both'));
    const media = await getCallMedia('video', { getUserMedia });
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: { facingMode: 'user' } });
    expect(media).toMatchObject({ cameraProblem: null });
  });

  it('a video call without a camera goes ahead with the mic and says why', async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(domError('NotFoundError'))
      .mockResolvedValueOnce(fakeStream('mic'));
    const media = await getCallMedia('video', { getUserMedia });
    expect(getUserMedia).toHaveBeenLastCalledWith({ audio: true });
    expect(media.cameraProblem).toBe('not-found');
  });

  it('does not ask again after the person blocked access', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(domError('NotAllowedError'));
    await expect(getCallMedia('video', { getUserMedia })).rejects.toBeInstanceOf(MediaCheckError);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('a voice call only asks for the mic', async () => {
    const getUserMedia = vi.fn(async () => fakeStream('mic'));
    await getCallMedia('audio', { getUserMedia });
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
  });
});

describe('platformOf and mediaHelp', () => {
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';
  const ipad =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
  const android =
    'Mozilla/5.0 (Linux; Android 15; SM-G996B) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36';

  it('tells phones apart', () => {
    expect(platformOf(iphone)).toBe('ios');
    expect(platformOf(ipad, 5)).toBe('ios');
    expect(platformOf(ipad, 0)).toBe('desktop');
    expect(platformOf(android)).toBe('android');
  });

  it('gives device-specific steps for blocked access', () => {
    expect(mediaHelp('denied', 'video', 'ios').steps.join(' ')).toMatch(/Website Settings/);
    expect(mediaHelp('denied', 'audio', 'android').steps.join(' ')).toMatch(/Permissions/);
    expect(mediaHelp('denied', 'audio', 'android').title).toBe('Allow microphone access');
    expect(mediaHelp('denied', 'video', 'desktop').title).toBe(
      'Allow camera and microphone access',
    );
  });
});
