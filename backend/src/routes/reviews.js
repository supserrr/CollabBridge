// backend/src/routes/reviews.js
const express = require('express');
const ReviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { 
  validateReviewCreation, 
  validateReviewUpdate,
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
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 * @body    { to_user_id, application_id, rating, comment? }
 */
router.post(
  '/',
  authenticate,
  validateReviewCreation,
  handleValidationErrors,
  asyncHandler(ReviewController.createReview)
);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get reviews written by current user
 * @access  Private
 * @query   { limit?, offset? }
 */
router.get(
  '/my-reviews',
  authenticate,
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(ReviewController.getMyReviews)
);

/**
 * @route   GET /api/reviews/pending
 * @desc    Get pending reviews for current user (collaborations they can review)
 * @access  Private
 */
router.get(
  '/pending',
  authenticate,
  asyncHandler(ReviewController.getPendingReviews)
);

/**
 * @route   GET /api/reviews/stats
 * @desc    Get review statistics
 * @access  Public
 */
router.get(
  '/stats',
  asyncHandler(ReviewController.getReviewStats)
);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews for a specific user
 * @access  Public
 * @params  { userId }
 * @query   { rating_filter?, limit?, offset? }
 */
router.get(
  '/user/:userId',
  validateUuidParam('userId'),
  validatePaginationQuery,
  handleValidationErrors,
  asyncHandler(ReviewController.getUserReviews)
);

/**
 * @route   GET /api/reviews/application/:applicationId
 * @desc    Get reviews for a specific application/collaboration
 * @access  Private (Application parties only)
 * @params  { applicationId }
 */
router.get(
  '/application/:applicationId',
  authenticate,
  validateUuidParam('applicationId'),
  handleValidationErrors,
  asyncHandler(ReviewController.getApplicationReviews)
);

/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get single review by ID
 * @access  Public
/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review (reviewer only)
 * @access  Private (Review author only)
 * @params  { reviewId }
 * @body    { rating?, comment? }
 */
router.put(
  '/:reviewId',
  authenticate,
  validateUuidParam('reviewId'),
  validateReviewUpdate,
  handleValidationErrors,
  asyncHandler(ReviewController.updateReview)
);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review (reviewer only)
 * @access  Private (Review author only)
 * @params  { reviewId }
 */
router.delete(
  '/:reviewId',
  authenticate,
  validateUuidParam('reviewId'),
  handleValidationErrors,
  asyncHandler(ReviewController.deleteReview)
);

// Health check for reviews service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Reviews Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
 */
router.get(
  '/:reviewId',
  validateUuidParam('reviewId'),
  handleValidationErrors,
  asyncHandler(ReviewController.getReviewById)
);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review (reviewer only)
 * @access  Private (Review author only)
 * @params  { reviewId }