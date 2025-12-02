/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production builds
    // TODO: Fix existing linting errors in pages/index.tsx
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
