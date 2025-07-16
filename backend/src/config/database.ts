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

const INITIAL_DELAY = 30000; // 30 seconds initial delay
const MAX_RETRIES = 15;
const BASE_RETRY_DELAY = 15000; // 15 seconds base delay

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  if (process.env.NODE_ENV === 'production') {
    return `${url}?sslmode=verify-full&connection_limit=5&pool_timeout=0&connect_timeout=30`;
  }
  
  return url;
};

const prisma = globalThis.__prisma || new PrismaClient({
  log: ['error', 'warn', 'info'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export const connectDatabase = async () => {
  logger.info('Waiting 30 seconds before initial connection attempt...');
  await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Attempting database connection (attempt ${attempt}/${MAX_RETRIES})...`);
      
      const url = getDatabaseUrl();
      if (!validateDatabaseUrl(url)) {
        throw new Error('Invalid database URL');
      }
      
      logger.info('Connection URL validation passed, attempting connection...');
      await prisma.$connect();
      
      logger.info('✅ Database connection established successfully');
      return true;
    } catch (error: any) {
      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
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
