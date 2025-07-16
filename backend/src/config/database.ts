import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

const validateDatabaseUrl = (url: string): boolean => {
  try {
    const dbUrl = new URL(url);
    const validProtocols = ['postgresql:', 'postgres:'];
    if (!validProtocols.includes(dbUrl.protocol)) {
      logger.error('Invalid database protocol:', dbUrl.protocol);
      return false;
    }
    
    if (!dbUrl.hostname) {
      logger.error('Missing database hostname');
      return false;
    }
    
    // Log sanitized URL components for debugging
    logger.info('Database URL components:', {
      protocol: dbUrl.protocol,
      hostname: dbUrl.hostname,
      port: dbUrl.port || '5432',
      database: dbUrl.pathname.slice(1),
      hasUsername: !!dbUrl.username,
      hasPassword: !!dbUrl.password
    });
    return true;
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return false;
  }
};

const INITIAL_DELAY = 15000; // 15 seconds initial delay
const MAX_RETRIES = 15;
const BASE_RETRY_DELAY = 15000; // 15 seconds base delay

// Initialize Prisma client
const prisma = global.__prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export const connectDatabase = async () => {
  let attempt = 1;
  const maxRetries = MAX_RETRIES;

  while (attempt <= maxRetries) {
    try {
      logger.info(`Attempting database connection (attempt ${attempt}/${maxRetries})...`);

      // Validate database URL
      const url = process.env.DATABASE_URL;
      if (!url || !validateDatabaseUrl(url)) {
        throw new Error('Invalid DATABASE_URL configuration');
      }

      logger.info('Database URL components:');
      logger.info('Connection URL validation passed, attempting connection...');

      // Test connection with timeout
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);

      logger.info('✅ Successfully connected to database');
      return true;

    } catch (error: any) {
      logger.error(`❌ Database connection failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
      
      if (attempt === maxRetries) {
        logger.error('Maximum connection attempts reached. Exiting...');
        process.exit(1);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(INITIAL_DELAY * Math.pow(1.5, attempt - 1), 60000); // Max 1 minute
      logger.info(`Waiting ${delay / 1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  return false;
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};

const handleDatabaseShutdown = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed gracefully during shutdown');
  } catch (error) {
    logger.error('Error during database shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', handleDatabaseShutdown);
process.on('SIGTERM', handleDatabaseShutdown);

export { prisma };
