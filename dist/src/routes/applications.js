"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const applicationController_1 = require("../controllers/application/applicationController");
const router = (0, express_1.Router)();
const applicationController = new applicationController_1.ApplicationController();
// All routes require authentication
router.use(auth_1.authenticate);
// Get user's own applications (creative professionals)
router.get('/my', (0, auth_1.authorize)('CREATIVE_PROFESSIONAL'), (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'ACCEPTED', 'REJECTED']),
]), (0, errorHandler_1.asyncHandler)(applicationController.getMyApplications.bind(applicationController)));
// Get pending applications for event planners (across all their events)
router.get('/pending', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
]), (0, errorHandler_1.asyncHandler)(applicationController.getPendingApplications.bind(applicationController)));
// Get application statistics
router.get('/stats', (0, validation_1.validate)([
    (0, express_validator_1.query)('eventId').optional().isUUID(),
]), (0, errorHandler_1.asyncHandler)(applicationController.getApplicationStatistics.bind(applicationController)));
// Get applications for a specific event (event planner only)
router.get('/event/:eventId', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.param)('eventId').isUUID(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'ACCEPTED', 'REJECTED']),
]), (0, errorHandler_1.asyncHandler)(applicationController.getEventApplications.bind(applicationController)));
// Get specific application by ID
router.get('/:applicationId', (0, validation_1.validate)([
    (0, express_validator_1.param)('applicationId').isUUID(),
]), (0, errorHandler_1.asyncHandler)(applicationController.getApplicationById.bind(applicationController)));
// Update application status (event creator only)
router.patch('/:applicationId/status', (0, auth_1.authorize)('EVENT_PLANNER'), (0, validation_1.validate)([
    (0, express_validator_1.param)('applicationId').isUUID(),
    (0, express_validator_1.body)('status').isIn(['ACCEPTED', 'REJECTED']),
    (0, express_validator_1.body)('response').optional().trim().isLength({ max: 1000 }),
]), (0, errorHandler_1.asyncHandler)(applicationController.updateApplicationStatus.bind(applicationController)));
// Withdraw application (applicant only)
router.delete('/:applicationId', (0, auth_1.authorize)('CREATIVE_PROFESSIONAL'), (0, validation_1.validate)([
    (0, express_validator_1.param)('applicationId').isUUID(),
]), (0, errorHandler_1.asyncHandler)(applicationController.withdrawApplication.bind(applicationController)));
exports.default = router;
//# sourceMappingURL=applications.js.map