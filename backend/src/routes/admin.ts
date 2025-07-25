import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AdminController } from '../controllers/admin/adminController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const adminController = new AdminController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));
router.use(rateLimiters.admin); // Apply admin rate limiting

// Dashboard stats
router.get('/dashboard/stats',
  asyncHandler(adminController.getDashboardStats.bind(adminController))
);

// users management
router.get('/users',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL', 'ADMIN']),
    query('isActive').optional().isBoolean(),
    query('search').optional().isString(),
  ]),
  asyncHandler(adminController.getUserss.bind(adminController))
);

router.patch('/users/:id',
  validate([
    param('id').isUUID(),
    body('isActive').optional().isBoolean(),
    body('isVerified').optional().isBoolean(),
  ]),
  asyncHandler(adminController.updateusers.bind(adminController))
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

router.patch('/reports/:id/resolve',
  validate([
    param('id').isUUID(),
    body('status').isIn(['RESOLVED', 'DISMISSED']),
    body('action').optional().isString(),
    body('notes').optional().isString(),
  ]),
  asyncHandler(adminController.resolveReport.bind(adminController))
);

export default router;
