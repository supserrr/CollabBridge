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

// Load environment variables first
dotenv.config();

// Get PORT from environment variable
const PORT = parseInt(process.env.PORT || '10000', 10);

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

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

// Initialize Express app and create HTTP server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Basic middleware that should be set up immediately
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint - set up early to help with deployment verification
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Initialize services
const initializeServices = async () => {
  logger.info('Initializing services...', {
    nodeEnv: process.env.NODE_ENV,
    port: PORT,
    platform: process.platform,
    nodeVersion: process.version
  });

  // Connect to database first
  await connectDatabase();

  // Setup routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/admin', adminRoutes);

  // Error handling middleware should be last
  app.use(errorHandler);
};

// Start server
const startServer = async () => {
  try {
    await initializeServices();
    
    // Explicitly bind to all interfaces
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server is running on port ${PORT}`);
    });
    
    // Setup socket handlers
    setupSocketHandlers(io);
  } catch (error: any) {
    logger.error('Failed to start server:', error?.message || error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await disconnectDatabase();
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
  } catch (error: any) {
    logger.error('Error during graceful shutdown:', error?.message || error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export { io };
