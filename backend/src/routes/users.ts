import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserController } from '../controllers/user/userController';

const router = Router();
const userController = new UserController();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile',
  asyncHandler(userController.getProfile.bind(userController))
);

// Update user profile
router.put('/profile',
  validate([
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().isLength({ max: 500 }),
    body('location').optional().trim().isLength({ max: 100 }),
    body('phone').optional().isMobilePhone('any'),
  ]),
  asyncHandler(userController.updateProfile.bind(userController))
);

// Update avatar
router.post('/avatar',
  upload.single('avatar'),
  asyncHandler(userController.updateAvatar.bind(userController))
);

// Deactivate account
router.delete('/account',
  asyncHandler(userController.deactivateAccount.bind(userController))
);

export default router;
