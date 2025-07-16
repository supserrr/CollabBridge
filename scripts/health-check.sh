#!/bin/bash
echo "🏥 Checking application health..."

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4321}"

# Check backend health
echo "Checking backend at $BACKEND_URL/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is unhealthy (Status: $BACKEND_STATUS)"
fi

# Check frontend health
echo "Checking frontend at $FRONTEND_URL"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is unhealthy (Status: $FRONTEND_STATUS)"
fi
