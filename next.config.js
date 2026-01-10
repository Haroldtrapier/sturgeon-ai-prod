/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  // Rewrites for backend API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/agent/:path*',
        destination: 'http://localhost:8000/agent/:path*',
      },
      {
        source: '/billing/:path*',
        destination: 'http://localhost:8000/billing/:path*',
      },
      {
        source: '/chat/:path*',
        destination: 'http://localhost:8000/chat/:path*',
      },
      {
        source: '/marketplaces/:path*',
        destination: 'http://localhost:8000/marketplaces/:path*',
      },
      {
        source: '/proposals/:path*',
        destination: 'http://localhost:8000/proposals/:path*',
      },
    ];
  },
}

module.exports = nextConfig
