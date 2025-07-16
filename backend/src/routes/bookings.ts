import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BookingController } from '../controllers/booking/bookingController';
import { UserRole } from '@prisma/client';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// Create booking (Event Planners only)
router.post('/',
  authorize(UserRole.EVENT_PLANNER),
  validate([
    body('professionalId').isUUID(),
    body('eventId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('rate').isFloat({ min: 0 }),
    body('description').optional().isLength({ max: 1000 }),
    body('requirements').optional().isArray(),
  ]),
  asyncHandler(bookingController.createBooking.bind(bookingController))
);

// Get my bookings
router.get('/my',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  ]),
  asyncHandler(bookingController.getMyBookings.bind(bookingController))
);

// Get booking details
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
    body('status').isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
    body('reason').optional().isLength({ max: 500 }),
  ]),
  asyncHandler(bookingController.updateBookingStatus.bind(bookingController))
);

// Add booking payment info
router.post('/:id/payment',
  validate([
    param('id').isUUID(),
    body('amount').isFloat({ min: 0 }),
    body('paymentMethod').isIn(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER']),
    body('transactionId').optional().trim(),
  ]),
  asyncHandler(bookingController.addPayment.bind(bookingController))
);

export default router;
