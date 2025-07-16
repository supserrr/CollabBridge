import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { SearchController } from '../controllers/search/searchController';

const router = Router();
const searchController = new SearchController();

// Search professionals
router.get('/professionals',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('categories').optional(),
    query('skills').optional(),
    query('location').optional().isString(),
    query('minRate').optional().isNumeric(),
    query('maxRate').optional().isNumeric(),
    query('availability').optional().isBoolean(),
    query('rating').optional().isNumeric(),
    query('search').optional().isString(),
  ]),
  asyncHandler(searchController.searchProfessionals.bind(searchController))
);

// Search events
router.get('/events',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    query('location').optional().isString(),
    query('minBudget').optional().isNumeric(),
    query('maxBudget').optional().isNumeric(),
    query('requiredRoles').optional(),
    query('tags').optional(),
    query('search').optional().isString(),
  ]),
  asyncHandler(searchController.searchEvents.bind(searchController))
);

// Get search filters/options
router.get('/filters',
  asyncHandler(searchController.getSearchFilters.bind(searchController))
);

export default router;
