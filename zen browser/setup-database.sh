#!/bin/bash

set -e

echo "🗄️  Setting up CollabBridge database..."

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in backend directory"
    echo "Please copy .env.example to .env and configure your database URL"
    exit 1
fi

# Source environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

echo "🔄 Generating Prisma client..."
npm run prisma:generate

echo "🔄 Pushing database schema..."
npm run prisma:push

echo "🌱 Seeding database..."
npm run prisma:seed

echo "✅ Database setup complete!"
echo ""
echo "🎉 You can now start the backend server:"
echo "cd backend && npm run dev"
