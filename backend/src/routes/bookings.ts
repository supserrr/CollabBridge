import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BookingController } from '../controllers/booking/bookingController';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// Create booking (Event Planners only)
router.post('/',
  authorize('EVENT_PLANNER'),
  validate([
    body('eventId').isUUID(),
    body('professionalId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('rate').isNumeric(),
    body('description').optional().isString(),
    body('requirements').optional().isArray(),
  ]),
  asyncHandler(bookingController.createBooking.bind(bookingController))
);

// Get bookings
router.get('/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
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
    body('notes').optional().isString(),
  ]),
  asyncHandler(bookingController.updateBookingStatus.bind(bookingController))
);

export default router;
