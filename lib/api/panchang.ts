import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

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
  offset: string = '+05:45' // Nepal timezone
): Promise<PanchangData | null> {
  try {
    // Format date as DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const baseUrl = getPublicBackendBaseUrl();
    const url = joinUrl(
      baseUrl,
      `/vedastro/proxy/panchanga?lat=${lat}&lon=${lon}&time=${time}&date=${dateStr}&offset=${offset}`
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch panchang data:', response.status);
      return null;
    }

    const data = (await response.json()) as PanchangaApiResponse;

    if (data.isError) {
      console.error('Panchang API error:', data.message);
      return null;
    }

    return {
      table: data.data.payload.table,
      moonSign: data.data.payload.moonSign,
    };
  } catch (error) {
    console.error('Error fetching panchang data:', error);
    return null;
  }
}
