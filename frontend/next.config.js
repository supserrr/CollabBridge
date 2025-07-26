const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'framer-motion'],
  },
  
  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer (optional, for debugging)
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        animations: {
          name: 'animations',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          priority: 30,
          enforce: true,
        },
        icons: {
          name: 'icons',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](lucide-react|@radix-ui\/react-icons)[\\/]/,
          priority: 25,
          enforce: true,
        },
      };
    }
    return config;
  },

  images: {
    domains: ['localhost', 'collabbridge.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = withBundleAnalyzer(nextConfig)
