import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { EventController } from '../controllers/EventController';
import { ApplicationController } from '../controllers/ApplicationController';
import { authenticateUser, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const eventController = new EventController();
const applicationController = new ApplicationController();

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', [
  param('id').isUUID(),
], validateRequest, eventController.getEvent);

// Protected routes
router.use(authenticateUser);

// Event management (Event Planners only)
router.post('/', requireRole(['EVENT_PLANNER']), [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('eventType').isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'ANNIVERSARY', 'GRADUATION', 'BABY_SHOWER', 'CONCERT', 'FESTIVAL', 'CONFERENCE', 'WORKSHOP', 'OTHER']),
  body('date').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').trim().isLength({ min: 2, max: 200 }),
  body('address').optional().trim().isLength({ max: 500 }),
  body('budget').optional().isNumeric(),
  body('requiredRoles').isArray(),
  body('images').optional().isArray(),
  body('isPublic').optional().isBoolean(),
], validateRequest, eventController.createEvent);

router.get('/my/events', requireRole(['EVENT_PLANNER']), eventController.getMyEvents);

router.put('/:id', requireRole(['EVENT_PLANNER']), [
  param('id').isUUID(),
], validateRequest, eventController.updateEvent);

router.delete('/:id', requireRole(['EVENT_PLANNER']), [
  param('id').isUUID(),
], validateRequest, eventController.deleteEvent);

router.post('/:id/feature', requireRole(['EVENT_PLANNER']), [
  param('id').isUUID(),
  body('duration').optional().isInt({ min: 1, max: 90 }),
], validateRequest, eventController.featureEvent);

// Application routes
router.post('/:eventId/apply', requireRole(['CREATIVE_PROFESSIONAL']), [
  param('eventId').isUUID(),
  body('message').optional().trim().isLength({ max: 1000 }),
  body('proposedRate').optional().isNumeric(),
], validateRequest, applicationController.applyToEvent);

router.get('/my/applications', requireRole(['CREATIVE_PROFESSIONAL']), applicationController.getMyApplications);

router.get('/:eventId/applications', requireRole(['EVENT_PLANNER']), [
  param('eventId').isUUID(),
], validateRequest, applicationController.getEventApplications);

router.put('/applications/:id/status', requireRole(['EVENT_PLANNER']), [
  param('id').isUUID(),
  body('status').isIn(['ACCEPTED', 'REJECTED']),
  body('notes').optional().trim().isLength({ max: 500 }),
], validateRequest, applicationController.updateApplicationStatus);

router.put('/applications/:id/withdraw', requireRole(['CREATIVE_PROFESSIONAL']), [
  param('id').isUUID(),
], validateRequest, applicationController.withdrawApplication);

export { router as eventRoutes };
