import { Router } from 'express';
import { body, param } from 'express-validator';
import { BookingController } from '../controllers/BookingController';
import { authenticateUser, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticateUser);

router.post('/', requireRole(['EVENT_PLANNER']), [
  body('eventId').isUUID(),
  body('creativeId').isUUID(),
  body('agreedRate').optional().isNumeric(),
  body('notes').optional().trim().isLength({ max: 1000 }),
], validateRequest, bookingController.createBooking);

router.get('/my', bookingController.getMyBookings);

router.get('/:id', [
  param('id').isUUID(),
], validateRequest, bookingController.getBooking);

router.put('/:id/status', [
  param('id').isUUID(),
  body('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
  body('notes').optional().trim().isLength({ max: 500 }),
], validateRequest, bookingController.updateBookingStatus);

export { router as bookingRoutes };
