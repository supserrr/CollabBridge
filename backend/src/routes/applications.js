// backend/src/routes/applications.js
const express = require('express');
const ApplicationController = require('../controllers/applicationController');
const { authenticate, requireProfessional, requirePlanner } = require('../middleware/auth');
const { 
  validateApplicationCreation, 
  validateApplicationStatusUpdate,
  validateBulkApplicationUpdate,
  validateUuidParam,
  validatePaginationQuery,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   POST /api/applications
 * @desc    Apply to an event (professionals only)
 * @access  Private (Professionals only)
 * @body    { event_id, message? }
 */
router.post(
  '/',
  authenticate,
  requireProfessional,
  validateApplicationCreation,
  handleValidationErrors,
  asyncHandler(ApplicationController.applyToEvent)
);

/**
 * @route   GET /api/applications/my-applications
 * @desc    Get applications submitted by the current professional
 * @access  Private (Professionals only)
 * @query   { status?, limit?, offset? }
 */
router.get(
  '/my-applications',
  authenticate,
  requireProfessional,
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(ApplicationController.getMyApplications)
);

/**
 * @route   GET /api/applications/stats
 * @desc    Get application statistics for current user
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(ApplicationController.getApplicationStats)
);

/**
 * @route   PUT /api/applications/bulk-update
 * @desc    Bulk update application status (planners only)
 * @access  Private (Planners only)
 * @body    { application_ids[], status, response_message? }
 */
router.put(
  '/bulk-update',
  authenticate,
  requirePlanner,
  validateBulkApplicationUpdate,
  handleValidationErrors,
  asyncHandler(ApplicationController.bulkUpdateApplications)
);

/**
 * @route   GET /api/applications/event/:eventId
 * @desc    Get all applications for a specific event (event owner only)
 * @access  Private (Event owner only)
 * @params  { eventId }
 * @query   { status?, limit?, offset? }
 */
router.get(
  '/event/:eventId',
  authenticate,
  validateUuidParam('eventId'),
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(ApplicationController.getEventApplications)
);

/**
 * @route   GET /api/applications/:applicationId
 * @desc    Get single application by ID
 * @access  Private (Application parties only)
 * @params  { applicationId }
 */
router.get(
  '/:applicationId',
  authenticate,
  validateUuidParam('applicationId'),
  handleValidationErrors,
  asyncHandler(ApplicationController.getApplicationById)
);

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Update application status (planners only)
 * @access  Private (Event owner only)
 * @params  { applicationId }
 * @body    { status, response_message? }
 */
router.put(
  '/:applicationId/status',
  authenticate,
  validateUuidParam('applicationId'),
  validateApplicationStatusUpdate,
  handleValidationErrors,
  asyncHandler(ApplicationController.updateApplicationStatus)
);

/**
 * @route   DELETE /api/applications/:applicationId
 * @desc    Withdraw application (professionals only)
 * @access  Private (Application owner only)
 * @params  { applicationId }
 */
router.delete(
  '/:applicationId',
  authenticate,
  validateUuidParam('applicationId'),
  handleValidationErrors,
  asyncHandler(ApplicationController.withdrawApplication)
);

// Health check for applications service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Applications Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;