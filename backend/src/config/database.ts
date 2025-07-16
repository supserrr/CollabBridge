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

const INITIAL_DELAY = 30000; // 30 seconds initial delay
const MAX_RETRIES = 15;
const BASE_RETRY_DELAY = 15000; // 15 seconds base delay

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    const baseUrl = new URL(url);
    if (process.env.NODE_ENV === 'production') {
      const params = new URLSearchParams(baseUrl.search);
      params.set('sslmode', 'require');
      params.set('pool_timeout', '20');
      params.set('connection_limit', '5');
      params.set('connect_timeout', '30');
      baseUrl.search = params.toString();
    }
    return baseUrl.toString();
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return url;
  }
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

  // Add query performance monitoring
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
    }
    return result;
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
      
      // Test connection with basic connectivity
      await prisma.$connect();
      
      // Test with a simple query
      const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
      logger.info('Basic query test successful:', result);
      
      // Test with more complex query
      const dbInfo = await prisma.$queryRaw`
        SELECT current_database() as database, 
               version() as version,
               current_timestamp as timestamp`;
      logger.info('Database information:', dbInfo);
      
      logger.info('✅ Database connection established successfully');
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}): ${errorMessage}`);
      
      if (error.code === 'ECONNREFUSED') {
        logger.error('Connection refused - database server may be down or unreachable');
      } else if (error.code === 'ETIMEDOUT') {
        logger.error('Connection timed out - check network connectivity and firewall rules');
      } else if (error.code === 'P1001') {
        logger.error('Cannot reach database server - check network connectivity');
      } else if (error.code === 'P1002') {
        logger.error('Database server rejected connection - check credentials and permissions');
      }
      
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(BASE_RETRY_DELAY * attempt, 60000);
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
