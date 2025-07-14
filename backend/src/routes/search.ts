import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';

const router = Router();
const searchController = new SearchController();

router.get('/professionals', searchController.searchProfessionals);
router.get('/events', searchController.searchEvents);
router.get('/categories', searchController.getCategories);
router.get('/event-types', searchController.getEventTypes);

export { router as searchRoutes };
