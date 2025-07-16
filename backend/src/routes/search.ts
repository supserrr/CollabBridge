import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { SearchController } from '../controllers/search/searchController';

const router = Router();
const searchController = new SearchController();

// Search professionals
router.get('/professionals',
  optionalAuth,
  validate([
    query('q').optional().trim().isLength({ min: 1, max: 100 }),
    query('categories').optional().isArray(),
    query('location').optional().trim(),
    query('minRate').optional().isFloat({ min: 0 }),
    query('maxRate').optional().isFloat({ min: 0 }),
    query('skills').optional().isArray(),
    query('availability').optional().isBoolean(),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['rating', 'rate', 'experience', 'responseTime']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ]),
  asyncHandler(searchController.searchProfessionals.bind(searchController))
);

// Search events
router.get('/events',
  optionalAuth,
  validate([
    query('q').optional().trim().isLength({ min: 1, max: 100 }),
    query('eventType').optional().isIn(['WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']),
    query('location').optional().trim(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('minBudget').optional().isFloat({ min: 0 }),
    query('maxBudget').optional().isFloat({ min: 0 }),
    query('requiredRoles').optional().isArray(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['startDate', 'budget', 'createdAt']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ]),
  asyncHandler(searchController.searchEvents.bind(searchController))
);

// Get suggestions
router.get('/suggestions',
  validate([
    query('q').trim().isLength({ min: 1, max: 50 }),
    query('type').isIn(['professionals', 'events', 'skills', 'locations']),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ]),
  asyncHandler(searchController.getSuggestions.bind(searchController))
);

export default router;
