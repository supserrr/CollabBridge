import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getRedisClient, isRedisConnected, isRedisAvailable } from '../config/redis';
import { logger } from '../utils/logger';
import { cacheService } from '../services/CacheService';
import os from 'os';
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    cache: ServiceHealth;
    memory: ServiceHealth;
    disk: ServiceHealth;
  };
  metrics: SystemMetrics;
  dependencies?: ExternalDependencyHealth[];
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
    heap: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  process: {
    pid: number;
    uptime: number;
    nodeVersion: string;
  };
  requests?: {
    total: number;
    errors: number;
    averageResponseTime: number;
  };
}

interface ExternalDependencyHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

export class MonitoringService {
  private requestMetrics = {
    total: 0,
    errors: 0,
    responseTimes: [] as number[]
  };

  // Database health check
  async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = performance.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        details: {
          connection: 'active'
        }
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      logger.error('Database health check failed:', error);
      
      return {
        status: 'unhealthy',
        responseTime: Math.round(responseTime),
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  // Redis health check
  async checkRedisHealth(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      if (!isRedisAvailable()) {
        return {
          status: 'degraded',
          responseTime: 0,
          details: {
            message: 'Redis not available, using memory cache fallback'
          }
        };
      }

      if (!isRedisConnected()) {
        return {
          status: 'unhealthy',
          error: 'Redis not connected'
        };
      }

      const client = getRedisClient();
      if (!client) {
        return {
          status: 'unhealthy',
          error: 'Redis client not available'
        };
      }

      const testKey = 'health_check_' + Date.now();
      await client.set(testKey, 'test', { EX: 10 });
      const value = await client.get(testKey);
      await client.del(testKey);
      
      const responseTime = performance.now() - startTime;
      
      return {
        status: value === 'test' ? 'healthy' : 'degraded',
        responseTime: Math.round(responseTime),
        details: {
          connected: true,
          testPassed: value === 'test'
        }
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      logger.error('Redis health check failed:', error);
      
      return {
        status: 'unhealthy',
        responseTime: Math.round(responseTime),
        error: error instanceof Error ? error.message : 'Unknown Redis error'
      };
    }
  }

  // Cache service health check
  async checkCacheHealth(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      const testKey = 'health_check_cache_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      await cacheService.set(testKey, testValue, 10000); // 10 seconds
      const retrievedValue = await cacheService.get(testKey);
      await cacheService.delete(testKey);
      
      const responseTime = performance.now() - startTime;
      const isWorking = retrievedValue && retrievedValue.test === true;
      
      const stats = await cacheService.getStats();
      
      return {
        status: isWorking ? 'healthy' : 'degraded',
        responseTime: Math.round(responseTime),
        details: {
          testPassed: isWorking,
          cacheStats: stats
        }
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      logger.error('Cache health check failed:', error);
      
      return {
        status: 'unhealthy',
        responseTime: Math.round(responseTime),
        error: error instanceof Error ? error.message : 'Unknown cache error'
      };
    }
  }

  // Memory health check
  checkMemoryHealth(): ServiceHealth {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      
      const memoryPercentage = (usedMemory / totalMemory) * 100;
      const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (memoryPercentage > 90 || heapPercentage > 90) {
        status = 'unhealthy';
      } else if (memoryPercentage > 80 || heapPercentage > 80) {
        status = 'degraded';
      }
      
      return {
        status,
        details: {
          system: {
            total: Math.round(totalMemory / 1024 / 1024), // MB
            used: Math.round(usedMemory / 1024 / 1024), // MB
            percentage: Math.round(memoryPercentage)
          },
          process: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            percentage: Math.round(heapPercentage)
          }
        }
      };
    } catch (error) {
      logger.error('Memory health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown memory error'
      };
    }
  }

  // Disk health check
  checkDiskHealth(): ServiceHealth {
    try {
      // Note: This is a basic implementation. 
      // In production, you might want to use a library like 'diskusage' for more accurate disk monitoring
      const stats = {
        available: true, // Simplified check
        // You could add actual disk usage monitoring here
      };
      
      return {
        status: 'healthy',
        details: stats
      };
    } catch (error) {
      logger.error('Disk health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown disk error'
      };
    }
  }

  // Get system metrics
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    const avgResponseTime = this.requestMetrics.responseTimes.length > 0
      ? this.requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.requestMetrics.responseTimes.length
      : 0;
    
    return {
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
        heap: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        }
      },
      cpu: {
        usage: 0, // Would need additional monitoring for accurate CPU usage
        loadAverage: os.loadavg()
      },
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime()),
        nodeVersion: process.version
      },
      requests: {
        total: this.requestMetrics.total,
        errors: this.requestMetrics.errors,
        averageResponseTime: Math.round(avgResponseTime)
      }
    };
  }

  // Comprehensive health check
  async getHealthCheck(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      // Run all health checks in parallel
      const [database, redis, cache, memory, disk] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkCacheHealth(),
        Promise.resolve(this.checkMemoryHealth()),
        Promise.resolve(this.checkDiskHealth())
      ]);
      
      // Determine overall status
      const services = { database, redis, cache, memory, disk };
      const statuses = Object.values(services).map(s => s.status);
      
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (statuses.includes('unhealthy')) {
        overallStatus = 'unhealthy';
      } else if (statuses.includes('degraded')) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'healthy';
      }
      
      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'unknown',
        version: process.env.npm_package_version || '1.0.0',
        services,
        metrics: this.getSystemMetrics()
      };
      
      const totalTime = performance.now() - startTime;
      logger.info('Health check completed', { 
        status: overallStatus, 
        duration: Math.round(totalTime) 
      });
      
      return result;
    } catch (error) {
      logger.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'unknown',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: { status: 'unhealthy', error: 'Health check failed' },
          redis: { status: 'unhealthy', error: 'Health check failed' },
          cache: { status: 'unhealthy', error: 'Health check failed' },
          memory: { status: 'unhealthy', error: 'Health check failed' },
          disk: { status: 'unhealthy', error: 'Health check failed' }
        },
        metrics: this.getSystemMetrics()
      };
    }
  }

  // Request metrics tracking
  trackRequest(responseTime: number, isError: boolean = false) {
    this.requestMetrics.total++;
    if (isError) {
      this.requestMetrics.errors++;
    }
    
    this.requestMetrics.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times to prevent memory leaks
    if (this.requestMetrics.responseTimes.length > 1000) {
      this.requestMetrics.responseTimes = this.requestMetrics.responseTimes.slice(-1000);
    }
  }

  // Reset metrics
  resetMetrics() {
    this.requestMetrics = {
      total: 0,
      errors: 0,
      responseTimes: []
    };
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const [
        userCount,
        eventCount,
        bookingCount,
        reviewCount,
        activeuserss,
        recentBookings
      ] = await Promise.all([
        prisma.users.count(),
        prisma.events.count(),
        prisma.bookings.count(),
        prisma.reviews.count(),
        prisma.users.count({ where: { isActive: true } }),
        prisma.bookings.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      return {
        users: { total: userCount, active: activeuserss },
        events: { total: eventCount },
        bookings: { total: bookingCount, recent: recentBookings },
        reviews: { total: reviewCount }
      };
    } catch (error) {
      logger.error('Database stats error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

// Express middleware for tracking requests
export const requestTrackingMiddleware = (req: Request, res: Response, next: any) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const responseTime = performance.now() - startTime;
    const isError = res.statusCode >= 400;
    monitoringService.trackRequest(responseTime, isError);
  });
  
  next();
};
