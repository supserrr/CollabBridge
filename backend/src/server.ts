import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase, prisma } from './config/database';
import { initializeFirebase } from './config/firebase';
import { setupCloudinary } from './config/cloudinary';
import { setupSocketHandlers } from './socket/handlers';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

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

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'PORT', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize services
const initializeServices = async () => {
  logger.info('Initializing services...', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    platform: process.platform,
    nodeVersion: process.version,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasFirebase: !!process.env.FIREBASE_PROJECT_ID,
    hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
  });
  
  try {
    // Connect to database first
    await connectDatabase();

    // Initialize other services only after database is connected
    if (process.env.FIREBASE_PROJECT_ID) {
      await initializeFirebase();
      logger.info('✅ Firebase initialized successfully');
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      setupCloudinary();
      logger.info('✅ Cloudinary initialized successfully');
    }

    logger.info('All services initialized successfully');
  } catch (error: any) {
    logger.error('Failed to initialize services:', {
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
    throw error;
  }
};

// Create Express app
const app = express();

// Apply global middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);

const startServer = async () => {
  try {
    await initializeServices();
    
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`, {
        port: PORT,
        address: '0.0.0.0',
        pid: process.pid
      });
    });

    // Log when server is ready to accept connections
    server.on('listening', () => {
      const addr = server.address();
      logger.info('Server listening on:', {
        address: typeof addr === 'string' ? addr : `${addr?.address}:${addr?.port}`
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal} signal`);
  
  try {
    await disconnectDatabase();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit if server hasn't closed in 10 seconds
    setTimeout(() => {
      logger.error('Failed to close server gracefully');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Start the server
startServer();

export { io };
