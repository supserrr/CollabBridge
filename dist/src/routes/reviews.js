"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const reviewController_1 = require("../controllers/review/reviewController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const reviewController = new reviewController_1.ReviewController();
// All routes require authentication
router.use(auth_1.authenticate);
// Create review
router.post('/', rateLimiter_1.rateLimiters.review, // Apply review rate limiting
(0, validation_1.validate)([
    (0, express_validator_1.body)('bookingId').isUUID(),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment').trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('skills').optional().isArray(),
    (0, express_validator_1.body)('communication').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('professionalism').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('quality').optional().isInt({ min: 1, max: 5 }),
]), (0, errorHandler_1.asyncHandler)(reviewController.createReview.bind(reviewController)));
// Get reviews
router.get('/', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('userId').optional().isUUID(),
    (0, express_validator_1.query)('professionalId').optional().isUUID(),
]), (0, errorHandler_1.asyncHandler)(reviewController.getReviews.bind(reviewController)));
// Get review by ID
router.get('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(reviewController.getReviewById.bind(reviewController)));
// Update review
router.put('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment').optional().trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('skills').optional().isArray(),
    (0, express_validator_1.body)('communication').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('professionalism').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('quality').optional().isInt({ min: 1, max: 5 }),
]), (0, errorHandler_1.asyncHandler)(reviewController.updateReview.bind(reviewController)));
// Delete review
router.delete('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(reviewController.deleteReview.bind(reviewController)));
exports.default = router;
//# sourceMappingURL=reviews.js.map