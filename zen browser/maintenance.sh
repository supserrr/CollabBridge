#!/bin/bash

echo "🔧 CollabBridge Maintenance Tools"
echo "=================================="

echo "1. Update dependencies"
echo "2. Clean build files"
echo "3. Reset database"
echo "4. Generate new migration"
echo "5. Backup database"
echo "6. View logs"
echo "7. Exit"

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo "📦 Updating dependencies..."
        cd backend && npm update && cd ../frontend && npm update && cd ..
        echo "✅ Dependencies updated"
        ;;
    2)
        echo "🧹 Cleaning build files..."
        rm -rf backend/dist frontend/dist backend/logs/*.log
        echo "✅ Build files cleaned"
        ;;
    3)
        echo "⚠️  This will delete all data. Are you sure? (y/N)"
        read -p "" confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            cd backend
            npx prisma db push --force-reset
            npm run prisma:seed
            cd ..
            echo "✅ Database reset and seeded"
        else
            echo "❌ Operation cancelled"
        fi
        ;;
    4)
        read -p "Enter migration name: " migration_name
        cd backend
        npx prisma migrate dev --name "$migration_name"
        cd ..
        echo "✅ Migration created"
        ;;
    5)
        echo "💾 Database backup not implemented yet"
        echo "Please use your database provider's backup tools"
        ;;
    6)
        echo "📋 Recent backend logs:"
        if [ -f "backend/logs/combined.log" ]; then
            tail -n 20 backend/logs/combined.log
        else
            echo "No log file found"
        fi
        ;;
    7)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
