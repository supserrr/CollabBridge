"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const eventController_1 = require("../controllers/event/eventController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const eventController = new eventController_1.EventController();
// Public routes
router.get('/', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    (0, express_validator_1.query)('location').optional().isString(),
    (0, express_validator_1.query)('budgetMin').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('budgetMax').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601(),
    (0, express_validator_1.query)('dateTo').optional().isISO8601(),
    (0, express_validator_1.query)('search').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(eventController.getEvents.bind(eventController)));
router.get('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(eventController.getEventById.bind(eventController)));
// Protected routes
router.use(auth_1.authenticate);
// Event planner only routes
router.post('/', (0, auth_1.authorize)('EVENT_PLANNER'), rateLimiter_1.rateLimiters.eventCreation, // Apply event creation rate limiting
(0, validation_1.validate)([
    (0, express_validator_1.body)('title').trim().isLength({ min: 3, max: 100 }),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 2000 }),
    (0, express_validator_1.body)('eventType').isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('location').trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('address').optional().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('budget').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('currency').optional().isLength({ min: 3, max: 3 }),
    (0, express_validator_1.body)('requiredRoles').isArray({ min: 1 }),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('maxApplicants').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('isPublic').optional().isBoolean(),
    (0, express_validator_1.body)('requirements').optional().isString(),
    (0, express_validator_1.body)('deadlineDate').optional().isISO8601(),
]), (0, errorHandler_1.asyncHandler)(eventController.createEvent.bind(eventController)));
router.put('/:id', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(eventController.updateEvent.bind(eventController)));
router.delete('/:id', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(eventController.deleteEvent.bind(eventController)));
router.get('/my/events', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
]), (0, errorHandler_1.asyncHandler)(eventController.getMyEvents.bind(eventController)));
// Creative professional routes
router.post('/:id/apply', (0, auth_1.authorize)('CREATIVE_PROFESSIONAL'), (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('message').optional().trim().isLength({ max: 1000 }),
    (0, express_validator_1.body)('proposedRate').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('availability').optional().isObject(),
    (0, express_validator_1.body)('portfolio').optional().isArray(),
]), (0, errorHandler_1.asyncHandler)(eventController.applyToEvent.bind(eventController)));
exports.default = router;
//# sourceMappingURL=events.js.map