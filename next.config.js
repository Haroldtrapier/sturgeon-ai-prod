/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Temporarily ignore ESLint errors during builds due to circular dependency issue
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
