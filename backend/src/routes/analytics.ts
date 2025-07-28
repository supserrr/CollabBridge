import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Get dashboard analytics data
router.get('/dashboard', authenticate, analyticsController.getDashboardAnalytics.bind(analyticsController));

// Get chart data for analytics
router.get('/chart-data', authenticate, analyticsController.getChartData.bind(analyticsController));

export default router;
