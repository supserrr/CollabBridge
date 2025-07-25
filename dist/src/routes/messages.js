"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const messageController_1 = require("../controllers/message/messageController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const messageController = new messageController_1.MessageController();
// All routes require authentication
router.use(auth_1.authenticate);
// Apply message-specific rate limiting
router.use(rateLimiter_1.rateLimiters.message);
// Get conversations
router.get('/conversations', (0, validation_1.validate)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
]), (0, errorHandler_1.asyncHandler)(messageController.getConversations.bind(messageController)));
// Get conversation messages
router.get('/conversations/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
]), (0, errorHandler_1.asyncHandler)(messageController.getConversationMessages.bind(messageController)));
// Send message
router.post('/send', (0, validation_1.validate)([
    (0, express_validator_1.body)('recipientId').isUUID(),
    (0, express_validator_1.body)('content').trim().isLength({ min: 1, max: 2000 }),
    (0, express_validator_1.body)('messageType').optional().isIn(['TEXT', 'IMAGE', 'FILE', 'BOOKING_REQUEST']),
    (0, express_validator_1.body)('metadata').optional().isObject(),
]), (0, errorHandler_1.asyncHandler)(messageController.sendMessage.bind(messageController)));
// Mark conversation as read
router.patch('/conversations/:id/read', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(messageController.markAsRead.bind(messageController)));
// Delete message
router.delete('/:id', (0, validation_1.validate)([
    (0, express_validator_1.param)('id').isUUID(),
]), (0, errorHandler_1.asyncHandler)(messageController.deleteMessage.bind(messageController)));
exports.default = router;
//# sourceMappingURL=messages.js.map