# CollabBridge Render Deployment Guide

This guide will walk you through deploying CollabBridge to Render from scratch.

## Prerequisites

- [Render Account](https://render.com) (free tier available)
- [GitHub Repository](https://github.com) with your CollabBridge code
- [Firebase Project](https://console.firebase.google.com)
- [Cloudinary Account](https://cloudinary.com)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Initial CollabBridge setup"
git push origin main
```

2. **Ensure your repository has the correct structure:**
```
your-repo/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   └── astro.config.mjs
└── README.md
```

## Step 2: Database Setup on Render

1. **Log into Render Dashboard**
2. **Click "New" → "PostgreSQL"**
3. **Configure database:**
   - **Name:** `collabbridge-db`
   - **Database:** `collabbridge`
   - **User:** `collabbridge_user`
   - **Region:** Choose closest to your users (e.g., Ohio)
   - **PostgreSQL Version:** 15
   - **Plan:** Free (upgrade later if needed)

4. **Click "Create Database"**
5. **Wait for provisioning (2-3 minutes)**
6. **Copy the Internal Database URL** (save this for Step 3)

## Step 3: Backend Deployment on Render

1. **Click "New" → "Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name:** `collabbridge-backend`
   - **Region:** Same as your database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Starter (free for 750 hours/month)

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" for each:

   ```bash
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://collabbridge_user:password@host:port/collabbridge
   JWT_SECRET=your-super-secret-jwt-key-here
   FRONTEND_URL=https://your-frontend-name.vercel.app
   
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
   
   LOG_LEVEL=info
   ```

5. **Click "Create Web Service"**
6. **Wait for deployment (5-10 minutes)**
7. **Note your backend URL:** `https://collabbridge-backend.onrender.com`

## Step 4: Initialize Database

1. **Go to your backend service dashboard**
2. **Click "Shell" tab**
3. **Run these commands:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Step 5: Frontend Deployment on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Framework Preset:** Astro
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   ```bash
   PUBLIC_API_URL=https://collabbridge-backend.onrender.com/api
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

6. **Click "Deploy"**
7. **Wait for deployment (3-5 minutes)**

## Step 6: Update Backend CORS

1. **Go back to your Render backend service**
2. **Update Environment Variables:**
   - **FRONTEND_URL:** Update with your actual Vercel URL

## Step 7: Firebase Configuration

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Select your project**
3. **Go to Authentication → Settings → Authorized domains**
4. **Add these domains:**
   - Your Vercel domain (e.g., `your-app.vercel.app`)
   - Your Render backend domain (e.g., `collabbridge-backend.onrender.com`)

## Step 8: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test user registration/login**
3. **Check backend health:** `https://collabbridge-backend.onrender.com/health`

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check FRONTEND_URL in backend environment variables
   - Ensure no trailing slashes in URLs

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check database is running in Render dashboard

3. **Firebase Auth:**
   - Verify all Firebase environment variables
   - Check authorized domains in Firebase console

4. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check file size limits

### Debug Mode:
Set `LOG_LEVEL=debug` in backend environment variables to see detailed logs.

## Monitoring and Scaling

1. **Monitor your services:**
   - Check Render dashboard for service health
   - Monitor logs for errors

2. **Scaling:**
   - Upgrade Render plans as needed
   - Consider Redis for session management
   - Add CDN for static assets

3. **Backups:**
   - Enable automated database backups in Render
   - Consider backup strategies for uploaded files

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Configure proper file upload limits
- [ ] Use secure database connections
