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
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Note: Rewrites to external URLs don't work on Vercel for serverless functions
  // Instead, we use Next.js API routes in /app/api and /pages/api to proxy requests
  // The backend URL is configured via BACKEND_URL environment variable
}

module.exports = nextConfig
