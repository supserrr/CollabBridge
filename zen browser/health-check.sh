#!/bin/bash

echo "🏥 CollabBridge Health Check"
echo "============================"

# Default URLs (can be overridden with environment variables)
BACKEND_URL=${BACKEND_URL:-"http://localhost:3000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:4321"}

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "200" ]; then
            echo "✅ OK"
            return 0
        else
            echo "❌ Failed (HTTP $response)"
            return 1
        fi
    else
        echo "⚠️  curl not available, skipping..."
        return 1
    fi
}

# Check backend health
check_url "$BACKEND_URL/health" "Backend"
backend_status=$?

# Check frontend (basic availability)
check_url "$FRONTEND_URL" "Frontend"
frontend_status=$?

# Check database (via backend API)
echo -n "Checking Database... "
if [ $backend_status -eq 0 ]; then
    # Try to call an API endpoint that requires database
    db_response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/verify-token" 2>/dev/null)
    if [ "$db_response" = "400" ] || [ "$db_response" = "401" ]; then
        echo "✅ OK (API responding)"
    else
        echo "⚠️  May have issues (HTTP $db_response)"
    fi
else
    echo "❌ Cannot check (backend down)"
fi

echo ""
echo "📊 Summary:"
echo "Backend:  $([ $backend_status -eq 0 ] && echo "✅ Healthy" || echo "❌ Down")"
echo "Frontend: $([ $frontend_status -eq 0 ] && echo "✅ Healthy" || echo "❌ Down")"
echo ""

if [ $backend_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    echo "🎉 All systems operational!"
    exit 0
else
    echo "⚠️  Some issues detected. Check logs for details."
    exit 1
fi
