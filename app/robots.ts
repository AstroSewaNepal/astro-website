import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrosewa.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',
          '/api/',
          '/admin/',
          '/login',
          '/sign-in',
          '/kundali-details',
          '/kundali-matching',
          '/calculators',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
