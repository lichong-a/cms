/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cms/types', '@cms/utils'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  allowedDevOrigins: ['192.168.31.185'],
}

module.exports = nextConfig
