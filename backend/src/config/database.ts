/**
 * Database Configuration
 * 
 * Centralized database connection management using Prisma ORM with PostgreSQL.
 * Handles connection pooling, retry logic, URL validation, and graceful error handling.
 * Implements connection caching for development environments and production optimization.
 * 
 * Key Features:
 * - Prisma Client initialization with proper configuration
 * - Database URL validation and sanitization
 * - Retry logic for connection failures
 * - Connection caching to prevent multiple instances
 * - Graceful shutdown handling
 * - Comprehensive logging for debugging
 * - Environment-specific optimizations
 * 
 * @config
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Global type declaration for Prisma instance caching
 * Prevents multiple Prisma instances in development due to hot reloading
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Validates the database URL format and components
 * Ensures proper PostgreSQL connection string structure
 * 
 * @param url - Database connection URL to validate
 * @returns boolean indicating if URL is valid
 */
const validateDatabaseUrl = (url: string): boolean => {
  try {
    const dbUrl = new URL(url);
    
    // Check for valid PostgreSQL protocols
    const validProtocols = ['postgresql:', 'postgres:'];
    if (!validProtocols.includes(dbUrl.protocol)) {
      logger.error('Invalid database protocol:', dbUrl.protocol);
      return false;
    }
    
    // Ensure hostname is present
    if (!dbUrl.hostname) {
      logger.error('Missing database hostname');
      return false;
    }
    
    // Log sanitized URL components for debugging (without credentials)
    logger.info('Database URL components:', {
      protocol: dbUrl.protocol,
      hostname: dbUrl.hostname,
      port: dbUrl.port || '5432',         // Default PostgreSQL port
      database: dbUrl.pathname.slice(1),  // Remove leading slash
      hasusersname: !!dbUrl.username,     // Boolean flag for security
      hasPassword: !!dbUrl.password,      // Boolean flag for security  
      searchParams: Object.fromEntries(dbUrl.searchParams)
    });
    return true;
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return false;
  }
};

/**
 * Connection retry configuration
 * Provides resilience against temporary database unavailability
 */
const INITIAL_DELAY = 15000; // 15 seconds initial delay for database startup
const MAX_RETRIES = 15;      // Maximum number of connection attempts

// Initialize Prisma client with proper configuration
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse the database URL to handle SSL parameters
  const url = new URL(databaseUrl);
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Add SSL parameters for production if not already present
  if (isProduction) {
    url.searchParams.set('sslmode', 'require');
    url.searchParams.set('pool_timeout', '30');
    url.searchParams.set('connection_limit', '10');
  }

  return new PrismaClient({
    datasourceUrl: url.toString(),
    log: ['error', 'warn'],
  });
};

// Initialize Prisma client
const prisma = global.__prisma || createPrismaClient();

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

      // Verify connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

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

export { prisma };
