import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
    unoptimized: true,
  },
  
  serverExternalPackages: [],

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/temperature',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
