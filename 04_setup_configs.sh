#!/bin/bash

# CollabBridge - Configuration Files Setup
echo "⚙️ Setting up CollabBridge configuration files..."

cd collabbridge-project

# Create root .gitignore
echo "🙈 Creating root .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.astro/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary folders
tmp/
temp/

# Cache
.cache
.parcel-cache
.eslintcache

# Deployment
.vercel
.render

# Database
*.db
*.sqlite
EOF

# Create comprehensive README.md
echo "📖 Creating README.md..."
cat > README.md << 'EOF'
# CollabBridge

A platform connecting event planners with talented creative professionals.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Firebase Account
- Cloudinary Account

### Installation

1. **Clone and Setup**
```bash
git clone <your-repo>
cd collabbridge-project
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with your credentials
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file with your credentials
npm run dev
```

## 📚 Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-token` - Verify Firebase token

#### Events
- `GET /api/events` - Get public events
- `POST /api/events` - Create event (Event Planners only)
- `GET /api/events/my/events` - Get my events

#### Search
- `GET /api/search/professionals` - Search creative professionals
- `GET /api/search/events` - Search events

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma + PostgreSQL
- Firebase Authentication
- Socket.IO for real-time features
- Cloudinary for file storage

**Frontend:**
- Astro + React + TypeScript
- Tailwind CSS
- Firebase Client SDK
- Zustand for state management

### Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL on Render
- **Authentication**: Firebase
- **File Storage**: Cloudinary

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.
EOF

# Create DEPLOYMENT.md
echo "🚀 Creating DEPLOYMENT.md..."
cat > DEPLOYMENT.md << 'EOF'
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
EOF

# Create docker-compose.yml for local development
echo "🐳 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: collabbridge-postgres
    environment:
      POSTGRES_USER: collabbridge_user
      POSTGRES_PASSWORD: collabbridge_password
      POSTGRES_DB: collabbridge
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - collabbridge-network

  redis:
    image: redis:7-alpine
    container_name: collabbridge-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - collabbridge-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: collabbridge-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://collabbridge_user:collabbridge_password@postgres:5432/collabbridge
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - collabbridge-network
    command: npm run dev

volumes:
  postgres_data:
  redis_data:

networks:
  collabbridge-network:
    driver: bridge
EOF

# Create .editorconfig
echo "✏️ Creating .editorconfig..."
cat > .editorconfig << 'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,astro}]
indent_size = 2

[*.{md,mdx}]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
EOF

# Create VS Code workspace settings
echo "💻 Creating .vscode/settings.json..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "astro.format.enable": true,
  "files.associations": {
    "*.astro": "astro"
  },
  "emmet.includeLanguages": {
    "astro": "html"
  },
  "tailwindCSS.includeLanguages": {
    "astro": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["classnames\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
EOF

# Create VS Code extensions recommendations
echo "🔌 Creating .vscode/extensions.json..."
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "astro-build.astro-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-markdown",
    "yzhang.markdown-all-in-one",
    "prisma.prisma",
    "ms-vscode.vscode-docker",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "visualstudioexptteam.vscodeintellicode"
  ]
}
EOF

echo "✅ Configuration files setup complete!"
echo ""
echo "📋 What was created:"
echo "• Root .gitignore for the entire project"
echo "• Comprehensive README.md with setup instructions"
echo "• DEPLOYMENT.md with detailed deployment guide"
echo "• docker-compose.yml for local development"
echo "• .editorconfig for consistent code formatting"
echo "• .vscode/ settings for optimal development experience"
echo ""
echo "🔥 Your project is now fully configured!"