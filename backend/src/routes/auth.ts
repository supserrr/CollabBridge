import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/auth/authController';
import { TraditionalAuthController } from '../controllers/auth/traditionalAuthController';
import { rateLimiters } from '../middleware/rateLimiter';
import { prisma } from '../config/database';
import { verifyFirebaseToken } from '../config/firebase';

const router = Router();
const authController = new AuthController();
const traditionalAuthController = new TraditionalAuthController();

// Apply auth-specific rate limiting
router.use(rateLimiters.auth);

// Traditional Auth Routes (Email/Password)
router.post('/signup',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/)
  ]),
  asyncHandler(traditionalAuthController.signup.bind(traditionalAuthController))
);

router.post('/signin',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ]),
  asyncHandler(traditionalAuthController.signin.bind(traditionalAuthController))
);

// Firebase Auth Routes
router.post('/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('firebaseUid').optional().notEmpty(),
    body('token').optional().notEmpty(),
    body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body().custom((value, { req }) => {
      if (!req.body.firebaseUid && !req.body.token) {
        throw new Error('Either firebaseUid or token is required');
      }
      return true;
    }),
  ]),
  asyncHandler(authController.register.bind(authController))
);

router.post('/verify-token',
  validate([
    body('token').notEmpty(),
  ]),
  asyncHandler(authController.verifyToken.bind(authController))
);

router.post('/verify-firebase-token',
  validate([
    body('token').notEmpty(),
  ]),
  asyncHandler(async (req: any, res: any) => {
    const { token } = req.body;
    
    try {
      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(token);
      
      // Find user by Firebase UID
      const user = await prisma.users.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          username: true,
          isVerified: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({ error: 'User not found or inactive' });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid Firebase token' });
    }
  })
);

router.get('/me',
  authenticate,
  asyncHandler(authController.getCurrentusers.bind(authController))
);

router.get('/check-username',
  validate([]),
  asyncHandler(async (req: any, res: any) => {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const existingUser = await prisma.users.findUnique({
      where: { username: username as string }
    });
    
    res.json({ available: !existingUser });
  })
);

router.put('/update-profile',
  authenticate,
  validate([
    body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('role').optional().isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
  ]),
  asyncHandler(async (req: any, res: any) => {
    const { username, role } = req.body;
    const userId = req.user.id;
    
    const updateData: any = {};
    
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await prisma.users.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      updateData.username = username;
    }
    
    if (role) {
      updateData.role = role;
    }
    
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        username: true,
        isVerified: true,
        isActive: true,
      }
    });
    
    res.json({ success: true, user: updatedUser });
  })
);

export default router;
