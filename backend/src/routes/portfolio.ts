import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { PortfolioController } from '../controllers/user/portfolioController';

const router = Router();
const portfolioController = new PortfolioController();

// Public routes - no authentication required

// Get public portfolio by username
router.get('/:username',
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
  ]),
  asyncHandler(portfolioController.getPortfolio.bind(portfolioController))
);

// Protected routes - require authentication and ownership verification

// Get dashboard stats
router.get('/:username/dashboard/stats',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
  ]),
  asyncHandler(portfolioController.getDashboardStats.bind(portfolioController))
);

// Get dashboard projects (including private ones)
router.get('/:username/dashboard/projects',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
  ]),
  asyncHandler(portfolioController.getDashboardProjects.bind(portfolioController))
);

// Create new project
router.post('/:username/dashboard/projects',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('imageUrl').optional().isURL(),
    body('projectUrl').optional().isURL(),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().isLength({ max: 50 }),
    body('isPublic').optional().isBoolean(),
    body('isFeatured').optional().isBoolean()
  ]),
  asyncHandler(portfolioController.createProject.bind(portfolioController))
);

// Update project
router.put('/:username/dashboard/projects/:projectId',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    param('projectId').isUUID(),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('imageUrl').optional().isURL(),
    body('projectUrl').optional().isURL(),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().isLength({ max: 50 }),
    body('isPublic').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('sortOrder').optional().isInt({ min: 0 })
  ]),
  asyncHandler(portfolioController.updateProject.bind(portfolioController))
);

// Delete project
router.delete('/:username/dashboard/projects/:projectId',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    param('projectId').isUUID()
  ]),
  asyncHandler(portfolioController.deleteProject.bind(portfolioController))
);

// Update portfolio settings
router.put('/:username/dashboard/settings',
  authenticate,
  validate([
    param('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    body('displayName').optional().trim().isLength({ min: 1, max: 100 }),
    body('bio').optional().isLength({ max: 500 }),
    body('isPublic').optional().isBoolean()
  ]),
  asyncHandler(portfolioController.updatePortfolioSettings.bind(portfolioController))
);

export default router;
