// backend/src/routes/events.js
const express = require('express');
const EventController = require('../controllers/eventController');
const { authenticate, optionalAuthenticate, requirePlanner } = require('../middleware/auth');
const { 
  validateEventCreation, 
  validateEventUpdate,
  validateUuidParam,
  validatePaginationQuery,
  validateSearchQuery,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   GET /api/events
 * @desc    Get all public events with filtering options
 * @access  Public (with optional authentication for personalized results)
 * @query   { location?, event_type?, date_from?, date_to?, status?, limit?, offset? }
 */
router.get(
  '/',
  optionalAuthenticate,
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(EventController.getEvents)
);

/**
 * @route   POST /api/events
 * @desc    Create a new event (planners only)
 * @access  Private (Planners only)
 * @body    { title, description, location, date, event_type?, required_roles?, budget_range?, is_public? }
 */
router.post(
  '/',
  authenticate,
  requirePlanner,
  validateEventCreation,
  handleValidationErrors,
  asyncHandler(EventController.createEvent)
);

/**
 * @route   GET /api/events/my-events
 * @desc    Get events created by the current planner
 * @access  Private (Planners only)
 * @query   { status?, include_past?, limit?, offset? }
 */
router.get(
  '/my-events',
  authenticate,
  requirePlanner,
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(EventController.getMyEvents)
);

/**
 * @route   GET /api/events/search
 * @desc    Search events by title, description, or location
 * @access  Public
 * @query   { q, date_from?, limit?, offset? }
 */
router.get(
  '/search',
  validateSearchQuery,
  handleValidationErrors,
  asyncHandler(EventController.searchEvents)
);

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics (for dashboard)
 * @access  Private (Planners only)
 */
router.get(
  '/stats',
  authenticate,
  requirePlanner,
  asyncHandler(EventController.getEventStats)
);

/**
 * @route   GET /api/events/type/:type
 * @desc    Get events by category/type
 * @access  Public
 * @params  { type }
 * @query   { limit?, offset?, date_from? }
 */
router.get(
  '/type/:type',
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(EventController.getEventsByType)
);

/**
 * @route   GET /api/events/:eventId
 * @desc    Get single event by ID
 * @access  Public (private events require ownership)
 * @params  { eventId }
 */
router.get(
  '/:eventId',
  optionalAuthenticate,
  validateUuidParam('eventId'),
  handleValidationErrors,
  asyncHandler(EventController.getEventById)
);

/**
 * @route   PUT /api/events/:eventId
 * @desc    Update an event (owner only)
 * @access  Private (Event owner only)
 * @params  { eventId }
 * @body    { title?, description?, location?, date?, event_type?, required_roles?, budget_range?, is_public?, status? }
 */
router.put(
  '/:eventId',
  authenticate,
  validateUuidParam('eventId'),
  validateEventUpdate,
  handleValidationErrors,
  asyncHandler(EventController.updateEvent)
);

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete an event (owner only)
 * @access  Private (Event owner only)
 * @params  { eventId }
 */
router.delete(
  '/:eventId',
  authenticate,
  validateUuidParam('eventId'),
  handleValidationErrors,
  asyncHandler(EventController.deleteEvent)
);

// Health check for events service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Events Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;