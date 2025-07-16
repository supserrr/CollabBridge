#!/bin/bash
echo "🗄️  Running database migrations..."
cd backend
npx prisma migrate deploy
echo "✅ Migrations completed"
