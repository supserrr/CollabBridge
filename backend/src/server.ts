import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { setupCloudinary } from './config/cloudinary';
import { setupSocketHandlers } from './socket/handlers';
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

// Initialize HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize services
const initializeServices = async () => {
  logger.info('Starting server initialization...', {
    nodeEnv: process.env.NODE_ENV,
    port: PORT,
    platform: process.platform,
    nodeVersion: process.version
  });

  try {
    // Connect to database first
    await connectDatabase();
    
    // Initialize other services
    await initializeFirebase();
    await setupCloudinary();
    
    // Setup socket handlers
    setupSocketHandlers(io);
    
    return { server, io };
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
};

// Start server
const startServer = async () => {
  try {
    await initializeServices();
    
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server is running on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
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
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
