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
    logger.info('Database URL components:', {
      protocol: dbUrl.protocol,
      hostname: dbUrl.hostname,
      port: dbUrl.port,
      pathname: '**redacted**'
    });
    return true;
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return false;
  }
};

const INITIAL_DELAY = 20000; // 20 seconds initial delay
const MAX_RETRIES = 10;
const BASE_RETRY_DELAY = 10000; // 10 seconds base delay

const prisma = globalThis.__prisma || new PrismaClient({
  log: ['error', 'warn', 'info'],
  errorFormat: 'pretty'
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };

export const connectDatabase = async (): Promise<void> => {
  // Initial delay to allow database to be ready
  logger.info(`Waiting ${INITIAL_DELAY/1000} seconds before initial connection attempt...`);
  await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Attempting database connection (attempt ${attempt}/${MAX_RETRIES})...`);
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      if (!validateDatabaseUrl(process.env.DATABASE_URL)) {
        throw new Error('Invalid DATABASE_URL format. Must be a valid PostgreSQL connection URL');
      }

      logger.info('Connection URL validation passed, attempting connection...');
      
      // Try to disconnect first in case there's a stale connection
      try {
        await prisma.$disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }

      await prisma.$connect();
      
      // Test the connection with a simple query
      const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
      logger.info('Database connection test successful:', result);
      
      logger.info('✅ Database connected successfully');
      return;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        clientVersion: error.clientVersion,
        meta: error.meta,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };

      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}):`, errorDetails);
      
      if (attempt === MAX_RETRIES) {
        logger.error('Maximum retry attempts reached. Giving up.');
        throw error;
      }

      const delay = BASE_RETRY_DELAY * attempt; // Linear backoff
      logger.info(`Waiting ${delay/1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};
