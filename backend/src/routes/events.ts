import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { EventController } from '../controllers/event/eventController';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    query('location').optional().isString(),
    query('budget').optional().isNumeric(),
    query('tags').optional(),
    query('search').optional().isString(),
  ]),
  asyncHandler(eventController.getEvents.bind(eventController))
);

router.get('/:id',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.getEvent.bind(eventController))
);

// Protected routes
router.use(authenticate);

// Create event (Event Planners only)
router.post('/',
  authorize('EVENT_PLANNER'),
  validate([
    body('title').trim().isLength({ min: 3, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 2000 }),
    body('eventType').isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('location').trim().isLength({ min: 3, max: 100 }),
    body('address').optional().isString(),
    body('budget').optional().isNumeric(),
    body('requiredRoles').optional().isArray(),
    body('tags').optional().isArray(),
    body('maxApplicants').optional().isInt({ min: 1 }),
    body('isPublic').optional().isBoolean(),
    body('requirements').optional().isString(),
  ]),
  asyncHandler(eventController.createEvent.bind(eventController))
);

// Get my events
router.get('/my/events',
  authorize('EVENT_PLANNER'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(eventController.getMyEvents.bind(eventController))
);

// Update event
router.put('/:id',
  authorize('EVENT_PLANNER'),
  validate([
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    body('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('location').optional().trim().isLength({ min: 3, max: 100 }),
    body('budget').optional().isNumeric(),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

// Delete event
router.delete('/:id',
  authorize('EVENT_PLANNER'),
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(eventController.deleteEvent.bind(eventController))
);

// Apply to event (Creative Professionals only)
router.post('/:id/apply',
  authorize('CREATIVE_PROFESSIONAL'),
  validate([
    param('id').isUUID(),
    body('message').optional().isLength({ max: 1000 }),
    body('proposedRate').optional().isNumeric(),
    body('availability').optional().isObject(),
    body('portfolio').optional().isArray(),
  ]),
  asyncHandler(eventController.applyToEvent.bind(eventController))
);

export default router;
