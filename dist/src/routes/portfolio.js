"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const portfolioController_1 = require("../controllers/user/portfolioController");
const router = (0, express_1.Router)();
const portfolioController = new portfolioController_1.PortfolioController();
// Public routes - no authentication required
// Get public portfolio by username
router.get('/:username', (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
]), (0, errorHandler_1.asyncHandler)(portfolioController.getPortfolio.bind(portfolioController)));
// Protected routes - require authentication and ownership verification
// Get dashboard stats
router.get('/:username/dashboard/stats', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
]), (0, errorHandler_1.asyncHandler)(portfolioController.getDashboardStats.bind(portfolioController)));
// Get dashboard projects (including private ones)
router.get('/:username/dashboard/projects', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
]), (0, errorHandler_1.asyncHandler)(portfolioController.getDashboardProjects.bind(portfolioController)));
// Create new project
router.post('/:username/dashboard/projects', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('projectUrl').optional().isURL(),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('tags.*').optional().isString().isLength({ max: 50 }),
    (0, express_validator_1.body)('isPublic').optional().isBoolean(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean()
]), (0, errorHandler_1.asyncHandler)(portfolioController.createProject.bind(portfolioController)));
// Update project
router.put('/:username/dashboard/projects/:projectId', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    (0, express_validator_1.param)('projectId').isUUID(),
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1, max: 200 }),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('projectUrl').optional().isURL(),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('tags.*').optional().isString().isLength({ max: 50 }),
    (0, express_validator_1.body)('isPublic').optional().isBoolean(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean(),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 })
]), (0, errorHandler_1.asyncHandler)(portfolioController.updateProject.bind(portfolioController)));
// Delete project
router.delete('/:username/dashboard/projects/:projectId', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    (0, express_validator_1.param)('projectId').isUUID()
]), (0, errorHandler_1.asyncHandler)(portfolioController.deleteProject.bind(portfolioController)));
// Update portfolio settings
router.put('/:username/dashboard/settings', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.param)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
    (0, express_validator_1.body)('displayName').optional().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('bio').optional().isLength({ max: 500 }),
    (0, express_validator_1.body)('isPublic').optional().isBoolean()
]), (0, errorHandler_1.asyncHandler)(portfolioController.updatePortfolioSettings.bind(portfolioController)));
exports.default = router;
//# sourceMappingURL=portfolio.js.map