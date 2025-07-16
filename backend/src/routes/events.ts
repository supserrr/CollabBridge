import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { EventController } from '../controllers/event/eventController';
import { UserRole } from '@prisma/client';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/',
  optionalAuth,
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    query('location').optional().trim(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
  ]),
  asyncHandler(eventController.getEvents.bind(eventController))
);

// Get single event
router.get('/:id',
  optionalAuth,
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.getEvent.bind(eventController))
);

// Protected routes
router.use(authenticate);

// Create event (Event Planners only)
router.post('/',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    body('title').trim().isLength({ min: 3, max: 100 }),
    body('description').isLength({ min: 10, max: 2000 }),
    body('eventType').isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('location').trim().isLength({ min: 3, max: 200 }),
    body('budget').optional().isFloat({ min: 0 }),
    body('requiredRoles').isArray(),
    body('maxApplicants').optional().isInt({ min: 1 }),
  ]),
  asyncHandler(eventController.createEvent.bind(eventController))
);

// Update event
router.put('/:id',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().isLength({ min: 10, max: 2000 }),
    body('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('location').optional().trim().isLength({ min: 3, max: 200 }),
    body('budget').optional().isFloat({ min: 0 }),
    body('requiredRoles').optional().isArray(),
  ]),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

// Delete event
router.delete('/:id',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.deleteEvent.bind(eventController))
);

// Get my events
router.get('/my/events',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(eventController.getMyEvents.bind(eventController))
);

// Apply to event (Creative Professionals only)
router.post('/:id/apply',
  authorize(UserRole.CREATIVE_PROFESSIONAL),
  validate([
    param('id').isUUID(),
    body('message').optional().isLength({ max: 500 }),
    body('proposedRate').optional().isFloat({ min: 0 }),
  ]),
  asyncHandler(eventController.applyToEvent.bind(eventController))
);

// Get event applications
router.get('/:id/applications',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    param('id').isUUID(),
    query('status').optional().isIn(['PENDING', 'ACCEPTED', 'REJECTED']),
  ]),
  asyncHandler(eventController.getEventApplications.bind(eventController))
);

// Update application status
router.patch('/:eventId/applications/:applicationId',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    param('eventId').isUUID(),
    param('applicationId').isUUID(),
    body('status').isIn(['ACCEPTED', 'REJECTED']),
    body('response').optional().isLength({ max: 500 }),
  ]),
  asyncHandler(eventController.updateApplicationStatus.bind(eventController))
);

export default router;
