"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const validateDatabaseUrl = (url) => {
    try {
        const dbUrl = new URL(url);
        const validProtocols = ['postgresql:', 'postgres:'];
        if (!validProtocols.includes(dbUrl.protocol)) {
            logger_1.logger.error('Invalid database protocol:', dbUrl.protocol);
            return false;
        }
        if (!dbUrl.hostname) {
            logger_1.logger.error('Missing database hostname');
            return false;
        }
        // Log sanitized URL components for debugging
        logger_1.logger.info('Database URL components:', {
            protocol: dbUrl.protocol,
            hostname: dbUrl.hostname,
            port: dbUrl.port || '5432',
            database: dbUrl.pathname.slice(1),
            hasusersname: !!dbUrl.username,
            hasPassword: !!dbUrl.password,
            searchParams: Object.fromEntries(dbUrl.searchParams)
        });
        return true;
    }
    catch (error) {
        logger_1.logger.error('Failed to parse DATABASE_URL:', error);
        return false;
    }
};
const INITIAL_DELAY = 15000; // 15 seconds initial delay
const MAX_RETRIES = 15;
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
    return new client_1.PrismaClient({
        datasourceUrl: url.toString(),
        log: ['error', 'warn'],
    });
};
// Initialize Prisma client
const prisma = global.__prisma || createPrismaClient();
exports.prisma = prisma;
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}
const connectDatabase = async () => {
    let attempt = 1;
    const maxRetries = MAX_RETRIES;
    while (attempt <= maxRetries) {
        try {
            logger_1.logger.info(`Attempting database connection (attempt ${attempt}/${maxRetries})...`);
            // Validate database URL
            const url = process.env.DATABASE_URL;
            if (!url || !validateDatabaseUrl(url)) {
                throw new Error('Invalid DATABASE_URL configuration');
            }
            logger_1.logger.info('Database URL components:');
            logger_1.logger.info('Connection URL validation passed, attempting connection...');
            // Test connection with timeout
            await Promise.race([
                prisma.$connect(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
            ]);
            // Verify connection with a simple query
            await prisma.$queryRaw `SELECT 1`;
            logger_1.logger.info('✅ Successfully connected to database');
            return true;
        }
        catch (error) {
            logger_1.logger.error(`❌ Database connection failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
            if (attempt === maxRetries) {
                logger_1.logger.error('Maximum connection attempts reached. Exiting...');
                process.exit(1);
            }
            // Calculate delay with exponential backoff
            const delay = Math.min(INITIAL_DELAY * Math.pow(1.5, attempt - 1), 60000); // Max 1 minute
            logger_1.logger.info(`Waiting ${delay / 1000} seconds before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }
    return false;
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger_1.logger.info('Database connection closed successfully');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from database:', error);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map