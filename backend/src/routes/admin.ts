import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AdminController } from '../controllers/admin/adminController';
import { UserRole } from '@prisma/client';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

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
    query('search').optional().trim(),
  ]),
  asyncHandler(adminController.getUsers.bind(adminController))
);

router.patch('/users/:id/status',
  validate([
    param('id').isUUID(),
    body('isActive').isBoolean(),
    body('reason').optional().isLength({ max: 500 }),
  ]),
  asyncHandler(adminController.updateUserStatus.bind(adminController))
);

// Content moderation
router.get('/reports',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['user', 'event', 'review', 'message']),
    query('status').optional().isIn(['pending', 'resolved', 'dismissed']),
  ]),
  asyncHandler(adminController.getReports.bind(adminController))
);

router.patch('/reports/:id',
  validate([
    param('id').isUUID(),
    body('status').isIn(['resolved', 'dismissed']),
    body('action').optional().isIn(['warning', 'suspension', 'ban', 'content_removal']),
    body('notes').optional().isLength({ max: 1000 }),
  ]),
  asyncHandler(adminController.handleReport.bind(adminController))
);

// Analytics
router.get('/analytics',
  validate([
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ]),
  asyncHandler(adminController.getAnalytics.bind(adminController))
);

export default router;
