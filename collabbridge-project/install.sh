#!/bin/bash

echo "🚀 Installing CollabBridge..."

# Backend installation
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Frontend installation
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Return to root
cd ..

echo "✅ CollabBridge installation complete!"
echo ""
echo "🔥 Next steps:"
echo "1. Set up your environment variables:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Copy frontend/.env.example to frontend/.env"
echo "   - Fill in your Firebase, Cloudinary, and database credentials"
echo ""
echo "2. Initialize database:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:push"
echo "   npm run prisma:seed"
echo ""
echo "3. Start development:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "4. For production deployment, see DEPLOYMENT.md"
