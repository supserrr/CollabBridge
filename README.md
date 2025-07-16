# CollabBridge

A platform connecting event planners with skilled creative professionals.

## Features

- User authentication with Firebase
- Role-based access (Event Planners & Creative Professionals)
- Event creation and management
- Application and booking system
- Real-time messaging
- Reviews and ratings
- File uploads with Cloudinary
- Search and filtering

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- Firebase Authentication
- Socket.IO for real-time features
- Cloudinary for file storage

### Frontend
- Astro with React
- TypeScript
- Tailwind CSS
- Firebase Client SDK

## Deployment

This application is configured for deployment on Render.

### Prerequisites

1. Render account
2. Firebase project
3. Cloudinary account
4. GitHub repository

### Environment Variables

#### Backend (Required)
- `DATABASE_URL` - PostgreSQL connection string (provided by Render)
- `JWT_SECRET` - JWT signing secret
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FRONTEND_URL` - Frontend URL (e.g., https://your-app.vercel.app)

#### Optional
- `EMAIL_USER` - SMTP email username
- `EMAIL_PASS` - SMTP email password
- `REDIS_URL` - Redis connection string

### Deployment Steps

1. **Database Setup**
   - Create PostgreSQL database on Render
   - Note the connection string

2. **Backend Deployment**
   - Create web service on Render
   - Connect GitHub repository
   - Set root directory to `backend`
   - Configure environment variables
   - Deploy

3. **Frontend Deployment**
   - Deploy to Vercel or similar platform
   - Configure environment variables
   - Update `FRONTEND_URL` in backend

4. **Database Migration**
   - Run migrations automatically on deploy
   - Seed database with sample data

## Local Development

1. Clone the repository
2. Install dependencies: `npm install` in both `backend` and `frontend` directories
3. Set up environment variables
4. Run database migrations: `cd backend && npx prisma migrate dev`
5. Start development servers:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Support

For support, please contact support@collabbridge.com
