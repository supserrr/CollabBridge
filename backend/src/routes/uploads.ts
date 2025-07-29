import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadSingle, uploadMultiple, uploadProfileImage } from '../middleware/upload';
import { UploadController } from '../controllers/upload/uploadController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const uploadController = new UploadController();

// Apply upload-specific rate limiting
router.use(rateLimiters.upload);

// All routes require authentication
router.use(authenticate);

// Profile image upload
router.post('/profile',
  uploadProfileImage,
  asyncHandler(uploadController.uploadProfileImage.bind(uploadController))
);

// Single file upload
router.post('/single',
  uploadSingle('file'),
  asyncHandler(uploadController.uploadSingle.bind(uploadController))
);

// Multiple file upload
router.post('/multiple',
  uploadMultiple('files', 5),
  asyncHandler(uploadController.uploadMultiple.bind(uploadController))
);

// Delete file
router.delete('/:publicId',
  asyncHandler(uploadController.deleteFile.bind(uploadController))
);

export default router;
