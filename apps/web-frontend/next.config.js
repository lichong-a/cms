/** @type {import('next').NextConfig} */
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig = {
  transpilePackages: ['@cms/types', '@cms/utils'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
}

module.exports = nextConfig
