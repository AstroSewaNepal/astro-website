import type {
  Astrologer,
  BackendAstrologerResult,
} from '@/components/pages/landing/talk-to-our-astrologer/types';
import { sortTopAstrologers } from '@/components/pages/landing/talk-to-our-astrologer/utils';

/**
 * Fetches top astrologers via the same-origin BFF route (`/api/astrologers/top`).
 * Proxies to `{NEXT_PUBLIC_BACKEND_URL}/api/v1/astrologer-details` with active + rating sort.
 */
export async function fetchTopAstrologers(): Promise<Astrologer[]> {
  try {
    const response = await fetch('/api/astrologers/top', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-timezone': 'Asia/Kathmandu',
      },
      cache: 'no-store',
    });

    const body = (await response.json()) as BackendAstrologerResult<Astrologer[]>;

    if (!response.ok || body.success === false || !Array.isArray(body.data)) {
      const fallbackMessage =
        typeof body === 'object' && body !== null && 'message' in body
          ? String((body as { message?: string }).message ?? '')
          : '';
      const message =
        body.errors?.[0]?.message ||
        fallbackMessage ||
        `Top astrologers API failed (${response.status})`;
      throw new Error(message);
    }

    return sortTopAstrologers(body.data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Top astrologers API request failed',
        error instanceof Error ? error.message : error,
      );
    }
    throw error instanceof Error ? error : new Error('Failed to load astrologers.');
  }
}
