import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export type CitySearchResult = {
  id: number;
  name: string;
  asciiname: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string | null;
  state: string | null;
  district: string | null;
  alternateNames: string | null;
  timezone: string;
  timezoneOffset: number;
  popularity: number;
};

let missingBackendUrlWarned = false;

/** Same-origin BFF route — avoids browser CORS when backend is on another origin. */
function getCitiesSearchFetchUrl(query: string): string {
  return `/api/cities/search?q=${encodeURIComponent(query)}`;
}

function warnMissingBackendUrlOnce(): void {
  if (missingBackendUrlWarned) return;
  if (tryGetPublicBackendBaseUrl()) return;
  missingBackendUrlWarned = true;
  console.warn('NEXT_PUBLIC_BACKEND_URL is not set; city search is disabled.');
}

export function formatCityLabel(city: CitySearchResult): string {
  const region = city.state ?? city.district ?? '';
  const parts = [city.name, region, city.countryName].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  return parts.join(', ');
}

export function formatTimezoneOffset(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(offsetHours);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function cityToGeocodeResult(city: CitySearchResult): {
  lat: string;
  lon: string;
  displayName: string;
  timezone: string;
  timezoneOffset: string;
} {
  return {
    lat: String(city.latitude),
    lon: String(city.longitude),
    displayName: formatCityLabel(city),
    timezone: city.timezone,
    timezoneOffset: formatTimezoneOffset(city.timezoneOffset),
  };
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  if (!tryGetPublicBackendBaseUrl()) {
    warnMissingBackendUrlOnce();
    return [];
  }

  try {
    const response = await fetch(getCitiesSearchFetchUrl(trimmed), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-timezone': 'Asia/Kathmandu',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`City search API failed (${response.status})`);
      }
      return [];
    }

    const body = (await response.json()) as CitySearchResult[];
    return Array.isArray(body) ? body : [];
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('City search API request failed');
    }
    return [];
  }
}
