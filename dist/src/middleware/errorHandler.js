"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.asyncHandler = exports.createError = void 0;
const logger_1 = require("../utils/logger");
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    // Log error
    logger_1.logger.error(`${req.method} ${req.path}:`, {
        error: message,
        stack: error.stack,
        statusCode,
        ip: req.ip,
        userAgent: req.get('users-Agent'),
    });
    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        message = 'Database operation failed';
    }
    // Validation errors
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production' && !error.isOperational) {
        message = 'Something went wrong';
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = (0, exports.createError)(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map