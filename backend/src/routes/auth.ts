import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/auth/authController';

const router = Router();
const authController = new AuthController();

// Register user
router.post('/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    body('firebaseUid').notEmpty(),
  ]),
  asyncHandler(authController.register.bind(authController))
);

// Verify token
router.post('/verify-token',
  validate([
    body('token').notEmpty(),
  ]),
  asyncHandler(authController.verifyToken.bind(authController))
);

// Get current user
router.get('/me',
  authenticate,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

# Create admin routes
cat > backend/src/routes/admin.ts << 'EOF'
import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AdminController } from '../controllers/admin/adminController';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard stats
router.get('/dashboard',
  asyncHandler(adminController.getDashboardStats.bind(adminController))
);

// User management
router.get('/users',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL', 'ADMIN']),
    query('status').optional().isIn(['active', 'inactive']),
    query('search').optional().isString(),
  ]),
  asyncHandler(adminController.getUsers.bind(adminController))
);

router.patch('/users/:id/status',
  validate([
    param('id').isUUID(),
    body('isActive').isBoolean(),
  ]),
  asyncHandler(adminController.updateUserStatus.bind(adminController))
);

// Event management
router.get('/events',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('featured').optional().isBoolean(),
  ]),
  asyncHandler(adminController.getEvents.bind(adminController))
);

router.patch('/events/:id/featured',
  validate([
    param('id').isUUID(),
    body('isFeatured').isBoolean(),
  ]),
  asyncHandler(adminController.updateEventFeatured.bind(adminController))
);

// Report management
router.get('/reports',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'RESOLVED', 'DISMISSED']),
    query('targetType').optional().isString(),
  ]),
  asyncHandler(adminController.getReports.bind(adminController))
);

router.patch('/reports/:id',
  validate([
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'RESOLVED', 'DISMISSED']),
    body('action').optional().isString(),
    body('notes').optional().isString(),
  ]),
  asyncHandler(adminController.updateReport.bind(adminController))
);

export default router;
