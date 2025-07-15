import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/UploadController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const uploadController = new UploadController();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'
    ];
    
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// File upload routes
router.post(
  '/image',
  upload.single('file'),
  asyncHandler(uploadController.uploadImage.bind(uploadController))
);

router.post(
  '/document',
  upload.single('file'),
  asyncHandler(uploadController.uploadDocument.bind(uploadController))
);

router.post(
  '/multiple',
  upload.array('files', 10),
  asyncHandler(uploadController.uploadMultiple.bind(uploadController))
);

// File management
router.delete('/:publicId', asyncHandler(uploadController.deleteFile.bind(uploadController)));
router.get('/signed-url', asyncHandler(uploadController.getSignedUrl.bind(uploadController)));

export default router;
