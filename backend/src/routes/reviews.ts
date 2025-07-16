import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ReviewController } from '../controllers/review/reviewController';

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get('/user/:userId',
  validate([
    param('userId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  asyncHandler(reviewController.getUserReviews.bind(reviewController))
);

// Protected routes
router.use(authenticate);

// Create review
router.post('/',
  validate([
    body('bookingId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').isLength({ min: 10, max: 1000 }),
    body('skills').optional().isArray(),
    body('communication').optional().isInt({ min: 1, max: 5 }),
    body('professionalism').optional().isInt({ min: 1, max: 5 }),
    body('quality').optional().isInt({ min: 1, max: 5 }),
  ]),
  asyncHandler(reviewController.createReview.bind(reviewController))
);

// Get my reviews
router.get('/my',
  validate([
    query('type').optional().isIn(['given', 'received']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  asyncHandler(reviewController.getMyReviews.bind(reviewController))
);

// Update review
router.put('/:id',
  validate([
    param('id').isUUID(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isLength({ min: 10, max: 1000 }),
    body('skills').optional().isArray(),
    body('communication').optional().isInt({ min: 1, max: 5 }),
    body('professionalism').optional().isInt({ min: 1, max: 5 }),
    body('quality').optional().isInt({ min: 1, max: 5 }),
  ]),
  asyncHandler(reviewController.updateReview.bind(reviewController))
);

// Delete review
router.delete('/:id',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(reviewController.deleteReview.bind(reviewController))
);

// Report review
router.post('/:id/report',
  validate([
    param('id').isUUID(),
    body('reason').isIn(['INAPPROPRIATE', 'SPAM', 'FALSE_INFORMATION', 'OTHER']),
    body('description').optional().isLength({ max: 500 }),
  ]),
  asyncHandler(reviewController.reportReview.bind(reviewController))
);

export default router;
