import { Router } from 'express';
import multer from 'multer';
import { EventController } from '../controllers/EventController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const eventController = new EventController();

// Multer configuration for event images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});

// Public routes
router.get('/', asyncHandler(eventController.getPublicEvents.bind(eventController)));
router.get('/:id', asyncHandler(eventController.getEventById.bind(eventController)));

// Protected routes
router.use(authenticateToken);

// Event management (Event Planners only)
router.post(
  '/',
  requireRole([UserRole.EVENT_PLANNER]),
  upload.array('images', 5),
  asyncHandler(eventController.createEvent.bind(eventController))
);

router.put(
  '/:id',
  requireRole([UserRole.EVENT_PLANNER]),
  upload.array('images', 5),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

router.delete(
  '/:id',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.deleteEvent.bind(eventController))
);

// My events
router.get('/my/events', asyncHandler(eventController.getMyEvents.bind(eventController)));
router.get('/my/applications', asyncHandler(eventController.getMyApplications.bind(eventController)));

// Event applications (Creative Professionals)
router.post(
  '/:id/apply',
  requireRole([UserRole.CREATIVE_PROFESSIONAL]),
  asyncHandler(eventController.applyToEvent.bind(eventController))
);

router.put(
  '/:eventId/applications/:applicationId',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.updateApplication.bind(eventController))
);

// Bookings
router.post(
  '/:id/book',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.createBooking.bind(eventController))
);

router.get('/:id/bookings', asyncHandler(eventController.getEventBookings.bind(eventController)));

// Favorites
router.post('/:id/favorite', asyncHandler(eventController.toggleFavorite.bind(eventController)));
router.get('/my/favorites', asyncHandler(eventController.getFavorites.bind(eventController)));

export default router;
