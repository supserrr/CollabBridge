#!/bin/bash

# Script to move frontend to root level for easier Vercel deployment

echo "Moving frontend files to root level..."

# Create backup
cp -r frontend frontend_backup

# Move all frontend files to root
mv frontend/* .
mv frontend/.* . 2>/dev/null || true

# Remove empty frontend directory
rmdir frontend

# Update package.json scripts
echo "Updating package.json scripts..."

# Remove the old root package.json and use the frontend one
rm package.json

echo "Frontend moved to root level!"
echo "You can now deploy directly to Vercel."
echo ""
echo "To restore: mv frontend_backup frontend && rm -rf src components public *.json *.mjs"
