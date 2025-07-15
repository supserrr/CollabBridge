import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/verify-token', asyncHandler(authController.verifyToken.bind(authController)));
router.post('/refresh-token', asyncHandler(authController.refreshToken.bind(authController)));

// Protected routes
router.post('/logout', authenticateToken, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser.bind(authController)));

export default router;
