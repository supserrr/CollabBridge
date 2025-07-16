import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthController } from '../controllers/auth/authController';

const router = Router();
const authController = new AuthController();

// Register
router.post('/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('firebaseUid').isLength({ min: 1 }),
  ]),
  asyncHandler(authController.register.bind(authController))
);

// Login
router.post('/login',
  validate([
    body('email').optional().isEmail().normalizeEmail(),
    body('firebaseUid').isLength({ min: 1 }),
  ]),
  asyncHandler(authController.login.bind(authController))
);

// Verify token
router.get('/verify-token',
  authenticate,
  asyncHandler(authController.verifyToken.bind(authController))
);

// Logout
router.post('/logout',
  authenticate,
  asyncHandler(authController.logout.bind(authController))
);

export default router;
