#!/bin/bash

echo "⚡ CollabBridge Quick Start"
echo "=========================="

# Check if this is first run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env" ]; then
    echo "🔧 First time setup detected..."
    ./deploy.sh
    echo ""
fi

echo "🚀 Choose an option:"
echo "1. Start development servers"
echo "2. Set up database"
echo "3. Build for production"
echo "4. View deployment guide"
echo "5. Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting development servers..."
        ./start-dev.sh
        ;;
    2)
        echo "🗄️  Setting up database..."
        ./setup-database.sh
        ;;
    3)
        echo "🏗️  Building for production..."
        ./build.sh
        ;;
    4)
        echo "📖 Opening deployment guide..."
        if command -v code >/dev/null 2>&1; then
            code RENDER_DEPLOYMENT_STEPS.md
        elif command -v nano >/dev/null 2>&1; then
            nano RENDER_DEPLOYMENT_STEPS.md
        else
            cat RENDER_DEPLOYMENT_STEPS.md
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
