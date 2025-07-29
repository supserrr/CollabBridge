import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { EventController } from '../controllers/event/eventController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    query('location').optional().isString(),
    query('budgetMin').optional().isFloat({ min: 0 }),
    query('budgetMax').optional().isFloat({ min: 0 }),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('search').optional().isString(),
  ]),
  asyncHandler(eventController.getEvents.bind(eventController))
);

router.get('/:id',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.getEventById.bind(eventController))
);

// Protected routes
router.use(authenticate);

// Event planner only routes
router.post('/',
  authorize('EVENT_PLANNER'),
  rateLimiters.eventCreation, // Apply event creation rate limiting
  validate([
    body('title').trim().isLength({ min: 3, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 2000 }),
    body('eventType').isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('location').trim().isLength({ min: 2, max: 100 }),
    body('address').optional().trim().isLength({ max: 200 }),
    body('budget').optional().isFloat({ min: 0 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('requiredRoles').isArray(),
    body('tags').optional().isArray(),
    body('maxApplicants').optional().isInt({ min: 1 }),
    body('isPublic').optional().isBoolean(),
    body('requirements').optional().isString(),
    body('deadlineDate').optional().isISO8601(),
    body('images').optional().isArray(),
  ]),
  asyncHandler(eventController.createEvent.bind(eventController))
);

router.put('/:id',
  authorize('EVENT_PLANNER'),
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

router.patch('/:id/publish',
  authorize('EVENT_PLANNER'),
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.publishEvent.bind(eventController))
);

router.delete('/:id',
  authorize('EVENT_PLANNER'),
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.deleteEvent.bind(eventController))
);

router.get('/my/events',
  authorize('EVENT_PLANNER'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(eventController.getMyEvents.bind(eventController))
);

// Creative professional routes
router.post('/:id/apply',
  authorize('CREATIVE_PROFESSIONAL'),
  validate([
    param('id').isUUID(),
    body('message').optional().trim().isLength({ max: 1000 }),
    body('proposedRate').optional().isFloat({ min: 0 }),
    body('availability').optional().isObject(),
    body('portfolio').optional().isArray(),
  ]),
  asyncHandler(eventController.applyToEvent.bind(eventController))
);

export default router;
