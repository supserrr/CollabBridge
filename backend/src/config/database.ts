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
    
    logger.info('Database URL components:', {
      protocol: dbUrl.protocol,
      hostname: dbUrl.hostname,
      port: dbUrl.port || '5432',
    });
    return true;
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return false;
  }
};

const INITIAL_DELAY = 30000; // 30 seconds initial delay
const MAX_RETRIES = 15;
const BASE_RETRY_DELAY = 15000; // 15 seconds base delay

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Production configuration with strict SSL and timeouts
    return `${url}${url.includes('?') ? '&' : '?'}sslmode=require&statement_timeout=60000&idle_timeout=60000&connection_limit=5`;
  }
  
  return url;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  });

  // Add middleware for connection error logging
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error: any) {
      logger.error('Database operation failed:', {
        operation: params.action,
        model: params.model,
        error: error?.message || error
      });
      throw error;
    }
  });

  return client;
};

const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export const connectDatabase = async () => {
  logger.info(`Waiting ${INITIAL_DELAY/1000} seconds before initial connection attempt...`);
  await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Attempting database connection (attempt ${attempt}/${MAX_RETRIES})...`);
      
      const url = getDatabaseUrl();
      if (!validateDatabaseUrl(url)) {
        throw new Error('Invalid database URL configuration');
      }
      
      logger.info('Connection URL validation passed, attempting connection...');
      
      // Test connection with a simple query
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      
      logger.info('✅ Database connection established successfully');
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}): ${errorMessage}`, {
        error: errorMessage,
        stack: error?.stack
      });
      
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(BASE_RETRY_DELAY * attempt, 60000); // Max 60 second delay
        logger.info(`Waiting ${delay / 1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error('Maximum retry attempts reached. Exiting...');
        process.exit(1);
      }
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

export { prisma };
