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
      database: dbUrl.pathname.slice(1), // Remove leading slash
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
  
  if (process.env.NODE_ENV === 'production') {
    // Parse the URL to add necessary parameters
    const baseUrl = new URL(url);
    const searchParams = new URLSearchParams(baseUrl.search);
    
    // Set essential Postgres connection parameters
    searchParams.set('sslmode', 'require');
    searchParams.set('connection_limit', '5');
    searchParams.set('pool_timeout', '30');
    searchParams.set('connect_timeout', '30');
    searchParams.set('statement_timeout', '60000'); // 1 minute
    searchParams.set('idle_in_transaction_session_timeout', '60000'); // 1 minute
    
    // Reconstruct the URL with parameters
    baseUrl.search = searchParams.toString();
    return baseUrl.toString();
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

  // Add query logging
  client.$use(async (params, next) => {
    const start = performance.now();
    const result = await next(params);
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 1000) { // Log slow queries (>1s)
      logger.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
    }
    
    return result;
  });

  return client;
};

export const prisma = globalThis.__prisma || createPrismaClient();

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
      
      // Test the connection with increasing complexity
      await prisma.$connect();
      
      // Verify connection with a simple query
      await prisma.$queryRaw`SELECT 1 as result`;
      
      // Test connection with a more complex query
      await prisma.$queryRaw`SELECT current_timestamp, current_database(), version()`;
      
      logger.info('✅ Database connection established successfully');
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      logger.error(`❌ Database connection failed (attempt ${attempt}/${MAX_RETRIES}): ${errorMessage}`);
      
      if (error.code === 'ECONNREFUSED') {
        logger.error('Connection refused - database server may be down or unreachable');
      } else if (error.code === 'ETIMEDOUT') {
        logger.error('Connection timed out - check network connectivity and firewall rules');
      }
      
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

// Graceful shutdown handler for database
const handleDatabaseShutdown = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed gracefully');
  } catch (error) {
    logger.error('Error during database shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', handleDatabaseShutdown);
process.on('SIGTERM', handleDatabaseShutdown);
