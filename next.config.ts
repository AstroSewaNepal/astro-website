import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iOS rejects apple-app-site-association unless it is served as JSON (the file has no extension).
  async headers() {
    return [
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
