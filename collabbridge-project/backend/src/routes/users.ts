import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const userController = new UserController();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', asyncHandler(userController.getProfile.bind(userController)));
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));
router.post('/avatar', upload.single('avatar'), asyncHandler(userController.uploadAvatar.bind(userController)));
router.delete('/avatar', asyncHandler(userController.deleteAvatar.bind(userController)));

// Creative profile specific routes
router.get('/creative-profile', asyncHandler(userController.getCreativeProfile.bind(userController)));
router.put('/creative-profile', asyncHandler(userController.updateCreativeProfile.bind(userController)));
router.post('/portfolio', upload.array('images', 10), asyncHandler(userController.uploadPortfolio.bind(userController)));

// Event planner specific routes
router.get('/event-planner', asyncHandler(userController.getEventPlannerProfile.bind(userController)));
router.put('/event-planner', asyncHandler(userController.updateEventPlannerProfile.bind(userController)));

// Activity and stats
router.get('/activity', asyncHandler(userController.getUserActivity.bind(userController)));
router.get('/stats', asyncHandler(userController.getUserStats.bind(userController)));

export default router;
