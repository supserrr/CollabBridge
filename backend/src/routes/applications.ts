import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApplicationController } from '../controllers/application/applicationController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const applicationController = new ApplicationController();

// All routes require authentication
router.use(authenticate);

// Get user's own applications (creative professionals)
router.get('/my',
  authorize('CREATIVE_PROFESSIONAL'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['PENDING', 'ACCEPTED', 'REJECTED']),
  ]),
  asyncHandler(applicationController.getMyApplications.bind(applicationController))
);

// Get pending applications for event planners (across all their events)
router.get('/pending',
  authorize('EVENT_PLANNER'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  asyncHandler(applicationController.getPendingApplications.bind(applicationController))
);

// Get application statistics
router.get('/stats',
  validate([
    query('eventId').optional().isUUID(),
  ]),
  asyncHandler(applicationController.getApplicationStatistics.bind(applicationController))
);

// Get applications for a specific event (event planner only)
router.get('/event/:eventId',
  authorize('EVENT_PLANNER'),
  validate([
    param('eventId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['PENDING', 'ACCEPTED', 'REJECTED']),
  ]),
  asyncHandler(applicationController.getEventApplications.bind(applicationController))
);

// Get specific application by ID
router.get('/:applicationId',
  validate([
    param('applicationId').isUUID(),
  ]),
  asyncHandler(applicationController.getApplicationById.bind(applicationController))
);

// Update application status (event creator only)
router.patch('/:applicationId/status',
  authorize('EVENT_PLANNER'),
  validate([
    param('applicationId').isUUID(),
    body('status').isIn(['ACCEPTED', 'REJECTED']),
    body('response').optional().trim().isLength({ max: 1000 }),
  ]),
  asyncHandler(applicationController.updateApplicationStatus.bind(applicationController))
);

// Withdraw application (applicant only)
router.delete('/:applicationId',
  authorize('CREATIVE_PROFESSIONAL'),
  validate([
    param('applicationId').isUUID(),
  ]),
  asyncHandler(applicationController.withdrawApplication.bind(applicationController))
);

export default router;
