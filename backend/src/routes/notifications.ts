import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount,
} from '../controllers/notification/notificationController';
import { authenticate } from '../middleware/auth';
import { rateLimiters } from '../middleware/rateLimiter';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all notifications for the authenticated user
router.get(
  '/',
  rateLimiters.message, // Using message limiter since no specific notification limiter exists
  getNotifications
);

// Get unread notifications count
router.get(
  '/unread-count',
  rateLimiters.global,
  getUnreadCount
);

// Mark notification as read
router.patch(
  '/:id/read',
  rateLimiters.global,
  markAsRead
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  rateLimiters.global,
  markAllAsRead
);

// Delete notification
router.delete(
  '/:id',
  rateLimiters.global,
  deleteNotification
);

// Create notification (for system/admin use)
router.post(
  '/',
  rateLimiters.message,
  createNotification
);

export default router;
