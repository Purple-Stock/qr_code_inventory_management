/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // Add this to disable static generation for pages using useSearchParams
  output: "standalone",
}

module.exports = nextConfig

