#!/bin/bash
echo "🌱 Seeding database..."
cd backend
npx prisma db seed
echo "✅ Database seeded"
