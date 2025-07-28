import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { monitoringService, requestTrackingMiddleware } from './services/MonitoringService';
import { rateLimiters } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import applicationRoutes from './routes/applications';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';
import profileRoutes from './routes/profiles';
import portfolioRoutes from './routes/portfolio';
import savedProfessionalsRoutes from './routes/savedProfessionals';
import notificationRoutes from './routes/notifications';
import calendarRoutes from './routes/calendar';
import contractRoutes from './routes/contracts';
import analyticsRoutes from './routes/analytics';
import { logger } from './utils/logger';

const app = express();

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(requestLogger);
app.use(requestTrackingMiddleware); // Add request tracking

// Global rate limiting (fallback)
app.use(rateLimiters.global);

// Health check endpoint with comprehensive monitoring
app.get('/health', async (req, res) => {
  try {
    const healthCheck = await monitoringService.getHealthCheck();
    
    // Set appropriate status code based on health
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Alternative health check endpoint for API namespace
app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = await monitoringService.getHealthCheck();
    
    // Set appropriate status code based on health
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Frontend compatibility endpoint (handles /api/api/health)
app.get('/api/api/health', async (req, res) => {
  try {
    const healthCheck = await monitoringService.getHealthCheck();
    
    // Set appropriate status code based on health
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check for monitoring systems
app.get('/health/detailed', async (req, res) => {
  try {
    const [healthCheck, dbStats] = await Promise.all([
      monitoringService.getHealthCheck(),
      monitoringService.getDatabaseStats()
    ]);
    
    res.json({
      ...healthCheck,
      database: {
        ...healthCheck.services.database,
        stats: dbStats
      }
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
});

// Basic health check for load balancers
app.get('/health/basic', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint with API information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'CollabBridge API',
    version: '1.0.0',
    description: 'Backend API for CollabBridge platform',
    environment: process.env.NODE_ENV,
    documentation: '/api-docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/saved-professionals', savedProfessionalsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/analytics', analyticsRoutes);

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.status(200).json({
    openapi: '3.0.0',
    info: {
      title: 'CollabBridge API Documentation',
      version: '1.0.0',
      description: 'API documentation for CollabBridge platform'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://collabbridge.onrender.com' 
          : 'http://localhost:' + (process.env.PORT || 3000),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    endpoints: [
      { path: '/api/auth', description: 'Authentication endpoints' },
      { path: '/api/users', description: 'users management endpoints' },
      { path: '/api/events', description: 'Event management endpoints' },
      { path: '/api/applications', description: 'Application management endpoints' },
      { path: '/api/bookings', description: 'Booking management endpoints' },
      { path: '/api/reviews', description: 'Review management endpoints' },
      { path: '/api/messages', description: 'Messaging endpoints' },
      { path: '/api/uploads', description: 'File upload endpoints' },
      { path: '/api/search', description: 'Search endpoints' },
      { path: '/api/admin', description: 'Admin management endpoints' },
      { path: '/api/profiles', description: 'Public profile and username management endpoints' }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

export default app;
