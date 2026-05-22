import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
