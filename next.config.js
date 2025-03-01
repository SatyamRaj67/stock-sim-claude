/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly use SWC for minification
  swcMinify: true,
  // Explicitly disable Turbopack
  experimental: {
    // Set to false as we're using Webpack
    turbo: false,
  },
  // You can add other Next.js configuration options here
  reactStrictMode: true,
}

module.exports = nextConfig
