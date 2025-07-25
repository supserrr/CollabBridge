import multer from 'multer';
import { Request } from 'express';
import { cloudinary } from '../config/cloudinary';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';
import path from 'path';

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

// Virus/malware signatures to check for (basic security)
const DANGEROUS_SIGNATURES = [
  Buffer.from('4D5A', 'hex'), // PE/EXE header
  Buffer.from('504B0304', 'hex'), // ZIP header (can contain executables)
  Buffer.from('52617221', 'hex'), // RAR header
  Buffer.from('377ABCAF271C', 'hex'), // 7z header
];

// Enhanced file validation
const validateFile = (file: Express.Multer.File, fileType: keyof typeof FILE_TYPES): string | null => {
  const config = FILE_TYPES[fileType];
  
  // Check file extension
  const extension = path.extname(file.originalname).toLowerCase().slice(1);
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
const createUploadMiddleware = (fileType: keyof typeof FILE_TYPES, maxCount?: number) => {
  const config = FILE_TYPES[fileType];
  
  const storage = multer.memoryStorage();
  
  return multer({
    storage,
    limits: {
      fileSize: config.maxSize,
      files: maxCount || 1,
      fieldSize: 2 * 1024 * 1024, // 2MB field size
      fieldNameSize: 100, // 100 bytes field name
      fields: 10, // Maximum 10 fields
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      try {
        // Log upload attempt
        logger.info('File upload attempt', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          userId: (req as any).user?.id,
          fieldname: file.fieldname
        });
        
        const validationError = validateFile(file, fileType);
        if (validationError) {
          logger.warn('File validation failed', {
            filename: file.originalname,
            error: validationError,
            userId: (req as any).user?.id
          });
          return cb(createError(validationError, 400));
        }
        
        cb(null, true);
      } catch (error) {
        logger.error('File filter error', error);
        cb(createError('File validation error', 500));
      }
    },
  });
};

// Export type-specific middleware
export const uploadProfileImage = createUploadMiddleware('profileImages').single('avatar');
export const uploadEventImages = createUploadMiddleware('eventImages').array('images', 10);
export const uploadPortfolioFiles = createUploadMiddleware('portfolioFiles').array('portfolio', 20);
export const uploadDocuments = createUploadMiddleware('documents').single('document');

// Generic upload middleware (for backward compatibility)
const upload = createUploadMiddleware('images');

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);

// Enhanced error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
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
    
    logger.warn('Multer upload error', {
      code: error.code,
      message: error.message,
      field: error.field,
      userId: (req as any).user?.id
    });
    
    return res.status(statusCode).json({
      error: message,
      code: error.code
    });
  }
  
  next(error);
};

export { upload, FILE_TYPES };
