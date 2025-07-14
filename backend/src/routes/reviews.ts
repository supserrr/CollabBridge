import { Router } from 'express';
import { body, param } from 'express-validator';
import { ReviewController } from '../controllers/ReviewController';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get('/user/:userId', [
  param('userId').isUUID(),
], validateRequest, reviewController.getReviews);

// Protected routes
router.use(authenticateUser);

router.post('/', [
  body('receiverId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('eventId').optional().isUUID(),
], validateRequest, reviewController.createReview);

router.get('/my', reviewController.getMyReviews);

router.put('/:id', [
  param('id').isUUID(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
], validateRequest, reviewController.updateReview);

router.delete('/:id', [
  param('id').isUUID(),
], validateRequest, reviewController.deleteReview);

export { router as reviewRoutes };
