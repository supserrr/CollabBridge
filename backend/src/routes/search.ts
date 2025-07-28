import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { SearchController } from '../controllers/search/searchController';
import { EnhancedSearchController } from '../controllers/search/enhancedSearchController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const searchController = new SearchController();
const enhancedSearchController = new EnhancedSearchController();

// Apply search-specific rate limiting
router.use(rateLimiters.search);

// Enhanced search professionals with advanced filters
router.get('/professionals',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('q').optional().isString(),
    query('location').optional().isString(),
    query('radius').optional().isInt({ min: 1, max: 100 }),
    query('categories').optional().isString(),
    query('skills').optional().isString(),
    query('min_rate').optional().isFloat({ min: 0 }),
    query('max_rate').optional().isFloat({ min: 0 }),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('min_rating').optional().isFloat({ min: 0, max: 5 }),
    query('max_response_time').optional().isInt({ min: 1 }),
    query('verified').optional().isBoolean(),
    query('languages').optional().isString(),
    query('experience').optional().isString(),
    query('sort').optional().isString(),
  ]),
  asyncHandler(enhancedSearchController.searchProfessionals.bind(enhancedSearchController))
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
