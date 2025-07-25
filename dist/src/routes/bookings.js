"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const bookingController_1 = require("../controllers/booking/bookingController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const bookingController = new bookingController_1.BookingController();
// All routes require authentication
router.use(auth_1.authenticate);
// Create booking (event planners only)
router.post('/', (0, auth_1.authorize)('EVENT_PLANNER'), rateLimiter_1.rateLimiters.booking, // Apply booking rate limiting
(0, validation_1.validate)([
    (0, express_validator_1.body)('professionalId').isUUID(),
    (0, express_validator_1.body)('eventId').isUUID(),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('rate').isFloat({ min: 0 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 1000 }),
    (0, express_validator_1.body)('requirements').optional().isArray(),
]), (0, errorHandler_1.asyncHandler)(bookingController.createBooking.bind(bookingController)));
// Get bookings
router.get('/', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
]), (0, errorHandler_1.asyncHandler)(bookingController.getBookings.bind(bookingController)));
// Get specific booking
router.get('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(bookingController.getBooking.bind(bookingController)));
// Update booking status
router.patch('/:id/status', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 500 }),
]), (0, errorHandler_1.asyncHandler)(bookingController.updateBookingStatus.bind(bookingController)));
exports.default = router;
//# sourceMappingURL=bookings.js.map