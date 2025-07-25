import app from './app';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { setupCloudinary } from './config/cloudinary';
import { connectRedis, disconnectRedis } from './config/redis';
import { setupSocketHandlers } from './socket/handlers';
import socketIO from './socket/io';
import { logger } from './utils/logger';
import { cacheService } from './services/CacheService';

// Load environment variables first
dotenv.config();

// Get PORT from environment variable, default to 3000 for production compatibility
const PORT = parseInt(process.env.PORT || '3000', 10);

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  // Add other required env vars
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = socketIO.initialize(server);

// Graceful shutdown handler
const shutdownGracefully = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  let exitCode = 0;
  
  try {
    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed. Cleaning up resources...');
      
      try {
        // Disconnect Socket.IO clients
        io.close();
        logger.info('Socket.IO connections closed');
        
        // Shutdown cache service
        cacheService.shutdown();
        logger.info('Cache service shutdown');
        
        // Disconnect from Redis
        await disconnectRedis();
        logger.info('Redis connection closed');
        
        // Disconnect from database
        await disconnectDatabase();
        logger.info('Database connections closed');
        
        logger.info('Graceful shutdown completed');
      } catch (error) {
        logger.error('Error during resource cleanup:', error);
        exitCode = 1;
      } finally {
        process.exit(exitCode);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 30000);
  } catch (error) {
    logger.error('Error initiating shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdownGracefully('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
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
    logger.info('Database connection established');
    
    // Try to initialize Redis (non-blocking)
    try {
      await connectRedis();
      logger.info('Redis connection initialized');
    } catch (error) {
      logger.warn('Redis initialization failed, continuing without Redis:', error);
    }
    
    // Initialize other services
    await initializeFirebase();
    await setupCloudinary();
    
    // Setup socket handlers
    setupSocketHandlers(io);
    
    // Start listening on port with 0.0.0.0 to accept connections from all interfaces
    server.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      logger.info(`✨ Server is running on port ${PORT}`);
      
      // Log additional info for debugging
      logger.info('Server details:', {
        address: typeof address === 'string' ? address : address?.port,
        socketioPath: io.path(),
        nodeEnv: process.env.NODE_ENV,
        hostname: require('os').hostname()
      });
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initializeServices().catch(error => {
  logger.error('Fatal error during server initialization:', error);
  process.exit(1);
});

