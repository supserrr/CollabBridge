import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { MessageController } from '../controllers/message/messageController';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticate);

// Apply message-specific rate limiting
router.use(rateLimiters.message);

// Get conversations
router.get('/conversations',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  asyncHandler(messageController.getConversations.bind(messageController))
);

// Get conversation messages
router.get('/conversations/:id',
  validate([
    param('id').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  asyncHandler(messageController.getConversationMessages.bind(messageController))
);

// Send message
router.post('/send',
  validate([
    body('recipientId').isUUID(),
    body('content').trim().isLength({ min: 1, max: 2000 }),
    body('messageType').optional().isIn(['TEXT', 'IMAGE', 'FILE', 'BOOKING_REQUEST']),
    body('metadata').optional().isObject(),
  ]),
  asyncHandler(messageController.sendMessage.bind(messageController))
);

// Mark conversation as read
router.patch('/conversations/:id/read',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(messageController.markAsRead.bind(messageController))
);

// Delete message
router.delete('/:id',
  validate([
    param('id').isUUID(),
  ]),
  asyncHandler(messageController.deleteMessage.bind(messageController))
);

export default router;
