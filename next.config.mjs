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
  // NOTE: no `webpack()` hook here. `npm run dev` uses `next dev --turbo`, and
  // Turbopack never calls that hook, so a watchOptions ignore list configured
  // there is silently dead. Keep the dev file tree small instead (.gitignore).
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
