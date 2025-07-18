# CollabBridge Frontend

A modern web application built with Astro, React, and Tailwind CSS for connecting event planners with creative professionals.

## 🚀 Deployment on Vercel

This project is configured for deployment on Vercel with the following setup:

### Prerequisites

- Node.js 18+ (recommended for Vercel compatibility)
- npm or yarn package manager

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PUBLIC_API_URL=your_backend_api_url
PUBLIC_SITE_URL=your_frontend_url
```

### Build Commands

The project uses the following build configuration:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Vercel Configuration

The project includes:
- `vercel.json` for deployment settings
- `@astrojs/vercel` adapter for serverless functions
- Automatic static file optimization

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

- **Framework**: Astro 5.x with SSR
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.x
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Deployment**: Vercel Serverless

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication modals
│   ├── layout/         # Layout components
│   ├── pages/          # Page-specific components
│   └── ui/             # Reusable UI components
├── layouts/            # Astro layouts
├── pages/              # Astro pages (routes)
├── services/           # API service layer
├── styles/             # Global styles
└── types/              # TypeScript definitions
```

## 🔧 Features

- ✅ Server-side rendering with Astro
- ✅ React components with TypeScript
- ✅ Responsive design with Tailwind CSS
- ✅ Authentication system
- ✅ Professional browsing and search
- ✅ Event management dashboard
- ✅ Form validation and error handling
- ✅ Optimized for Vercel deployment

## 🚢 Deployment Steps

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Import your repository in the Vercel dashboard
3. **Configure Environment Variables**: Add your environment variables in Vercel settings
4. **Deploy**: Vercel will automatically build and deploy your application

The build process will:
- Install dependencies
- Build the Astro application
- Generate serverless functions
- Optimize static assets
- Deploy to Vercel's global CDN

## 📝 Notes

- The project uses Node.js 18 runtime on Vercel (automatically configured)
- Static assets are optimized and served from Vercel's CDN
- API routes are deployed as serverless functions
- Environment variables are securely managed by Vercel
