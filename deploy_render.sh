#!/bin/bash

# CollabBridge Render Deployment Script
echo "🚀 Deploying CollabBridge to Render..."

# Check if required environment variables are set
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$DATABASE_URL" ]; then
        missing_vars+=("DATABASE_URL")
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars+=("JWT_SECRET")
    fi
    
    if [ -z "$FIREBASE_PROJECT_ID" ]; then
        missing_vars+=("FIREBASE_PROJECT_ID")
    fi
    
    if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
        missing_vars+=("CLOUDINARY_CLOUD_NAME")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables before deploying."
        exit 1
    fi
}

# Create deployment configuration
create_deployment_config() {
    echo "📝 Creating deployment configuration..."
    
    # Create render.yaml for infrastructure as code
    cat > render.yaml << 'EOF'
services:
  - type: web
    name: collabbridge-backend
    env: node
    plan: starter
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: collabbridge-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: FRONTEND_URL
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: EMAIL_HOST
        value: smtp.gmail.com
      - key: EMAIL_PORT
        value: 587
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: MAX_FILE_SIZE
        value: 10485760
      - key: ALLOWED_FILE_TYPES
        value: jpg,jpeg,png,gif,webp,pdf,doc,docx
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 1000
      - key: LOG_LEVEL
        value: info
      - key: CORS_ORIGIN
        sync: false

databases:
  - name: collabbridge-db
    databaseName: collabbridge
    user: collabbridge_user
    plan: free
EOF

    # Create package.json scripts for deployment
    echo "📦 Updating package.json for deployment..."
    
    # Update backend package.json with deployment scripts
    cd backend
    npm pkg set scripts.deploy="npm run build"
    npm pkg set scripts.start="node dist/server.js"
    npm pkg set scripts.postbuild="npx prisma migrate deploy"
    cd ..
    
    echo "✅ Deployment configuration created"
}

# Prepare repository for deployment
prepare_repository() {
    echo "📋 Preparing repository for deployment..."
    
    # Create .gitignore if it doesn't exist
    if [ ! -f .gitignore ]; then
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.astro/

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

# Database
*.sqlite
*.db

# Uploads
uploads/
EOF
    fi
    
    # Create README.md with deployment instructions
    cat > README.md << 'EOF'
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
EOF

    echo "✅ Repository prepared for deployment"
}

# Create deployment scripts
create_deployment_scripts() {
    echo "📜 Creating deployment scripts..."
    
    mkdir -p scripts
    
    # Create database migration script
    cat > scripts/migrate.sh << 'EOF'
#!/bin/bash
echo "🗄️  Running database migrations..."
cd backend
npx prisma migrate deploy
echo "✅ Migrations completed"
EOF

    # Create seed script
    cat > scripts/seed.sh << 'EOF'
#!/bin/bash
echo "🌱 Seeding database..."
cd backend
npx prisma db seed
echo "✅ Database seeded"
EOF

    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
echo "💾 Creating database backup..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
EOF

    # Create health check script
    cat > scripts/health-check.sh << 'EOF'
#!/bin/bash
echo "🏥 Checking application health..."

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4321}"

# Check backend health
echo "Checking backend at $BACKEND_URL/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is unhealthy (Status: $BACKEND_STATUS)"
fi

# Check frontend health
echo "Checking frontend at $FRONTEND_URL"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is unhealthy (Status: $FRONTEND_STATUS)"
fi
EOF

    chmod +x scripts/*.sh
    echo "✅ Deployment scripts created"
}

# Create docker-compose for local development
create_docker_compose() {
    echo "🐳 Creating Docker Compose configuration..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: collabbridge-db
    environment:
      POSTGRES_DB: collabbridge
      POSTGRES_USER: collabbridge_user
      POSTGRES_PASSWORD: collabbridge_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - collabbridge-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: collabbridge-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - collabbridge-network
    restart: unless-stopped

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
      - FRONTEND_URL=http://localhost:4321
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - collabbridge-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: collabbridge-frontend
    ports:
      - "4321:80"
    depends_on:
      - backend
    networks:
      - collabbridge-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  collabbridge-network:
    driver: bridge
EOF

    echo "✅ Docker Compose configuration created"
}

# Validate deployment readiness
validate_deployment() {
    echo "🔍 Validating deployment readiness..."
    
    # Check if required files exist
    required_files=(
        "backend/package.json"
        "backend/tsconfig.json"
        "backend/prisma/schema.prisma"
        "backend/src/server.ts"
        "frontend/package.json"
        "frontend/astro.config.mjs"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Missing required file: $file"
            exit 1
        fi
    done
    
    # Check backend dependencies
    cd backend
    if ! npm list --depth=0 > /dev/null 2>&1; then
        echo "❌ Backend dependencies not installed. Run 'cd backend && npm install'"
        exit 1
    fi
    cd ..
    
    # Check frontend dependencies
    cd frontend
    if ! npm list --depth=0 > /dev/null 2>&1; then
        echo "❌ Frontend dependencies not installed. Run 'cd frontend && npm install'"
        exit 1
    fi
    cd ..
    
    echo "✅ Deployment validation passed"
}

# Deploy to Render
deploy_to_render() {
    echo "🚀 Deploying to Render..."
    
    # Check if git repository exists
    if [ ! -d ".git" ]; then
        echo "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit for CollabBridge deployment"
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo "❌ No git remote 'origin' found."
        echo "Please add your GitHub repository as origin:"
        echo "git remote add origin https://github.com/yourusername/collabbridge.git"
        echo "git push -u origin main"
        exit 1
    fi
    
    # Push to repository
    echo "📤 Pushing to repository..."
    git add .
    git commit -m "Deploy CollabBridge to Render" || echo "No changes to commit"
    git push origin main
    
    echo "✅ Code pushed to repository"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://render.com and sign in"
    echo "2. Click 'New' → 'PostgreSQL' to create database"
    echo "3. Click 'New' → 'Web Service' to deploy backend"
    echo "4. Connect your GitHub repository"
    echo "5. Configure environment variables"
    echo "6. Deploy!"
    echo ""
    echo "📖 For detailed instructions, see RENDER_DEPLOYMENT_STEPS.md"
}

# Main execution
main() {
    echo "🚀 CollabBridge Render Deployment Script"
    echo "========================================"
    echo ""
    
    create_deployment_config
    prepare_repository
    create_deployment_scripts
    create_docker_compose
    validate_deployment
    deploy_to_render
    
    echo ""
    echo "🎉 Deployment preparation completed!"
    echo ""
    echo "📋 Summary:"
    echo "- Created render.yaml for infrastructure as code"
    echo "- Updated package.json with deployment scripts"
    echo "- Created comprehensive README.md"
    echo "- Generated deployment helper scripts"
    echo "- Set up Docker Compose for local development"
    echo "- Validated deployment readiness"
    echo "- Pushed code to repository"
    echo ""
    echo "🔗 Useful links:"
    echo "- Render Dashboard: https://dashboard.render.com"
    echo "- Firebase Console: https://console.firebase.google.com"
    echo "- Cloudinary Dashboard: https://cloudinary.com/console"
    echo ""
    echo "📧 Need help? Contact: support@collabbridge.com"
}

# Run main function
main "$@"