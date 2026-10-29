import type { NextConfig } from "next";

const backendOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? '').origin;
  } catch {
    return '';
  }
})();
const isDev = process.env.NODE_ENV === 'development';
// Vercel preview deploys (test.astrosewa.com) inject the Vercel toolbar.
const vercelLive = process.env.VERCEL_ENV === 'preview' ? 'https://vercel.live' : '';
const googleAnalytics =
  'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com';

// Next.js hydration and the GA snippet are inline scripts, so 'unsafe-inline' stays until we move to nonces.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com ${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.astrosewa.com ${backendOrigin} https://nominatim.openstreetmap.org ${googleAnalytics} ${vercelLive}`,
  "media-src 'self' blob: https:",
  `frame-src 'self' ${vercelLive}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
]
  .map((directive) => directive.replace(/\s+/g, ' ').trim())
  .join('; ');

const securityHeaders = [
  // Zod's eval probe shows as blocked in the console; Zod then falls back to normal parsing.
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), browsing-topics=()',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // iOS rejects apple-app-site-association unless it is served as JSON (the file has no extension).
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
  // Vercel uses its own deployment adapter; `standalone` breaks adapter modifyConfig (path undefined).
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8080',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'blog.dev.astrosewa.com',
          port:'',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'blog.astrosewa.com',
          port:'',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'static.ghost.org',
          port:'',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: '*.s3.ap-south-1.amazonaws.com',
          port: '',
          pathname: '/**',
        },
    ],
  },
};

export default nextConfig;
