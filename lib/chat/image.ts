// Chat photos (the app's "Upload Photo" / "Take Picture"), shrunk in the browser before upload.
//
// Why shrink here: every upload costs the backend three sharp passes (sanitize, full-size WebP, thumbnail) and holds
// the whole file in memory (multer, up to 20 MB) on a small server. A phone photo is 3-12 MB and 12-50 MP; at
// 2048 px it's well under 1 MB and decodes several times faster. Re-encoding also drops EXIF (GPS) before the photo
// leaves the device. The backend still validates and re-encodes everything itself (never trust the browser).

/** What the picker offers; the backend refuses anything else (SVG is blocked there too). */
export const CHAT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif';

/** Longest side after shrinking (WhatsApp sends 1600; a little more keeps chart and palm photos sharp). */
export const CHAT_IMAGE_MAX_EDGE = 2048;
const JPEG_QUALITY = 0.85;
/** The backend's cap (CHAT_IMAGE_MAX_BYTES). */
export const CHAT_IMAGE_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
/** Bigger files aren't even opened: decoding them can run a phone out of memory. */
export const CHAT_IMAGE_MAX_PICK_BYTES = 40 * 1024 * 1024;
/** The backend's MAX_IMAGE_INPUT_PIXELS. */
const MAX_PIXELS = 100_000_000;

const ALLOWED_TYPES = new Set(CHAT_IMAGE_ACCEPT.split(','));

export class ChatImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatImageError';
  }
}

/** Why a picked file can't be sent, or null when it can be tried. Checked before anything is read. */
export function chatImageProblem(file: { type: string; size: number }): string | null {
  // Some phones give HEIC photos no type at all; the backend checks the bytes either way.
  if (file.type && !ALLOWED_TYPES.has(file.type.toLowerCase()))
    return 'Only photos can be sent (JPG, PNG, WebP, GIF or HEIC).';
  if (file.size === 0) return 'This photo is empty.';
  if (file.size > CHAT_IMAGE_MAX_PICK_BYTES) return 'This photo is too large to send.';
  return null;
}

/** Size that fits inside `max` × `max` keeping the shape; never enlarges. */
export function fitWithin(
  width: number,
  height: number,
  max = CHAT_IMAGE_MAX_EDGE,
): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

/** Decodes with the photo's EXIF rotation applied; null when this browser can't read it (HEIC on most). */
async function decode(file: Blob): Promise<Decoded | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Fall through to <img>: older Safari has createImageBitmap but not for every type.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
}

/**
 * The file to upload: a JPEG at most CHAT_IMAGE_MAX_EDGE on its longest side. GIFs go as they are (shrinking would
 * stop the animation), and so does a photo this browser can't decode (the backend then decides). Throws
 * ChatImageError with a message for the person.
 */
export async function prepareChatImage(file: File): Promise<Blob> {
  const problem = chatImageProblem(file);
  if (problem) throw new ChatImageError(problem);

  const asIs = () => {
    if (file.size > CHAT_IMAGE_MAX_UPLOAD_BYTES)
      throw new ChatImageError('This photo is too large to send (20 MB at most).');
    return file;
  };
  if (file.type.toLowerCase() === 'image/gif') return asIs();

  const decoded = await decode(file);
  if (!decoded) return asIs();
  try {
    if (decoded.width * decoded.height > MAX_PIXELS)
      throw new ChatImageError('This photo is too large to send.');
    const size = fitWithin(decoded.width, decoded.height);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return asIs();
    // JPEG has no transparency: white behind see-through PNGs, like the backend's flatten.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(decoded.source, 0, 0, size.width, size.height);
    const jpeg = await toJpeg(canvas);
    // Free the canvas memory now (phones keep few big canvases).
    canvas.width = canvas.height = 0;
    if (!jpeg) return asIs();
    return jpeg;
  } finally {
    decoded.close();
  }
}
