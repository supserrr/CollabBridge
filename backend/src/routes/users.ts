import { Router } from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers/UserController';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticateUser);

router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('language').optional().isIn(['en', 'es', 'fr', 'de', 'pt']),
], validateRequest, userController.updateProfile);

router.put('/creative-profile', [
  body('categories').optional().isArray(),
  body('portfolioImages').optional().isArray(),
  body('portfolioLinks').optional().isArray(),
  body('hourlyRate').optional().isNumeric(),
  body('experience').optional().trim().isLength({ max: 2000 }),
  body('equipment').optional().trim().isLength({ max: 1000 }),
  body('isAvailable').optional().isBoolean(),
], validateRequest, userController.updateCreativeProfile);

router.put('/event-planner-profile', [
  body('companyName').optional().trim().isLength({ max: 200 }),
  body('website').optional().isURL(),
], validateRequest, userController.updateEventPlannerProfile);

router.post('/unavailable-dates', [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').optional().trim().isLength({ max: 500 }),
], validateRequest, userController.setUnavailableDates);

router.get('/unavailable-dates', userController.getUnavailableDates);
router.delete('/unavailable-dates/:id', [
  param('id').isUUID(),
], validateRequest, userController.deleteUnavailableDate);

export { router as userRoutes };
