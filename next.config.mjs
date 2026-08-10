/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      'zod',
      'zustand',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

