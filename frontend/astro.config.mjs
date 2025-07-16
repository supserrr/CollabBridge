import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      config: { applyBaseStyles: false }
    })
  ],
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
    }
  },
  image: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com'
      }
    ]
  },
  security: {
    checkOrigin: true
  }
});
