#!/bin/bash

set -e

echo "🚀 Starting CollabBridge deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo "❌ This script must be run from the CollabBridge project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "🔍 Checking required tools..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Install dependencies
echo "📦 Installing dependencies..."

# Backend dependencies
echo "  Installing backend dependencies..."
cd backend
npm install
echo "  ✅ Backend dependencies installed"

# Frontend dependencies
echo "  Installing frontend dependencies..."
cd ../frontend
npm install
echo "  ✅ Frontend dependencies installed"

cd ..

# Check environment variables
echo "🔧 Checking environment variables..."

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "  📝 Please update backend/.env with your actual values"
fi

# Check frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Copying from .env.example..."
    cp frontend/.env.example frontend/.env
    echo "  📝 Please update frontend/.env with your actual values"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
cd backend
npm run prisma:generate
echo "  ✅ Prisma client generated"

# Check if DATABASE_URL is set properly
if grep -q "postgresql://username:password" .env; then
    echo "  ⚠️  Please update DATABASE_URL in backend/.env with your actual database credentials"
    echo "  Example: postgresql://user:password@localhost:5432/collabbridge"
else
    echo "  ✅ DATABASE_URL appears to be configured"
fi

cd ..

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in backend/.env and frontend/.env"
echo "2. Set up your database (PostgreSQL)"
echo "3. Run database migrations: cd backend && npm run prisma:push"
echo "4. Seed the database: cd backend && npm run prisma:seed"
echo "5. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "For production deployment, see RENDER_DEPLOYMENT_GUIDE.md"
