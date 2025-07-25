import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BookingController } from '../controllers/booking/bookingController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// Create booking (event planners only)
router.post('/',
  authorize('EVENT_PLANNER'),
  rateLimiters.booking, // Apply booking rate limiting
  validate([
    body('professionalId').isUUID(),
    body('eventId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('rate').isFloat({ min: 0 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('requirements').optional().isArray(),
  ]),
  asyncHandler(bookingController.createBooking.bind(bookingController))
);

// Get bookings
router.get('/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(bookingController.getBookings.bind(bookingController))
);

// Get specific booking
router.get('/:id',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(bookingController.getBooking.bind(bookingController))
);

// Update booking status
router.patch('/:id/status',
  validate([
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    body('notes').optional().trim().isLength({ max: 500 }),
  ]),
  asyncHandler(bookingController.updateBookingStatus.bind(bookingController))
);

export default router;
