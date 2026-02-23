import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
    ],
  },
};

export default nextConfig;
