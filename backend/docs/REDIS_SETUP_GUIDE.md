# Redis Setup Guide for CollabBridge

## Current Status
⚠️ Using memory cache fallback (development only)  
🎯 Goal: Set up Redis for production caching and session management

## Redis Options

### Option 1: Redis Cloud (Recommended for Production)
**Free tier available** - Perfect for getting started

1. **Sign up**: Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. **Create Database**:
   - Database Name: `collabbridge-cache`
   - Cloud Provider: AWS/GCP (your choice)
   - Region: Choose closest to your users
   - Memory: 30MB (free tier)

3. **Get Connection Details**:
   ```
   Endpoint: redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:12345
   Username: default
   Password: your-password
   ```

4. **Add to .env**:
   ```env
   REDIS_URL=redis://default:your-password@redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:12345
   ```

### Option 2: Upstash Redis (Serverless)
**Great for serverless deployments**

1. **Sign up**: Go to [Upstash](https://upstash.com/)
2. **Create Database**: Click "Create Database"
3. **Get URL**: Copy the Redis URL from dashboard
4. **Add to .env**:
   ```env
   REDIS_URL=rediss://default:password@region.upstash.io:6379
   ```

### Option 3: Railway Redis
**If you're using Railway for deployment**

1. **Add Redis Service**: In your Railway project
2. **Get Connection URL**: From service variables
3. **Add to .env**:
   ```env
   REDIS_URL=redis://default:password@hostname:port
   ```

### Option 4: Local Redis (Development)
**For local development only**

1. **Install Redis**:
   ```bash
   # macOS
   brew install redis
   
   # Ubuntu/Debian
   sudo apt install redis-server
   ```

2. **Start Redis**:
   ```bash
   redis-server
   ```

3. **Add to .env**:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

## What Redis Provides for CollabBridge

### 1. Session Management
- User session storage
- JWT token blacklisting
- Rate limiting counters

### 2. Caching
- Database query caching
- API response caching
- Portfolio view counters

### 3. Real-time Features
- Socket.io session store
- Message queuing
- Notification delivery

## Current Backend Integration

Your backend already supports Redis:

### ✅ Configured Services:
- **Cache Service**: Uses Redis when available, memory fallback
- **Rate Limiting**: Can use Redis for distributed rate limiting
- **Session Storage**: Ready for Redis session store

### ✅ Graceful Fallback:
- Continues operation without Redis
- Uses memory cache for development
- Logs warnings when Redis unavailable

## Configuration Files

### Current Redis Config (`src/config/redis.ts`)
```typescript
export const connectRedis = async (): Promise<void> => {
  if (!process.env.REDIS_URL) {
    logger.info('Redis URL not provided. Using memory cache fallback.');
    return;
  }
  
  // Redis connection logic here
};
```

### Cache Service (`src/services/CacheService.ts`)
```typescript
class CacheService {
  // Automatically uses Redis when available
  // Falls back to memory cache when Redis unavailable
}
```

## Testing Redis Connection

### 1. Add Redis URL to .env
```env
REDIS_URL=your-redis-connection-url
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Check Logs
Look for:
✅ `✅ Redis connected successfully`

Instead of:
⚠️ `Redis URL not provided in development. Using memory cache fallback.`

### 4. Test Cache Operations
```bash
# Test cache endpoint
curl http://localhost:5001/health

# Check the cache section in health response
```

## Production Benefits

### With Redis Configured:
- 🚀 **Better Performance**: Cached database queries
- 📊 **Accurate Analytics**: Persistent view counters
- 🔄 **Session Persistence**: Users stay logged in across server restarts
- 🌍 **Scalability**: Multiple server instances can share cache
- ⚡ **Rate Limiting**: Distributed rate limiting across instances

### Without Redis (Current):
- ⚠️ **Memory Only**: Cache cleared on server restart
- ⚠️ **Single Instance**: Can't scale horizontally
- ⚠️ **Limited Features**: Some advanced features disabled

## Environment Variables Summary

Add to your `.env` file:
```env
# Redis Configuration
REDIS_URL=redis://username:password@host:port

# For Redis Cloud:
REDIS_URL=redis://default:password@redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:12345

# For Upstash:
REDIS_URL=rediss://default:password@region.upstash.io:6379

# For Railway:
REDIS_URL=redis://default:password@hostname:port

# For local development:
REDIS_URL=redis://localhost:6379
```

## Next Steps

1. **Choose Redis Provider**: Pick one of the options above
2. **Create Redis Instance**: Follow provider-specific setup
3. **Add REDIS_URL**: Update your `.env` file
4. **Test Connection**: Restart server and verify logs
5. **Deploy**: Add Redis URL to production environment variables

## Monitoring Redis

### Health Check Endpoint
Your `/health` endpoint already monitors Redis:
```json
{
  "services": {
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "details": {
        "connected": true,
        "memory": "2.1M",
        "commands": 1532
      }
    }
  }
}
```

### Redis CLI Commands (for troubleshooting)
```bash
# Connect to Redis
redis-cli -u $REDIS_URL

# Check connection
PING

# Monitor commands
MONITOR

# Check memory usage
INFO memory
```

---

**Recommendation**: Start with **Redis Cloud** free tier for immediate production benefits, then scale as needed! 🚀
