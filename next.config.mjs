/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization for better performance
    formats: ['image/avif', 'image/webp'],
    // Allow images from WordPress domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v0-exocar-experience.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress.org',
      },
    ],
    // Optimize image caching and sizes
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // SEO and performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Performance optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce file watching overhead
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/tecxmate-main/**',
          '**/crypted.vc/**',
          '**/package-lock.json',
          '**/pnpm-lock.yaml',
          '**/yarn.lock',
          '**/.git/**',
        ],
      }
    }
    return config
  },
  // Exclude sub-projects from being processed
  experimental: {
    // Reduce bundle analysis overhead
    webpackBuildWorker: true,
    // Optimize package imports to reduce bundle size (especially for mobile)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },
}

export default nextConfig
