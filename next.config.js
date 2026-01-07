/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support both Pages Router (/pages) and App Router (/app)
  experimental: {
    appDir: true,
  },
  // Rewrites for backend API
  async rewrites() {
    return [
      {
        source: '/agent/:path*',
        destination: 'http://localhost:8000/agent/:path*',
      },
      {
        source: '/billing/:path*',
        destination: 'http://localhost:8000/billing/:path*',
      },
    ];
  },
}

module.exports = nextConfig
