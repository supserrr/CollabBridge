"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const adminController_1 = require("../controllers/admin/adminController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const adminController = new adminController_1.AdminController();
// All routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('ADMIN'));
router.use(rateLimiter_1.rateLimiters.admin); // Apply admin rate limiting
// Dashboard stats
router.get('/dashboard/stats', (0, errorHandler_1.asyncHandler)(adminController.getDashboardStats.bind(adminController)));
// users management
router.get('/users', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('role').optional().isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL', 'ADMIN']),
    (0, express_validator_1.query)('isActive').optional().isBoolean(),
    (0, express_validator_1.query)('search').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(adminController.getUserss.bind(adminController)));
router.patch('/users/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('isVerified').optional().isBoolean(),
]), (0, errorHandler_1.asyncHandler)(adminController.updateusers.bind(adminController)));
// Report management
router.get('/reports', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'RESOLVED', 'DISMISSED']),
    (0, express_validator_1.query)('targetType').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(adminController.getReports.bind(adminController)));
router.patch('/reports/:id/resolve', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['RESOLVED', 'DISMISSED']),
    (0, express_validator_1.body)('action').optional().isString(),
    (0, express_validator_1.body)('notes').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(adminController.resolveReport.bind(adminController)));
exports.default = router;
//# sourceMappingURL=admin.js.map