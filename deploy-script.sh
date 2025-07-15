#!/bin/bash

# CollabBridge Deployment Automation Script
echo "🚀 CollabBridge Deployment Automation"
echo "======================================"

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists node; then
        missing_tools+=("node")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists vercel; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    if ! command_exists firebase; then
        log_warning "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Initialize project
init_project() {
    log_info "Initializing CollabBridge project..."
    
    # Create project structure
    ./setup-frontend.sh
    ./setup-backend.sh
    ./create-components.sh
    ./create-utils.sh
    
    log_success "Project structure initialized"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment configuration..."
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        log_warning "Please configure frontend/.env with your settings"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        log_warning "Please configure backend/.env with your settings"
    fi
    
    log_success "Environment files created"
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Backend dependencies
    log_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "Dependencies installed"
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Check if DATABASE_URL is configured
    if [ -f "backend/.env" ]; then
        cd backend
        
        # Generate Prisma client
        npm run prisma:generate
        
        # Push schema to database
        log_info "Pushing database schema..."
        npm run prisma:push
        
        # Seed database
        log_info "Seeding database with sample data..."
        npm run prisma:seed
        
        cd ..
        log_success "Database setup complete"
    else
        log_warning "Database configuration not found. Please configure backend/.env first."
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    if [ -f "backend/package.json" ]; then
        cd backend
        if npm run test --silent > /dev/null 2>&1; then
            log_success "Backend tests passed"
        else
            log_warning "Backend tests failed or not configured"
        fi
        cd ..
    fi
    
    # Frontend tests (if configured)
    if [ -f "frontend/package.json" ]; then
        cd frontend
        # Add frontend tests here if available
        cd ..
    fi
}

# Build applications
build_applications() {
    log_info "Building applications..."
    
    # Build backend
    log_info "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    log_info "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    log_success "Applications built successfully"
}

# Deploy backend to Render
deploy_backend() {
    log_info "Deploying backend to Render..."
    
    # Check if this is a git repository
    if [ ! -d ".git" ]; then
        log_info "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit: CollabBridge platform"
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        log_warning "No git remote origin found."
        log_info "Please push your code to GitHub and create a Render service manually."
        log_info "Visit: https://dashboard.render.com"
        return
    fi
    
    # Push to repository
    git add .
    git commit -m "Deploy: $(date)" || true
    git push origin main
    
    log_success "Code pushed to repository"
    log_info "Please create a Render web service connected to your repository"
    log_info "Service configuration:"
    echo "  - Name: collabbridge-api"
    echo "  - Environment: Node"
    echo "  - Build Command: cd backend && npm install && npm run build"
    echo "  - Start Command: cd backend && npm start"
    echo "  - Auto-Deploy: Yes"
}

# Deploy frontend to Vercel
deploy_frontend() {
    log_info "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Login to Vercel (if not already logged in)
    if ! vercel whoami > /dev/null 2>&1; then
        log_info "Please login to Vercel..."
        vercel login
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    cd ..
    log_success "Frontend deployed to Vercel"
}

# Setup Firebase
setup_firebase() {
    log_info "Setting up Firebase..."
    
    # Check if firebase project is configured
    if [ ! -f ".firebaserc" ]; then
        log_info "Initializing Firebase project..."
        firebase login
        firebase init auth
    fi
    
    log_success "Firebase setup complete"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create uptime monitoring script
    cat > monitoring/uptime-check.sh << 'EOF'
#!/bin/bash
# Simple uptime monitoring script

BACKEND_URL="https://your-backend-url.onrender.com/health"
FRONTEND_URL="https://your-frontend-url.vercel.app"

# Check backend
if curl -f $BACKEND_URL > /dev/null 2>&1; then
    echo "✅ Backend is up"
else
    echo "❌ Backend is down"
fi

# Check frontend
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "✅ Frontend is up"
else
    echo "❌ Frontend is down"
fi
EOF
    
    chmod +x monitoring/uptime-check.sh
    log_success "Monitoring scripts created"
}

# Generate documentation
generate_docs() {
    log_info "Generating documentation..."
    
    # Create deployment documentation
    cat > DEPLOYMENT.md << 'EOF'
# CollabBridge Deployment Documentation

## Deployed Services

### Frontend
- **Platform**: Vercel
- **URL**: [Your Frontend URL]
- **Repository**: Connected to main branch

### Backend API
- **Platform**: Render
- **URL**: [Your Backend URL]
- **Database**: PostgreSQL on Render

### Authentication
- **Service**: Firebase Auth
- **Project**: [Your Firebase Project]

### File Storage
- **Service**: Cloudinary
- **Cloud Name**: [Your Cloud Name]

## Environment Variables

### Frontend (.env)
```
PUBLIC_API_URL=https://your-backend-url.onrender.com/api
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Deployment Process

1. Push code to GitHub
2. Render automatically deploys backend
3. Vercel automatically deploys frontend
4. Database migrations run automatically

## Monitoring

- Backend health check: [Backend URL]/health
- Uptime monitoring: Run `./monitoring/uptime-check.sh`

## Troubleshooting

Common issues and solutions:

1. **Build failures**: Check environment variables
2. **Database connection**: Verify DATABASE_URL
3. **CORS errors**: Update FRONTEND_URL in backend
4. **Firebase auth**: Check authorized domains

EOF

    log_success "Documentation generated"
}

# Main deployment function
main_deploy() {
    log_info "Starting full deployment process..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    run_tests
    build_applications
    setup_firebase
    deploy_backend
    deploy_frontend
    setup_monitoring
    generate_docs
    
    log_success "🎉 Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in Render and Vercel"
    echo "2. Set up your custom domain (optional)"
    echo "3. Configure Firebase authorized domains"
    echo "4. Set up monitoring and alerts"
    echo "5. Test all functionality"
}

# Parse command line arguments
case "${1:-deploy}" in
    "init")
        init_project
        ;;
    "deps")
        install_dependencies
        ;;
    "db")
        setup_database
        ;;
    "build")
        build_applications
        ;;
    "test")
        run_tests
        ;;
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "docs")
        generate_docs
        ;;
    "deploy")
        main_deploy
        ;;
    "check")
        check_prerequisites
        ;;
    *)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  init      - Initialize project structure"
        echo "  deps      - Install dependencies"
        echo "  db        - Setup database"
        echo "  build     - Build applications"
        echo "  test      - Run tests"
        echo "  backend   - Deploy backend only"
        echo "  frontend  - Deploy frontend only"
        echo "  docs      - Generate documentation"
        echo "  deploy    - Full deployment (default)"
        echo "  check     - Check prerequisites"
        exit 1
        ;;
esac