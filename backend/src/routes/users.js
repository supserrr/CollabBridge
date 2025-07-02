// backend/src/routes/users.js
const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate, optionalAuthenticate, requireProfessional, requireOwnership } = require('../middleware/auth');
const { 
  validateProfileUpdate,
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
 * @route   GET /api/users/professionals
 * @desc    Get all creative professionals with filtering
 * @access  Public
 * @query   { location?, availability?, minRating?, limit?, offset? }
 */
router.get(
  '/professionals',
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(UserController.getProfessionals)
);

/**
 * @route   GET /api/users/professionals/search
 * @desc    Search creative professionals
 * @access  Public
 * @query   { q, location?, minRating?, limit?, offset? }
 */
router.get(
  '/professionals/search',
  validateSearchQuery,
  handleValidationErrors,
  asyncHandler(UserController.searchProfessionals)
);

/**
 * @route   GET /api/users/professionals/top-rated
 * @desc    Get top-rated creative professionals
 * @access  Public
 * @query   { limit? }
 */
router.get(
  '/professionals/top-rated',
  asyncHandler(UserController.getTopRatedProfessionals)
);

/**
 * @route   GET /api/users/professionals/location/:location
 * @desc    Get professionals by location
 * @access  Public
 * @params  { location }
 * @query   { minRating?, availability?, limit?, offset? }
 */
router.get(
  '/professionals/location/:location',
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(UserController.getProfessionalsByLocation)
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get(
  '/stats',
  asyncHandler(UserController.getUserStats)
);

/**
 * @route   GET /api/users/dashboard
 * @desc    Get dashboard summary for current user
 * @access  Private
 */
router.get(
  '/dashboard',
  authenticate,
  asyncHandler(UserController.getDashboardSummary)
);

/**
 * @route   PUT /api/users/availability
 * @desc    Toggle availability status (professionals only)
 * @access  Private (Professionals only)
 * @body    { availability_status }
 */
router.put(
  '/availability',
  authenticate,
  requireProfessional,
  handleValidationErrors,
  asyncHandler(UserController.toggleAvailability)
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Public (limited info) / Private (full info for own profile)
 * @params  { userId }
 */
router.get(
  '/:userId',
  optionalAuthenticate,
  validateUuidParam('userId'),
  handleValidationErrors,
  asyncHandler(UserController.getUserById)
);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile (owner only)
 * @access  Private (Profile owner only)
 * @params  { userId }
 * @body    { name?, bio?, phone?, location?, availability_status? }
 */
router.put(
  '/:userId',
  authenticate,
  requireOwnership('userId'),
  validateUuidParam('userId'),
  validateProfileUpdate,
  handleValidationErrors,
  asyncHandler(UserController.updateProfile)
);

// Health check for users service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Users Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;