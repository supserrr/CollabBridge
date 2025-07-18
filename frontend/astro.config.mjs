// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  integrations: [
    react()
  ],
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  vite: {
    define: {
      'process.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL),
      'process.env.PUBLIC_SITE_URL': JSON.stringify(process.env.PUBLIC_SITE_URL)
    }
  }
});