// backend/src/routes/auth.js
const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, authRateLimit } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateProfileUpdate,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (planner or professional)
 * @access  Public
 * @body    { firebaseToken, name, email, role, bio?, phone?, location? }
 */
router.post(
  '/register',
  validateUserRegistration,
  handleValidationErrors,
  asyncHandler(AuthController.register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with Firebase token
 * @access  Public
 * @body    { firebaseToken }
 */
router.post(
  '/login',
  validateUserLogin,
  handleValidationErrors,
  asyncHandler(AuthController.login)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(AuthController.getProfile)
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 * @body    { name?, bio?, phone?, location?, availability_status? }
 */
router.put(
  '/profile',
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  asyncHandler(AuthController.updateProfile)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (mainly for client-side token removal)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(AuthController.logout)
);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if the current token is valid
 * @access  Private
 */
router.get(
  '/verify-token',
  authenticate,
  asyncHandler(AuthController.verifyToken)
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 * @body    { firebaseToken }
 */
router.delete(
  '/account',
  authenticate,
  asyncHandler(AuthController.deleteAccount)
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Authentication Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;