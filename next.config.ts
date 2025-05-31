import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'enka.network',
        port: '',
        pathname: '/ui/**',
      },
    ],
  },
};

export default nextConfig;
