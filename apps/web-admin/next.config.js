/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cms/types'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
