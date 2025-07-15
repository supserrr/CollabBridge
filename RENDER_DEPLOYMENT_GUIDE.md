# CollabBridge Render Deployment Guide

This guide will walk you through deploying CollabBridge to production using Render for both backend and database.

## Prerequisites

- [Render Account](https://render.com) (free tier available)
- [GitHub Repository](https://github.com) with your CollabBridge code
- [Firebase Project](https://console.firebase.google.com)
- [Cloudinary Account](https://cloudinary.com)
- [Vercel Account](https://vercel.com) for frontend

## Step 1: Database Setup on Render

### 1.1 Create PostgreSQL Database

1. Log into your Render Dashboard
2. Click **"New"** → **"PostgreSQL"**
3. Configure your database:
   - **Name**: `collabbridge-db`
   - **Database**: `collabbridge`
   - **User**: `collabbridge_user`
   - **Region**: Choose closest to your target users
   - **PostgreSQL Version**: 15
   - **Plan**: Start with Free (can upgrade later)

4. Click **"Create Database"**
5. Wait for provisioning to complete
6. **Important**: Save the connection details from the database dashboard

### 1.2 Note Database Connection Details

From your database dashboard, copy:
- **Internal Database URL** (for backend service)
- **External Database URL** (for local development)

## Step 2: Backend Deployment on Render

### 2.1 Create Web Service

1. In Render Dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `collabbridge-api`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### 2.2 Environment Variables

Set these environment variables in your Render web service:

```bash
# Application
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database (use your actual database URL from Step 1.2)
DATABASE_URL=postgresql://collabbridge_user:password@host:port/collabbridge

# JWT (let Render auto-generate this)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp,pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
```

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the build and deployment to complete
3. Your backend will be available at: `https://collabbridge-api.onrender.com`

### 2.4 Initialize Database

After successful deployment:

1. Go to your web service dashboard
2. Open the **"Shell"** tab
3. Run these commands:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Step 3: Frontend Deployment on Vercel

### 3.1 Create Vercel Project

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Astro
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Environment Variables

Set these in Vercel project settings:

```bash
# API Configuration
PUBLIC_API_URL=https://collabbridge-api.onrender.com/api
PUBLIC_FRONTEND_URL=https://your-project.vercel.app

# Firebase Client SDK
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary (for client-side uploads)
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_API_KEY=your_api_key
PUBLIC_MAX_FILE_SIZE=10485760
PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

### 3.3 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your frontend will be available at your Vercel URL

## Step 4: Firebase Configuration

### 4.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `your-vercel-app.vercel.app`
   - `collabbridge-api.onrender.com`

### 4.2 Update CORS in Backend

Update your backend environment variables to include your actual frontend URL:

```bash
FRONTEND_URL=https://your-actual-vercel-domain.vercel.app
```

## Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain for Backend

1. In Render, go to your web service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

### 5.2 Custom Domain for Frontend

1. In Vercel, go to your project settings
2. Click **"Domains"**
3. Add your custom domain (e.g., `yourdomain.com`)
4. Update DNS records as instructed

## Step 6: Testing Your Deployment

### 6.1 Backend Health Check

Visit: `https://collabbridge-api.onrender.com/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": "...",
  "environment": "production"
}
```

### 6.2 Frontend Testing

1. Visit your Vercel URL
2. Test user registration/login
3. Test event creation
4. Test file uploads
5. Test real-time messaging

## Step 7: Monitoring & Maintenance

### 7.1 Monitoring

- **Render**: Check logs in the web service dashboard
- **Vercel**: Monitor function logs and analytics
- **Database**: Check connection and query performance

### 7.2 Scaling

- **Database**: Upgrade plan as needed
- **Backend**: Render auto-scales, but monitor performance
- **Frontend**: Vercel handles scaling automatically

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database status in Render dashboard

2. **CORS Errors**
   - Ensure FRONTEND_URL matches your Vercel domain
   - Check Firebase authorized domains

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all environment variables are set

4. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

### Getting Help

- **Render Support**: [render.com/docs](https://render.com/docs)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase Support**: [firebase.google.com/docs](https://firebase.google.com/docs)

## Security Checklist

- [ ] All environment variables are properly set
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (automatic on Render/Vercel)
- [ ] Database access is restricted
- [ ] File upload restrictions are in place

## Cost Estimation

### Free Tier Limits

- **Render Free**: 750 hours/month, sleeps after 15min inactivity
- **Vercel Free**: 100GB bandwidth, unlimited hobby projects
- **PostgreSQL Free**: 1GB storage, 97 hours uptime

### Recommended Upgrades for Production

- **Render Starter Plan**: $7/month (no sleep, custom domains)
- **PostgreSQL Standard**: $7/month (shared, 1GB RAM)
- **Vercel Pro**: $20/month (commercial use, more bandwidth)

Your CollabBridge application is now ready for production! 🚀
