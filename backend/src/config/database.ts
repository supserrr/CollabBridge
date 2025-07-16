import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

const validateDatabaseUrl = (url: string): boolean => {
  try {
    const dbUrl = new URL(url);
    return dbUrl.protocol === 'postgresql:' || dbUrl.protocol === 'postgres:';
  } catch {
    return false;
  }
};

const INITIAL_DELAY = 10000; // 10 seconds initial delay
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds between retries

const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
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
      await prisma.$connect();
      
      // Test the connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      
      logger.info('✅ Database connected successfully');
      return;
    } catch (error: any) {
      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}):`, {
        error: error.message,
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
      
      if (attempt === MAX_RETRIES) {
        logger.error('Maximum retry attempts reached. Giving up.');
        throw error;
      }

      const delay = RETRY_DELAY * attempt; // Exponential backoff
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
