"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const searchController_1 = require("../controllers/search/searchController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const searchController = new searchController_1.SearchController();
// Apply search-specific rate limiting
router.use(rateLimiter_1.rateLimiters.search);
// Search professionals
router.get('/professionals', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('categories').optional().isString(),
    (0, express_validator_1.query)('location').optional().isString(),
    (0, express_validator_1.query)('minRating').optional().isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.query)('maxRate').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('availability').optional().isBoolean(),
    (0, express_validator_1.query)('skills').optional().isString(),
    (0, express_validator_1.query)('search').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(searchController.searchProfessionals.bind(searchController)));
// Search events
router.get('/events', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('eventType').optional().isString(),
    (0, express_validator_1.query)('location').optional().isString(),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601(),
    (0, express_validator_1.query)('dateTo').optional().isISO8601(),
    (0, express_validator_1.query)('budgetMin').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('budgetMax').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('requiredRoles').optional().isString(),
    (0, express_validator_1.query)('search').optional().isString(),
]), (0, errorHandler_1.asyncHandler)(searchController.searchEvents.bind(searchController)));
exports.default = router;
//# sourceMappingURL=search.js.map