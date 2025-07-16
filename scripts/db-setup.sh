#!/bin/bash

# Navigate to backend directory
cd backend

# Run database migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

echo "✅ Database setup completed successfully!"
