#!/bin/bash

# Verify Redis setup in production
echo "🔍 Checking CollabBridge Redis Setup..."
echo "======================================"
echo ""

# Check health endpoint
echo "📊 Checking health endpoint..."
HEALTH_RESPONSE=$(curl -s https://collabbridge.onrender.com/health)

if [[ $? -eq 0 ]]; then
    echo "✅ Health endpoint accessible"
    
    # Check Redis status in response
    REDIS_STATUS=$(echo "$HEALTH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    redis_service = data.get('services', {}).get('redis', {})
    status = redis_service.get('status', 'unknown')
    print(status)
except:
    print('error')
")
    
    echo "📡 Redis Status: $REDIS_STATUS"
    
    if [[ "$REDIS_STATUS" == "healthy" ]]; then
        echo "🎉 SUCCESS! Redis is connected and working!"
        echo ""
        echo "🚀 Performance Benefits Now Active:"
        echo "   ✅ Database query caching"
        echo "   ✅ Persistent analytics"
        echo "   ✅ Better rate limiting"
        echo "   ✅ Session persistence"
        echo ""
        
        # Show detailed Redis info
        echo "📊 Redis Details:"
        echo "$HEALTH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    redis_service = data.get('services', {}).get('redis', {})
    print(f'   Response Time: {redis_service.get(\"responseTime\", \"N/A\")}ms')
    details = redis_service.get('details', {})
    for key, value in details.items():
        print(f'   {key.title()}: {value}')
except Exception as e:
    print(f'   Error parsing details: {e}')
"
        
    elif [[ "$REDIS_STATUS" == "degraded" ]]; then
        echo "⚠️  Redis still in degraded mode"
        echo ""
        echo "🔧 Troubleshooting steps:"
        echo "   1. Verify REDIS_URL was added to Render environment"
        echo "   2. Check if deployment completed (may take 5-10 minutes)"
        echo "   3. Verify Redis URL format is correct"
        echo "   4. Check Render logs for connection errors"
        echo ""
        echo "💡 Redis URL should be:"
        echo "   redis://default:password@host:port"
        
    else
        echo "❌ Unexpected Redis status: $REDIS_STATUS"
        echo ""
        echo "🔍 Full health response:"
        echo "$HEALTH_RESPONSE" | python3 -m json.tool
    fi
    
else
    echo "❌ Could not reach health endpoint"
    echo "   This might mean the app is still deploying..."
    echo "   Wait a few minutes and try again"
fi

echo ""
echo "🔗 Manual check: https://collabbridge.onrender.com/health"
echo "📱 Dashboard: https://dashboard.render.com/"
