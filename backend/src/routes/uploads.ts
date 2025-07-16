import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { UploadController } from '../controllers/upload/uploadController';

const router = Router();
const uploadController = new UploadController();

// All routes require authentication
router.use(authenticate);

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
