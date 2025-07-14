import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('firebaseUid').notEmpty(),
  ],
  validateRequest,
  authController.register
);

router.post('/verify-token', authController.verifyToken);
router.post('/refresh-token', authController.refreshToken);

export { router as authRoutes };
