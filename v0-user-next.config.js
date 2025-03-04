/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // This helps with the useSearchParams issue
    serverActions: true,
  },
  images: {
    domains: ["localhost", "via.placeholder.com"],
  },
}

module.exports = nextConfig

