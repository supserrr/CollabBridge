#!/bin/bash

set -e

echo "🏗️  Building CollabBridge for production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf backend/dist
rm -rf frontend/dist

# Build backend
echo "📦 Building backend..."
cd backend
npm run build
echo "✅ Backend built successfully"

# Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm run build
echo "✅ Frontend built successfully"

cd ..

echo "🎉 Production build complete!"
echo ""
echo "Built files:"
echo "  Backend: backend/dist/"
echo "  Frontend: frontend/dist/"
