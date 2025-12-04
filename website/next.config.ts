import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable experimental features
  experimental: {
    // Next.js 15+ features
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Image optimization (for future user avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
