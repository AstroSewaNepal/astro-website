const WORDS_PER_MINUTE = 200;

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadingTimeMinutes(input: {
  reading_time?: number | null;
  html?: string | null;
  excerpt?: string | null;
}): number {
  if (typeof input.reading_time === 'number' && input.reading_time > 0) {
    return input.reading_time;
  }

  const text = stripHtml(input.html ?? '') || (input.excerpt ?? '').trim();
  if (!text) return 1;

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingDuration(minutes: number): string {
  return `${minutes} Min`;
}

export function formatViewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0';
  return String(Math.floor(count));
}
