// backend/src/routes/uploads.js
const express = require('express');
const UploadController = require('../controllers/uploadController');
const { authenticate, requireProfessional } = require('../middleware/auth');
const { handleUploadError } = require('../config/cloudinary');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticate);

/**
 * @route   POST /api/uploads/profile
 * @desc    Upload profile picture
 * @access  Private
 */
router.post(
  '/profile',
  UploadController.uploadProfilePicture,
  handleUploadError
);

/**
 * @route   DELETE /api/uploads/profile
 * @desc    Delete profile picture
 * @access  Private
 */
router.delete(
  '/profile',
  asyncHandler(UploadController.deleteProfilePicture)
);

/**
 * @route   POST /api/uploads/portfolio
 * @desc    Upload portfolio images (professionals only)
 * @access  Private (Professionals only)
 */
router.post(
  '/portfolio',
  requireProfessional,
  UploadController.uploadPortfolioImages,
  handleUploadError
);

/**
 * @route   DELETE /api/uploads/portfolio/:publicId
 * @desc    Delete portfolio image (professionals only)
 * @access  Private (Professionals only)
 */
router.delete(
  '/portfolio/:publicId',
  requireProfessional,
  asyncHandler(UploadController.deletePortfolioImage)
);

/**
 * @route   POST /api/uploads/events/:eventId/image
 * @desc    Upload event image
 * @access  Private (Event owner only)
 */
router.post(
  '/events/:eventId/image',
  UploadController.uploadEventImage,
  handleUploadError
);

/**
 * @route   GET /api/uploads/stats
 * @desc    Get upload statistics for current user
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(UploadController.getUploadStats)
);

// Health check for uploads service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Uploads Service',
    cloudinary: 'configured',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;