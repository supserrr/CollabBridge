import { Router } from 'express';
import { body, param } from 'express-validator';
import { MessageController } from '../controllers/MessageController';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticateUser);

router.post('/', [
  body('receiverId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('attachments').optional().isArray(),
  body('messageType').optional().isIn(['TEXT', 'IMAGE', 'DOCUMENT', 'VOICE']),
  body('eventId').optional().isUUID(),
], validateRequest, messageController.sendMessage);

router.get('/conversations', messageController.getConversations);

router.get('/user/:userId', [
  param('userId').isUUID(),
], validateRequest, messageController.getMessages);

router.put('/:messageId/read', [
  param('messageId').isUUID(),
], validateRequest, messageController.markAsRead);

router.get('/unread-count', messageController.getUnreadCount);

export { router as messageRoutes };
