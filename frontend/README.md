# CollabBridge Frontend

A modern Next.js application for connecting event planners with creative professionals.

## Features

- 🔐 **Authentication**: Firebase-based authentication with role-based access
- 🎨 **Modern UI**: Tailwind CSS with responsive design
- 🔄 **Real-time**: Socket.io integration for live messaging
- 🌐 **Multi-language**: Internationalization support
- 📱 **Mobile-first**: Responsive design optimized for all devices
- ⚡ **Performance**: Optimized with Next.js and React Query

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io
- **UI Components**: Headless UI + Heroicons
- **File Upload**: Cloudinary integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Cloudinary account

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.local` and update with your credentials:
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=https://collabbridge.onrender.com
   NEXT_PUBLIC_APP_URL=https://collabbridge.vercel.app

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Development Server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── home/          # Landing page components
│   ├── layout/        # Layout components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and configurations
│   ├── auth/          # Authentication context
│   ├── i18n/          # Internationalization
│   ├── socket/        # Socket.io setup
│   ├── api.ts         # API client
│   └── firebase.ts    # Firebase configuration
├── pages/             # Next.js pages
│   ├── auth/          # Authentication pages
│   ├── dashboard.tsx  # User dashboard
│   └── index.tsx      # Landing page
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Features

### User Roles
- **Event Planners**: Create events, browse professionals, manage bookings
- **Creative Professionals**: Browse events, submit applications, manage portfolio

### Core Functionality
- Role-based dashboard with different views
- Event creation and management
- Professional search and filtering
- Real-time messaging system
- Application and booking management
- Review and rating system
- Portfolio management
- Calendar integration

### UI Components
- Responsive navigation with mobile menu
- Role-specific dashboard layouts
- Authentication forms with validation
- Loading states and error handling
- Modern card-based layouts
- Interactive buttons and forms

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## API Integration

The frontend communicates with the backend API at:
- **Development**: `http://localhost:3001`
- **Production**: `https://collabbridge.onrender.com`

All API calls include authentication headers and error handling.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
