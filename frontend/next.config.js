/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "avatars.githubusercontent.com",
      "images.unsplash.com",
      "plus.unsplash.com"
    ],
  },
  env: {
    CUSTOM_KEY: 'collabbridge',
  },
  // Fix for Firebase/undici compatibility issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Transpile Firebase modules for better compatibility
  transpilePackages: ['firebase'],
  experimental: {
    esmExternals: 'loose',
  },
  // Ensure proper routing
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/supserrr/CollabBridge",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;