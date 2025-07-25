import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { SearchController } from '../controllers/search/searchController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const searchController = new SearchController();

// Apply search-specific rate limiting
router.use(rateLimiters.search);

// Search professionals
router.get('/professionals',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('categories').optional().isString(),
    query('location').optional().isString(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('maxRate').optional().isFloat({ min: 0 }),
    query('availability').optional().isBoolean(),
    query('skills').optional().isString(),
    query('search').optional().isString(),
  ]),
  asyncHandler(searchController.searchProfessionals.bind(searchController))
);

// Search events
router.get('/events',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('eventType').optional().isString(),
    query('location').optional().isString(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('budgetMin').optional().isFloat({ min: 0 }),
    query('budgetMax').optional().isFloat({ min: 0 }),
    query('requiredRoles').optional().isString(),
    query('search').optional().isString(),
  ]),
  asyncHandler(searchController.searchEvents.bind(searchController))
);

export default router;
