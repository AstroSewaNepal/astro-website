import type { MetadataRoute } from 'next';

/**
 * "Add to Home Screen" / install data. Android uses these icons (the Android app's maroon icon); iPhones use
 * public/apple-touch-icon.png (the iOS app's white icon) and the appleWebApp tags in app/layout.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Astro Sewa',
    short_name: 'AstroSewa',
    description:
      "Nepal's trusted online astrology platform: consultations, horoscopes and Kundali.",
    // Opens the user's own home when logged in (see app/start/route.ts)
    start_url: '/start',
    scope: '/',
    display: 'standalone',
    // Splash screen on Android, same maroon as the app's splash
    background_color: '#770B0C',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
