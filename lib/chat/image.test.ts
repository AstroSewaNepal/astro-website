import { describe, expect, it } from 'vitest';

import {
  CHAT_IMAGE_MAX_EDGE,
  CHAT_IMAGE_MAX_PICK_BYTES,
  chatImageProblem,
  fitWithin,
} from '@/lib/chat/image';

describe('chatImageProblem', () => {
  it('lets photos through', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', ''])
      expect(chatImageProblem({ type, size: 1000 })).toBeNull();
  });

  it('refuses other files, SVG included', () => {
    for (const type of ['image/svg+xml', 'application/pdf', 'text/html', 'video/mp4'])
      expect(chatImageProblem({ type, size: 1000 })).toMatch(/Only photos/);
  });

  it('refuses empty and huge files before reading them', () => {
    expect(chatImageProblem({ type: 'image/jpeg', size: 0 })).toMatch(/empty/);
    expect(chatImageProblem({ type: 'image/jpeg', size: CHAT_IMAGE_MAX_PICK_BYTES + 1 })).toMatch(
      /too large/,
    );
  });
});

describe('fitWithin', () => {
  it('shrinks the longest side to the cap, keeping the shape', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: CHAT_IMAGE_MAX_EDGE, height: 1536 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1536, height: CHAT_IMAGE_MAX_EDGE });
  });

  it('never enlarges', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('keeps at least a pixel on very thin images', () => {
    expect(fitWithin(100_000, 10)).toEqual({ width: CHAT_IMAGE_MAX_EDGE, height: 1 });
  });
});
