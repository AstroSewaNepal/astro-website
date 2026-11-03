import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

const BASE_URL = env.siteUrl;

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
          '/client',
          '/astrologer/',
          '/start',
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
