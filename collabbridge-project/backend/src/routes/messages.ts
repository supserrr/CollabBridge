import { Router } from 'express';
import multer from 'multer';
import { MessageController } from '../controllers/MessageController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const messageController = new MessageController();

// Multer configuration for message attachments
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});

// All routes require authentication
router.use(authenticateToken);

// Conversation routes
router.get('/conversations', asyncHandler(messageController.getConversations.bind(messageController)));
router.get('/conversations/:id', asyncHandler(messageController.getConversation.bind(messageController)));
router.post('/conversations', asyncHandler(messageController.createConversation.bind(messageController)));

// Message routes
router.post(
  '/send',
  upload.array('attachments', 5),
  asyncHandler(messageController.sendMessage.bind(messageController))
);

router.put('/:id/read', asyncHandler(messageController.markAsRead.bind(messageController)));
router.put('/:id/edit', asyncHandler(messageController.editMessage.bind(messageController)));
router.delete('/:id', asyncHandler(messageController.deleteMessage.bind(messageController)));

// Bulk operations
router.put('/mark-read', asyncHandler(messageController.markMultipleAsRead.bind(messageController)));
router.get('/unread-count', asyncHandler(messageController.getUnreadCount.bind(messageController)));

export default router;
