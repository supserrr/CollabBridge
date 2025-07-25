"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const MonitoringService_1 = require("./services/MonitoringService");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const applications_1 = __importDefault(require("./routes/applications"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const messages_1 = __importDefault(require("./routes/messages"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const search_1 = __importDefault(require("./routes/search"));
const admin_1 = __importDefault(require("./routes/admin"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// Basic middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
app.use(requestLogger_1.requestLogger);
app.use(MonitoringService_1.requestTrackingMiddleware); // Add request tracking
// Global rate limiting (fallback)
app.use(rateLimiter_1.rateLimiters.global);
// Health check endpoint with comprehensive monitoring
app.get('/health', async (req, res) => {
    try {
        const healthCheck = await MonitoringService_1.monitoringService.getHealthCheck();
        // Set appropriate status code based on health
        const statusCode = healthCheck.status === 'healthy' ? 200 :
            healthCheck.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthCheck);
    }
    catch (error) {
        logger_1.logger.error('Health check endpoint error:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// Alternative health check endpoint for API namespace
app.get('/api/health', async (req, res) => {
    try {
        const healthCheck = await MonitoringService_1.monitoringService.getHealthCheck();
        // Set appropriate status code based on health
        const statusCode = healthCheck.status === 'healthy' ? 200 :
            healthCheck.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthCheck);
    }
    catch (error) {
        logger_1.logger.error('Health check endpoint error:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// Frontend compatibility endpoint (handles /api/api/health)
app.get('/api/api/health', async (req, res) => {
    try {
        const healthCheck = await MonitoringService_1.monitoringService.getHealthCheck();
        // Set appropriate status code based on health
        const statusCode = healthCheck.status === 'healthy' ? 200 :
            healthCheck.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthCheck);
    }
    catch (error) {
        logger_1.logger.error('Health check endpoint error:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// Detailed health check for monitoring systems
app.get('/health/detailed', async (req, res) => {
    try {
        const [healthCheck, dbStats] = await Promise.all([
            MonitoringService_1.monitoringService.getHealthCheck(),
            MonitoringService_1.monitoringService.getDatabaseStats()
        ]);
        res.json({
            ...healthCheck,
            database: {
                ...healthCheck.services.database,
                stats: dbStats
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Detailed health check error:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Detailed health check failed'
        });
    }
});
// Basic health check for load balancers
app.get('/health/basic', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Root endpoint with API information
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'CollabBridge API',
        version: '1.0.0',
        description: 'Backend API for CollabBridge platform',
        environment: process.env.NODE_ENV,
        documentation: '/api-docs',
        health: '/health',
        timestamp: new Date().toISOString()
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/events', events_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/search', search_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/portfolio', portfolio_1.default);
// API documentation endpoint
app.get('/api-docs', (req, res) => {
    res.status(200).json({
        openapi: '3.0.0',
        info: {
            title: 'CollabBridge API Documentation',
            version: '1.0.0',
            description: 'API documentation for CollabBridge platform'
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://collabbridge.onrender.com'
                    : 'http://localhost:' + (process.env.PORT || 3000),
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        endpoints: [
            { path: '/api/auth', description: 'Authentication endpoints' },
            { path: '/api/users', description: 'users management endpoints' },
            { path: '/api/events', description: 'Event management endpoints' },
            { path: '/api/applications', description: 'Application management endpoints' },
            { path: '/api/bookings', description: 'Booking management endpoints' },
            { path: '/api/reviews', description: 'Review management endpoints' },
            { path: '/api/messages', description: 'Messaging endpoints' },
            { path: '/api/uploads', description: 'File upload endpoints' },
            { path: '/api/search', description: 'Search endpoints' },
            { path: '/api/admin', description: 'Admin management endpoints' },
            { path: '/api/profiles', description: 'Public profile and username management endpoints' }
        ]
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        timestamp: new Date().toISOString()
    });
});
// Error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map