/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["localhost"],
  },
}

module.exports = nextConfig

