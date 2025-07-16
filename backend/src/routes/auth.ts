import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/auth/authController';

const router = Router();
const authController = new AuthController();

router.post('/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('firebaseUid').notEmpty(),
  ]),
  asyncHandler(authController.register.bind(authController))
);

router.post('/verify-token',
  validate([
    body('token').notEmpty(),
  ]),
  asyncHandler(authController.verifyToken.bind(authController))
);

router.get('/me',
  authenticate,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

export default router;
