export type GeocodeResult = {
  lat: string;
  lon: string;
  displayName?: string;
};

export async function geocodePlace(place: string): Promise<GeocodeResult> {
  const trimmed = place.trim();
  if (!trimmed) {
    throw new Error('Please enter a birth place.');
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`,
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve coordinates for "${trimmed}".`);
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
  const first = data[0];
  if (!first) {
    throw new Error(`Place not found: "${trimmed}". Try a more specific city or region.`);
  }

  return {
    lat: first.lat,
    lon: first.lon,
    displayName: first.display_name,
  };
}
