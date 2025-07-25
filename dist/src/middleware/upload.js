"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_TYPES = exports.upload = exports.handleUploadError = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.uploadDocuments = exports.uploadPortfolioFiles = exports.uploadEventImages = exports.uploadProfileImage = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
// File type categories with specific validation
const FILE_TYPES = {
    images: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
        maxSize: 10 * 1024 * 1024, // 10MB
    },
    documents: {
        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
        maxSize: 25 * 1024 * 1024, // 25MB
    },
    portfolioFiles: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 15 * 1024 * 1024, // 15MB
    },
    profileImages: {
        extensions: ['jpg', 'jpeg', 'png', 'webp'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    eventImages: {
        extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 8 * 1024 * 1024, // 8MB
    }
};
exports.FILE_TYPES = FILE_TYPES;
// Virus/malware signatures to check for (basic security)
const DANGEROUS_SIGNATURES = [
    Buffer.from('4D5A', 'hex'), // PE/EXE header
    Buffer.from('504B0304', 'hex'), // ZIP header (can contain executables)
    Buffer.from('52617221', 'hex'), // RAR header
    Buffer.from('377ABCAF271C', 'hex'), // 7z header
];
// Enhanced file validation
const validateFile = (file, fileType) => {
    const config = FILE_TYPES[fileType];
    // Check file extension
    const extension = path_1.default.extname(file.originalname).toLowerCase().slice(1);
    if (!config.extensions.includes(extension)) {
        return `Invalid file extension. Allowed: ${config.extensions.join(', ')}`;
    }
    // Check MIME type
    if (!config.mimeTypes.includes(file.mimetype)) {
        return `Invalid file type. Expected: ${config.mimeTypes.join(', ')}`;
    }
    // Check file size
    if (file.size > config.maxSize) {
        return `File too large. Maximum size: ${config.maxSize / 1024 / 1024}MB`;
    }
    // Basic security check for dangerous file signatures
    if (file.buffer) {
        for (const signature of DANGEROUS_SIGNATURES) {
            if (file.buffer.subarray(0, signature.length).equals(signature)) {
                return 'File contains potentially dangerous content';
            }
        }
    }
    // Check for null bytes (potential security issue)
    if (file.originalname.includes('\0')) {
        return 'Invalid filename';
    }
    // Check filename length
    if (file.originalname.length > 255) {
        return 'Filename too long';
    }
    return null; // Valid file
};
// Create type-specific upload middleware
const createUploadMiddleware = (fileType, maxCount) => {
    const config = FILE_TYPES[fileType];
    const storage = multer_1.default.memoryStorage();
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: config.maxSize,
            files: maxCount || 1,
            fieldSize: 2 * 1024 * 1024, // 2MB field size
            fieldNameSize: 100, // 100 bytes field name
            fields: 10, // Maximum 10 fields
        },
        fileFilter: (req, file, cb) => {
            try {
                // Log upload attempt
                logger_1.logger.info('File upload attempt', {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    userId: req.user?.id,
                    fieldname: file.fieldname
                });
                const validationError = validateFile(file, fileType);
                if (validationError) {
                    logger_1.logger.warn('File validation failed', {
                        filename: file.originalname,
                        error: validationError,
                        userId: req.user?.id
                    });
                    return cb((0, errorHandler_1.createError)(validationError, 400));
                }
                cb(null, true);
            }
            catch (error) {
                logger_1.logger.error('File filter error', error);
                cb((0, errorHandler_1.createError)('File validation error', 500));
            }
        },
    });
};
// Export type-specific middleware
exports.uploadProfileImage = createUploadMiddleware('profileImages').single('avatar');
exports.uploadEventImages = createUploadMiddleware('eventImages').array('images', 10);
exports.uploadPortfolioFiles = createUploadMiddleware('portfolioFiles').array('portfolio', 20);
exports.uploadDocuments = createUploadMiddleware('documents').single('document');
// Generic upload middleware (for backward compatibility)
const upload = createUploadMiddleware('images');
exports.upload = upload;
const uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
const uploadFields = (fields) => upload.fields(fields);
exports.uploadFields = uploadFields;
// Enhanced error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        let message = 'File upload error';
        let statusCode = 400;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files';
                break;
            case 'LIMIT_FIELD_KEY':
                message = 'Field name too long';
                break;
            case 'LIMIT_FIELD_VALUE':
                message = 'Field value too long';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'Too many fields';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected field';
                break;
            default:
                message = error.message;
        }
        logger_1.logger.warn('Multer upload error', {
            code: error.code,
            message: error.message,
            field: error.field,
            userId: req.user?.id
        });
        return res.status(statusCode).json({
            error: message,
            code: error.code
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map