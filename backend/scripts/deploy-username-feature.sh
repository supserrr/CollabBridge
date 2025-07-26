#!/bin/bash

# Username Feature Deployment Script
# This script deploys the username feature to production

echo "🚀 Starting Username Feature Deployment..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the backend directory"
    exit 1
fi

# Check if Prisma schema has username field
if ! grep -q "username.*String" prisma/schema.prisma; then
    echo "❌ Error: Username field not found in Prisma schema"
    exit 1
fi

echo "✅ Verified Prisma schema contains username field"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built successfully"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Run database migration (commented out for safety)
# echo "🗄️ Running database migration..."
# npx prisma migrate deploy
# 
# if [ $? -ne 0 ]; then
#     echo "❌ Database migration failed"
#     exit 1
# fi
# 
# echo "✅ Database migration completed"

echo "📝 Username feature deployment preparation complete!"
echo ""
echo "⚠️  Manual steps required:"
echo "1. Run 'npx prisma migrate deploy' to apply database changes"
echo "2. Restart the production server"
echo "3. Test the new endpoints:"
echo "   - GET /api/profiles/check/:username"
echo "   - GET /api/profiles/:username"
echo ""
echo "🎯 Endpoints will be available at:"
echo "   - https://collabbridge.onrender.com/api/profiles/check/testuser"
echo "   - https://collabbridge.onrender.com/api/profiles/testuser"
