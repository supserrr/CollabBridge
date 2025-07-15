import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const searchController = new SearchController();

// Public search routes
router.get('/professionals', asyncHandler(searchController.searchProfessionals.bind(searchController)));
router.get('/events', asyncHandler(searchController.searchEvents.bind(searchController)));
router.get('/categories', asyncHandler(searchController.getCategories.bind(searchController)));
router.get('/event-types', asyncHandler(searchController.getEventTypes.bind(searchController)));

// Location-based search
router.get('/locations', asyncHandler(searchController.getLocations.bind(searchController)));
router.get('/nearby', asyncHandler(searchController.getNearbyProfessionals.bind(searchController)));

export default router;
