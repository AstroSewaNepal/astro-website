import {
  getPublicBackendBaseCandidates,
  resolveVedastroProxyFetchUrl,
} from '@/lib/utils/url';

export interface PanchangData {
  table: {
    Tithi?: { Name?: string };
    NakshatraName?: string;
    Yoga?: { Name?: string };
    Karana?: { Name?: string };
    [key: string]: unknown;
  };
  moonSign: string;
}

interface PanchangaApiResponse {
  data: {
    payload: {
      table: Record<string, unknown>;
      moonSign: string;
    };
  };
  isError: boolean;
  message: string;
}

/**
 * Fetch panchang data for a given date.
 * Defaults to Kathmandu location and noon time.
 */
export async function fetchPanchangData(
  date: Date,
  lat: number = 27.7172, // Kathmandu default
  lon: number = 85.324,  // Kathmandu default
  time: string = '12:00', // Noon default
  offset: string = '+05:45', // Nepal timezone
  location: string = 'Kathmandu',
): Promise<PanchangData | null> {
  try {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      time,
      date: dateStr,
      offset,
      location: location.trim() || 'Kathmandu',
    });

    const attemptErrors: string[] = [];

    for (const base of getPublicBackendBaseCandidates()) {
      const url = resolveVedastroProxyFetchUrl(base, 'panchanga', params);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (!contentType.includes('application/json')) {
          attemptErrors.push(`Non-JSON response (${response.status})`);
          continue;
        }

        const json = (await response.json()) as Record<string, unknown> & PanchangaApiResponse;

        if (!response.ok || json.success === false || json.isError) {
          attemptErrors.push(
            (typeof json.message === 'string' && json.message) ||
              `Request failed (${response.status}).`,
          );
          continue;
        }

        const payload = json.data?.payload;
        if (!payload || typeof payload !== 'object') {
          attemptErrors.push('Unexpected panchang response shape.');
          continue;
        }

        return {
          table: (payload as { table?: Record<string, unknown> }).table ?? {},
          moonSign: (payload as { moonSign?: string }).moonSign ?? '',
        };
      } catch (error) {
        attemptErrors.push(error instanceof Error ? error.message : 'Network error');
      }
    }

    if (attemptErrors.length > 0) {
      console.error('Unable to fetch panchang data:', attemptErrors[attemptErrors.length - 1]);
    }

    return null;
  } catch (error) {
    console.error('Error fetching panchang data:', error);
    return null;
  }
}
