// CDN caching for the public proxy routes (/api/cities, /api/astrologers, /api/ghost), so repeat
// calls are answered by the CDN instead of the backend or Ghost. Success responses only.
export function publicCacheHeaders(maxAgeSeconds: number): HeadersInit {
  return {
    'Cache-Control': `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 5}`,
  };
}
