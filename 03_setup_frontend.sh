#!/bin/bash

# CollabBridge - Frontend Setup
echo "🎨 Setting up CollabBridge frontend..."

cd collabbridge-project/frontend

# Create package.json with all dependencies
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "collabbridge-frontend",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint src/**/*.{ts,tsx,astro} --fix",
    "format": "prettier --write src/**/*.{ts,tsx,astro,css}"
  },
  "dependencies": {
    "@astrojs/check": "^0.3.4",
    "@astrojs/react": "^3.0.9",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/vercel": "^7.0.4",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "astro": "^4.0.8",
    "axios": "^1.6.2",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "firebase": "^10.7.1",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-datepicker": "^4.24.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "react-intersection-observer": "^9.5.3",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.20.1",
    "socket.io-client": "^4.7.4",
    "tailwindcss": "^3.3.6",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@astrojs/ts-plugin": "^1.4.0",
    "@types/node": "^20.10.5",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint": "^8.56.0",
    "eslint-plugin-astro": "^0.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "prettier": "^3.1.1",
    "prettier-plugin-astro": "^0.12.2",
    "typescript": "^5.3.3"
  }
}
EOF

# Create TypeScript config
echo "🔧 Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/layouts/*": ["src/layouts/*"],
      "@/pages/*": ["src/pages/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/constants/*": ["src/constants/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/stores/*": ["src/stores/*"],
      "@/services/*": ["src/services/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "**/*.astro"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF

# Create Astro config
echo "⚙️ Creating astro.config.mjs..."
cat > astro.config.mjs << 'EOF'
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  vite: {
    define: {
      'process.env': process.env,
    },
  },
});
EOF

# Create Tailwind config
echo "🎨 Creating tailwind.config.mjs..."
cat > tailwind.config.mjs << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
EOF

# Create .env.example
echo "🌍 Creating .env.example..."
cat > .env.example << 'EOF'
# API Configuration
PUBLIC_API_URL=http://localhost:3000/api
PUBLIC_FRONTEND_URL=http://localhost:4321

# Firebase Configuration
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_API_KEY=your_api_key
PUBLIC_MAX_FILE_SIZE=10485760
PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# Optional Services
PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
PUBLIC_ANALYTICS_ID=your_analytics_id
PUBLIC_SENTRY_DSN=your_sentry_dsn

# Development
NODE_ENV=development
PUBLIC_DEBUG=true
EOF

# Create .gitignore
echo "🙈 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Build output
dist/
.astro/

# Generated types
.astro/

# Dependencies
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.production
.env.local
.env.development.local
.env.test.local
.env.production.local

# macOS-specific files
.DS_Store

# IDE settings
.idea/
.vscode/
*.swp
*.swo

# Turborepo
.turbo

# Cache
.eslintcache

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF

# Create env.d.ts
echo "📝 Creating src/env.d.ts..."
cat > src/env.d.ts << 'EOF'
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_FRONTEND_URL: string;
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  readonly PUBLIC_CLOUDINARY_API_KEY: string;
  readonly PUBLIC_MAX_FILE_SIZE: string;
  readonly PUBLIC_ALLOWED_FILE_TYPES: string;
  readonly PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_ANALYTICS_ID?: string;
  readonly PUBLIC_SENTRY_DSN?: string;
  readonly PUBLIC_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOF

# Create vercel.json for deployment
echo "☁️ Creating vercel.json..."
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "env": {
    "PUBLIC_API_URL": "@public_api_url",
    "PUBLIC_FRONTEND_URL": "@public_frontend_url",
    "PUBLIC_FIREBASE_API_KEY": "@public_firebase_api_key",
    "PUBLIC_FIREBASE_AUTH_DOMAIN": "@public_firebase_auth_domain",
    "PUBLIC_FIREBASE_PROJECT_ID": "@public_firebase_project_id",
    "PUBLIC_FIREBASE_STORAGE_BUCKET": "@public_firebase_storage_bucket",
    "PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@public_firebase_messaging_sender_id",
    "PUBLIC_FIREBASE_APP_ID": "@public_firebase_app_id",
    "PUBLIC_CLOUDINARY_CLOUD_NAME": "@public_cloudinary_cloud_name",
    "PUBLIC_CLOUDINARY_API_KEY": "@public_cloudinary_api_key"
  },
  "functions": {
    "app/api/[...route].ts": {
      "runtime": "nodejs18.x"
    }
  }
}
EOF

echo "✅ Frontend setup complete!"
echo ""
echo "📋 What was created:"
echo "• package.json with all dependencies (including zustand)"
echo "• tsconfig.json for TypeScript with path mapping"
echo "• astro.config.mjs with React and Tailwind"
echo "• tailwind.config.mjs with brand colors and animations"
echo "• .env.example with all required variables"
echo "• .gitignore for proper version control"
echo "• env.d.ts for TypeScript environment types"
echo "• vercel.json for Vercel deployment"
echo ""
echo "🔥 Next: Run npm install to install dependencies"