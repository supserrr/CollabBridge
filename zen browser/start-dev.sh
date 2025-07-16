#!/bin/bash

echo "🚀 Starting CollabBridge in development mode..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT

# Start backend
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

cd ..

echo ""
echo "🎉 Development servers started!"
echo "📡 Backend: http://localhost:3000"
echo "🎨 Frontend: http://localhost:4321"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
