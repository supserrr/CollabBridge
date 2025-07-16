import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';
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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
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
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

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
      { path: '/api/users', description: 'User management endpoints' },
      { path: '/api/events', description: 'Event management endpoints' },
      { path: '/api/bookings', description: 'Booking management endpoints' },
      { path: '/api/reviews', description: 'Review management endpoints' },
      { path: '/api/messages', description: 'Messaging endpoints' },
      { path: '/api/uploads', description: 'File upload endpoints' },
      { path: '/api/search', description: 'Search endpoints' },
      { path: '/api/admin', description: 'Admin management endpoints' }
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
