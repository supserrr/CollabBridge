"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const firebase_1 = require("./config/firebase");
const cloudinary_1 = require("./config/cloudinary");
const redis_1 = require("./config/redis");
const handlers_1 = require("./socket/handlers");
const io_1 = __importDefault(require("./socket/io"));
const logger_1 = require("./utils/logger");
const CacheService_1 = require("./services/CacheService");
// Load environment variables first
dotenv_1.default.config();
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
    logger_1.logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
// Initialize HTTP server
const server = (0, http_1.createServer)(app_1.default);
// Initialize Socket.IO
const io = io_1.default.initialize(server);
// Graceful shutdown handler
const shutdownGracefully = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    let exitCode = 0;
    try {
        // Stop accepting new connections
        server.close(async () => {
            logger_1.logger.info('HTTP server closed. Cleaning up resources...');
            try {
                // Disconnect Socket.IO clients
                io.close();
                logger_1.logger.info('Socket.IO connections closed');
                // Shutdown cache service
                CacheService_1.cacheService.shutdown();
                logger_1.logger.info('Cache service shutdown');
                // Disconnect from Redis
                await (0, redis_1.disconnectRedis)();
                logger_1.logger.info('Redis connection closed');
                // Disconnect from database
                await (0, database_1.disconnectDatabase)();
                logger_1.logger.info('Database connections closed');
                logger_1.logger.info('Graceful shutdown completed');
            }
            catch (error) {
                logger_1.logger.error('Error during resource cleanup:', error);
                exitCode = 1;
            }
            finally {
                process.exit(exitCode);
            }
        });
        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger_1.logger.error('Forcing shutdown after timeout');
            process.exit(1);
        }, 30000);
    }
    catch (error) {
        logger_1.logger.error('Error initiating shutdown:', error);
        process.exit(1);
    }
};
// Register shutdown handlers
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
// Error handlers
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    shutdownGracefully('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Initialize services
const initializeServices = async () => {
    logger_1.logger.info('Starting server initialization...', {
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        platform: process.platform,
        nodeVersion: process.version
    });
    try {
        // Connect to database first
        await (0, database_1.connectDatabase)();
        logger_1.logger.info('Database connection established');
        // Try to initialize Redis (non-blocking)
        try {
            await (0, redis_1.connectRedis)();
            logger_1.logger.info('Redis connection initialized');
        }
        catch (error) {
            logger_1.logger.warn('Redis initialization failed, continuing without Redis:', error);
        }
        // Initialize other services
        await (0, firebase_1.initializeFirebase)();
        await (0, cloudinary_1.setupCloudinary)();
        // Setup socket handlers
        (0, handlers_1.setupSocketHandlers)(io);
        // Start listening on port with 0.0.0.0 to accept connections from all interfaces
        server.listen(PORT, '0.0.0.0', () => {
            const address = server.address();
            logger_1.logger.info(`✨ Server is running on port ${PORT}`);
            // Log additional info for debugging
            logger_1.logger.info('Server details:', {
                address: typeof address === 'string' ? address : address?.port,
                socketioPath: io.path(),
                nodeEnv: process.env.NODE_ENV,
                hostname: require('os').hostname()
            });
        });
        // Handle server errors
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            switch (error.code) {
                case 'EACCES':
                    logger_1.logger.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.logger.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize server:', error);
        process.exit(1);
    }
};
// Start the server
initializeServices().catch(error => {
    logger_1.logger.error('Fatal error during server initialization:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map