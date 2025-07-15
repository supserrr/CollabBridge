# CollabBridge Deployment Guide

This guide covers deploying CollabBridge to production using Render for the backend and Vercel for the frontend.

## Prerequisites

- [Render Account](https://render.com)
- [Vercel Account](https://vercel.com)
- [Firebase Project](https://console.firebase.google.com)
- [Cloudinary Account](https://cloudinary.com)
- GitHub repository with your code

## Backend Deployment (Render)

### 1. Database Setup

1. Log into Render Dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `collabbridge-db`
   - **Database**: `collabbridge`
   - **User**: `collabbridge_user`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15
4. Click "Create Database"
5. Note down the connection details

### 2. Backend Service Setup

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `collabbridge-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### 3. Environment Variables

Set these environment variables in Render:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your PostgreSQL connection string from step 1]
JWT_SECRET=[Auto-generate in Render]
FRONTEND_URL=https://your-vercel-app.vercel.app

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp,pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
```

### 4. Deploy Backend

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://collabbridge-api.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Project Setup

1. Log into Vercel Dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Astro
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Environment Variables

Set these environment variables in Vercel:

```bash
PUBLIC_API_URL=https://collabbridge-api.onrender.com/api
PUBLIC_FRONTEND_URL=https://your-vercel-app.vercel.app

# Firebase Client
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_API_KEY=your_api_key
PUBLIC_MAX_FILE_SIZE=10485760
PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

### 3. Deploy Frontend

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be live at your Vercel URL

## Post-Deployment Steps

### 1. Update CORS Settings

Update your backend's CORS settings to include your Vercel domain:

```typescript
// In your backend cors configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://your-vercel-app.vercel.app',
  ],
  credentials: true,
};
```

### 2. Database Migration

Run database migrations:

```bash
# Using Render shell or local connection
npx prisma migrate deploy
npx prisma db seed
```

### 3. Firebase Configuration

1. Go to Firebase Console
2. Add your domains to authorized domains:
   - `your-vercel-app.vercel.app`
   - `collabbridge-api.onrender.com`

### 4. Test Deployment

1. Visit your Vercel URL
2. Test user registration/login
3. Test event creation
4. Test file uploads
5. Check real-time messaging

## Monitoring & Maintenance

### Health Checks

Both services include health check endpoints:
- Backend: `https://collabbridge-api.onrender.com/health`
- Frontend: Available through Vercel analytics

### Logs

- **Render**: View logs in the Render dashboard
- **Vercel**: View function logs in Vercel dashboard

### Database Backups

Render automatically backs up PostgreSQL databases. Configure retention period in Render dashboard.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check FRONTEND_URL environment variable
2. **Database Connection**: Verify DATABASE_URL format
3. **Firebase Auth**: Check Firebase keys and project configuration
4. **File Uploads**: Verify Cloudinary configuration

### Debug Mode

Enable debug mode by setting `LOG_LEVEL=debug` in backend environment variables.

## Security Checklist

- [ ] All environment variables are properly set
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database access is restricted
- [ ] File upload restrictions are in place

## Performance Optimization

1. **CDN**: Vercel automatically provides CDN
2. **Caching**: Configure appropriate cache headers
3. **Image Optimization**: Use Cloudinary transformations
4. **Database**: Monitor query performance with Prisma

## Scaling

### Backend Scaling (Render)
- Upgrade to higher tier plans for more resources
- Enable autoscaling in Render dashboard

### Frontend Scaling (Vercel)
- Automatic scaling included
- Monitor usage in Vercel analytics

For production deployments, consider upgrading to paid plans for better performance and support.
