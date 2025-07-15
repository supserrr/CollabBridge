#!/bin/bash

# CollabBridge - Backend Routes Setup
echo "🛣️ Setting up CollabBridge backend routes..."

cd collabbridge-project/backend

# Create auth routes
echo "🔐 Creating src/routes/auth.ts..."
cat > src/routes/auth.ts << 'EOF'
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/verify-token', asyncHandler(authController.verifyToken.bind(authController)));
router.post('/refresh-token', asyncHandler(authController.refreshToken.bind(authController)));

// Protected routes
router.post('/logout', authenticateToken, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser.bind(authController)));

export default router;
EOF

# Create user routes
echo "👤 Creating src/routes/users.ts..."
cat > src/routes/users.ts << 'EOF'
import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const userController = new UserController();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', asyncHandler(userController.getProfile.bind(userController)));
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));
router.post('/avatar', upload.single('avatar'), asyncHandler(userController.uploadAvatar.bind(userController)));
router.delete('/avatar', asyncHandler(userController.deleteAvatar.bind(userController)));

// Creative profile specific routes
router.get('/creative-profile', asyncHandler(userController.getCreativeProfile.bind(userController)));
router.put('/creative-profile', asyncHandler(userController.updateCreativeProfile.bind(userController)));
router.post('/portfolio', upload.array('images', 10), asyncHandler(userController.uploadPortfolio.bind(userController)));

// Event planner specific routes
router.get('/event-planner', asyncHandler(userController.getEventPlannerProfile.bind(userController)));
router.put('/event-planner', asyncHandler(userController.updateEventPlannerProfile.bind(userController)));

// Activity and stats
router.get('/activity', asyncHandler(userController.getUserActivity.bind(userController)));
router.get('/stats', asyncHandler(userController.getUserStats.bind(userController)));

export default router;
EOF

# Create event routes
echo "🎉 Creating src/routes/events.ts..."
cat > src/routes/events.ts << 'EOF'
import { Router } from 'express';
import multer from 'multer';
import { EventController } from '../controllers/EventController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const eventController = new EventController();

// Multer configuration for event images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});

// Public routes
router.get('/', asyncHandler(eventController.getPublicEvents.bind(eventController)));
router.get('/:id', asyncHandler(eventController.getEventById.bind(eventController)));

// Protected routes
router.use(authenticateToken);

// Event management (Event Planners only)
router.post(
  '/',
  requireRole([UserRole.EVENT_PLANNER]),
  upload.array('images', 5),
  asyncHandler(eventController.createEvent.bind(eventController))
);

router.put(
  '/:id',
  requireRole([UserRole.EVENT_PLANNER]),
  upload.array('images', 5),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

router.delete(
  '/:id',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.deleteEvent.bind(eventController))
);

// My events
router.get('/my/events', asyncHandler(eventController.getMyEvents.bind(eventController)));
router.get('/my/applications', asyncHandler(eventController.getMyApplications.bind(eventController)));

// Event applications (Creative Professionals)
router.post(
  '/:id/apply',
  requireRole([UserRole.CREATIVE_PROFESSIONAL]),
  asyncHandler(eventController.applyToEvent.bind(eventController))
);

router.put(
  '/:eventId/applications/:applicationId',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.updateApplication.bind(eventController))
);

// Bookings
router.post(
  '/:id/book',
  requireRole([UserRole.EVENT_PLANNER]),
  asyncHandler(eventController.createBooking.bind(eventController))
);

router.get('/:id/bookings', asyncHandler(eventController.getEventBookings.bind(eventController)));

// Favorites
router.post('/:id/favorite', asyncHandler(eventController.toggleFavorite.bind(eventController)));
router.get('/my/favorites', asyncHandler(eventController.getFavorites.bind(eventController)));

export default router;
EOF

# Create search routes
echo "🔍 Creating src/routes/search.ts..."
cat > src/routes/search.ts << 'EOF'
import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const searchController = new SearchController();

// Public search routes
router.get('/professionals', asyncHandler(searchController.searchProfessionals.bind(searchController)));
router.get('/events', asyncHandler(searchController.searchEvents.bind(searchController)));
router.get('/categories', asyncHandler(searchController.getCategories.bind(searchController)));
router.get('/event-types', asyncHandler(searchController.getEventTypes.bind(searchController)));

// Location-based search
router.get('/locations', asyncHandler(searchController.getLocations.bind(searchController)));
router.get('/nearby', asyncHandler(searchController.getNearbyProfessionals.bind(searchController)));

export default router;
EOF

# Create message routes
echo "💬 Creating src/routes/messages.ts..."
cat > src/routes/messages.ts << 'EOF'
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
EOF

# Create upload routes
echo "📁 Creating src/routes/uploads.ts..."
cat > src/routes/uploads.ts << 'EOF'
import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/UploadController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const uploadController = new UploadController();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'
    ];
    
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// File upload routes
router.post(
  '/image',
  upload.single('file'),
  asyncHandler(uploadController.uploadImage.bind(uploadController))
);

router.post(
  '/document',
  upload.single('file'),
  asyncHandler(uploadController.uploadDocument.bind(uploadController))
);

router.post(
  '/multiple',
  upload.array('files', 10),
  asyncHandler(uploadController.uploadMultiple.bind(uploadController))
);

// File management
router.delete('/:publicId', asyncHandler(uploadController.deleteFile.bind(uploadController)));
router.get('/signed-url', asyncHandler(uploadController.getSignedUrl.bind(uploadController)));

export default router;
EOF

echo "✅ Backend routes setup complete!"
echo ""
echo "📋 What was created:"
echo "• src/routes/auth.ts - Authentication routes"
echo "• src/routes/users.ts - User profile management"
echo "• src/routes/events.ts - Event CRUD and applications"
echo "• src/routes/search.ts - Search functionality"
echo "• src/routes/messages.ts - Real-time messaging"
echo "• src/routes/uploads.ts - File upload handling"
echo ""
echo "🔥 Next: Run ./07_setup_backend_controllers.sh"