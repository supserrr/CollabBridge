import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UploadController } from '../controllers/upload/uploadController';

const router = Router();
const uploadController = new UploadController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'
    ];
    
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single',
  upload.single('file'),
  asyncHandler(uploadController.uploadSingle.bind(uploadController))
);

// Upload multiple files
router.post('/multiple',
  upload.array('files', 10),
  asyncHandler(uploadController.uploadMultiple.bind(uploadController))
);

// Upload avatar
router.post('/avatar',
  upload.single('avatar'),
  asyncHandler(uploadController.uploadAvatar.bind(uploadController))
);

// Upload portfolio images
router.post('/portfolio',
  upload.array('images', 20),
  asyncHandler(uploadController.uploadPortfolio.bind(uploadController))
);

// Delete file
router.delete('/:publicId',
  asyncHandler(uploadController.deleteFile.bind(uploadController))
);

export default router;
