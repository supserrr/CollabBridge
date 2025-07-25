#!/bin/bash

# CollabBridge Backend Setup Script
# This script helps you set up Redis and Firebase configuration

echo "🚀 CollabBridge Backend Configuration Setup"
echo "==========================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please make sure you're in the backend directory and .env exists."
    exit 1
fi

echo ""
echo "📋 Current Configuration Status:"
echo "--------------------------------"

# Check database connection
if grep -q "DATABASE_URL=postgresql://collabbridge_user" .env; then
    echo "✅ Database: Production PostgreSQL configured"
else
    echo "⚠️  Database: Configuration may need review"
fi

# Check Redis configuration
if grep -q "REDIS_URL=redis://" .env && ! grep -q "REDIS_URL=$" .env; then
    echo "✅ Redis: Configured"
else
    echo "⚠️  Redis: Not configured (using memory fallback)"
fi

# Check Firebase configuration
if grep -q "FIREBASE_PRIVATE_KEY.*BEGIN PRIVATE KEY" .env && ! grep -q "PLACEHOLDER_PRIVATE_KEY" .env; then
    echo "✅ Firebase: Configured"
else
    echo "⚠️  Firebase: Incomplete configuration"
fi

echo ""
echo "🔧 Setup Options:"
echo "-----------------"
echo "1. Set up Redis (choose provider and add URL)"
echo "2. Complete Firebase setup (add private key)"
echo "3. Test current configuration"
echo "4. View setup guides"
echo "5. Exit"

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔴 Redis Setup Options:"
        echo "1. Redis Cloud (Recommended for production)"
        echo "2. Upstash Redis (Serverless)"
        echo "3. Local Redis (Development)"
        echo "4. Manual entry"
        
        read -p "Choose Redis provider (1-4): " redis_choice
        
        case $redis_choice in
            1)
                echo ""
                echo "📋 Redis Cloud Setup:"
                echo "1. Go to https://redis.com/redis-enterprise-cloud/"
                echo "2. Create free account and database"
                echo "3. Copy the connection URL"
                echo "4. Format: redis://default:password@host:port"
                ;;
            2)
                echo ""
                echo "📋 Upstash Redis Setup:"
                echo "1. Go to https://upstash.com/"
                echo "2. Create database"
                echo "3. Copy the Redis URL"
                echo "4. Format: rediss://default:password@region.upstash.io:6379"
                ;;
            3)
                echo ""
                echo "📋 Local Redis Setup:"
                echo "1. Install: brew install redis (macOS) or apt install redis-server (Ubuntu)"
                echo "2. Start: redis-server"
                echo "3. Use: redis://localhost:6379"
                
                if command -v redis-server >/dev/null 2>&1; then
                    echo "✅ Redis is already installed locally"
                    read -p "Add redis://localhost:6379 to .env? (y/n): " local_redis
                    if [ "$local_redis" = "y" ]; then
                        sed -i '' 's/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/' .env
                        echo "✅ Local Redis URL added to .env"
                    fi
                else
                    echo "❌ Redis not found. Please install it first."
                fi
                ;;
            4)
                read -p "Enter your Redis URL: " redis_url
                if [ ! -z "$redis_url" ]; then
                    sed -i '' "s|REDIS_URL=.*|REDIS_URL=$redis_url|" .env
                    echo "✅ Redis URL updated in .env"
                fi
                ;;
        esac
        ;;
        
    2)
        echo ""
        echo "🔥 Firebase Setup:"
        echo "1. Go to https://console.firebase.google.com/"
        echo "2. Select project: collabbridge-2c528"
        echo "3. Project Settings → Service Accounts"
        echo "4. Generate new private key"
        echo "5. Download the JSON file"
        echo ""
        echo "📋 Required fields from the JSON:"
        echo "- private_key (the long key with -----BEGIN PRIVATE KEY-----)"
        echo "- client_email (firebase-adminsdk-xxxxx@collabbridge-2c528.iam.gserviceaccount.com)"
        echo ""
        read -p "Do you have the service account JSON file? (y/n): " has_json
        
        if [ "$has_json" = "y" ]; then
            read -p "Enter the client_email from JSON: " client_email
            echo ""
            echo "Enter the private_key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----):"
            echo "Paste the entire key and press Enter twice when done:"
            
            private_key=""
            while IFS= read -r line; do
                if [ -z "$line" ]; then
                    break
                fi
                private_key="$private_key$line\n"
            done
            
            if [ ! -z "$client_email" ] && [ ! -z "$private_key" ]; then
                # Update .env file
                sed -i '' "s|FIREBASE_CLIENT_EMAIL=.*|FIREBASE_CLIENT_EMAIL=$client_email|" .env
                sed -i '' "s|FIREBASE_PRIVATE_KEY=.*|FIREBASE_PRIVATE_KEY=\"$private_key\"|" .env
                echo "✅ Firebase configuration updated in .env"
            fi
        else
            echo "📖 Please follow the Firebase setup guide in docs/FIREBASE_SETUP_GUIDE.md"
        fi
        ;;
        
    3)
        echo ""
        echo "🧪 Testing Configuration:"
        echo "-------------------------"
        
        # Test server startup
        echo "Starting server test..."
        if pgrep -f "ts-node src/server.ts" > /dev/null; then
            echo "✅ Server is currently running"
            
            # Test health endpoint
            echo "Testing health endpoint..."
            if curl -s http://localhost:5001/health > /dev/null; then
                echo "✅ Health endpoint responding"
            else
                echo "❌ Health endpoint not responding"
            fi
            
            # Test portfolio endpoint
            echo "Testing portfolio endpoint..."
            if curl -s http://localhost:5001/api/portfolio/testuser | grep -q "Portfolio not found"; then
                echo "✅ Portfolio API working (returns expected 404)"
            else
                echo "❌ Portfolio API not responding correctly"
            fi
        else
            echo "❌ Server is not running"
            echo "Run: npm run dev"
        fi
        ;;
        
    4)
        echo ""
        echo "📚 Setup Guides Available:"
        echo "--------------------------"
        echo "1. docs/FIREBASE_SETUP_GUIDE.md - Complete Firebase configuration"
        echo "2. docs/REDIS_SETUP_GUIDE.md - Redis provider options and setup"
        echo "3. docs/PORTFOLIO_API.md - API endpoint documentation"
        echo "4. docs/SETUP_COMPLETE.md - Overall setup status"
        echo ""
        read -p "Open a guide? Enter filename or press Enter to skip: " guide_file
        if [ ! -z "$guide_file" ] && [ -f "docs/$guide_file" ]; then
            cat "docs/$guide_file"
        fi
        ;;
        
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔄 Next Steps:"
echo "1. Restart the server: npm run dev"
echo "2. Check logs for configuration status"
echo "3. Test endpoints with curl or Postman"
echo ""
echo "📖 For detailed guides, see docs/ directory"
