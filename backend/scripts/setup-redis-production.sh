#!/bin/bash

# Redis Production Setup Script for CollabBridge
# This script helps set up Redis for production deployment

echo "🔧 Redis Production Setup for CollabBridge"
echo "==========================================="
echo ""

echo "📋 Redis Provider Options:"
echo ""
echo "1. 🏆 Redis Cloud (Recommended)"
echo "   - Free 30MB tier"
echo "   - Highly reliable"
echo "   - Global network"
echo "   - URL: https://redis.com/redis-enterprise-cloud/"
echo ""
echo "2. ⚡ Upstash (Serverless)"
echo "   - Pay-per-use"
echo "   - Perfect for Render/Vercel"
echo "   - URL: https://upstash.com/"
echo ""
echo "3. 🚀 Railway Redis"
echo "   - If using Railway"
echo "   - Simple setup"
echo ""

echo "📝 Quick Setup Steps:"
echo ""
echo "1. Choose a Redis provider (Redis Cloud recommended)"
echo "2. Create a free Redis database"
echo "3. Copy the Redis URL"
echo "4. Add to Render environment variables:"
echo "   REDIS_URL=redis://username:password@host:port"
echo ""

echo "🔧 For Render.com deployment:"
echo "1. Go to your Render dashboard"
echo "2. Select your CollabBridge service"
echo "3. Go to Environment tab"
echo "4. Add new environment variable:"
echo "   Name: REDIS_URL"
echo "   Value: [your Redis URL]"
echo "5. Deploy again"
echo ""

echo "✅ After setup, you should see:"
echo "   '✅ Redis connected successfully' instead of"
echo "   '⚠️ Redis URL not provided'"
echo ""

# Create a test script to verify Redis connection
cat > test-redis-connection.js << 'EOF'
const { createClient } = require('redis');

async function testRedis() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL not found in environment');
    process.exit(1);
  }
  
  console.log('🔄 Testing Redis connection...');
  console.log('Redis URL:', redisUrl.replace(/:[^:]*@/, ':****@'));
  
  try {
    const client = createClient({ url: redisUrl });
    await client.connect();
    
    // Test basic operations
    await client.set('test-key', 'Hello Redis!');
    const value = await client.get('test-key');
    await client.del('test-key');
    
    console.log('✅ Redis connection successful!');
    console.log('✅ Basic operations working');
    console.log('📊 Test value retrieved:', value);
    
    await client.quit();
    process.exit(0);
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
    process.exit(1);
  }
}

testRedis();
EOF

echo "📄 Created test-redis-connection.js for testing"
echo ""
echo "🧪 To test your Redis connection locally:"
echo "   REDIS_URL='your-redis-url' node test-redis-connection.js"
echo ""

# Make the script executable
chmod +x "$0"

echo "🎯 Next Action: Set up your Redis provider and add REDIS_URL to Render!"
