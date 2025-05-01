import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/:path*',
      },
    ];
  },
  images: {
    domains: ['image.tmdb.org', 'denge.click'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['hls.js'],
  eslint: {
    // Disable ESLint during build for now
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
