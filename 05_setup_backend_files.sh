#!/bin/bash

# CollabBridge - Backend Core Files Setup
echo "🔧 Setting up CollabBridge backend core files..."

cd collabbridge-project/backend

# Create Prisma schema
echo "🗄️ Creating prisma/schema.prisma..."
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm]
}

model User {
  id            String   @id @default(cuid())
  firebaseUid   String   @unique
  email         String   @unique
  name          String
  role          UserRole
  location      String?
  bio           String?
  avatar        String?
  phone         String?
  timezone      String   @default("UTC")
  language      String   @default("en")
  isVerified    Boolean  @default(false)
  isActive      Boolean  @default(true)
  marketingConsent Boolean @default(false)
  lastActiveAt  DateTime @default(now())
  verificationDocs Json?
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  eventPlanner       EventPlanner?
  creativeProfile    CreativeProfile?
  sentMessages       Message[]        @relation("SentMessages")
  receivedMessages   Message[]        @relation("ReceivedMessages")
  givenReviews      Review[]         @relation("ReviewGiver")
  receivedReviews   Review[]         @relation("ReviewReceiver")
  eventApplications  EventApplication[]
  bookings          Booking[]
  notifications     Notification[]
  promotions        Promotion[]
  activities        UserActivity[]
  favorites         Favorite[]

  @@map("users")
  @@index([role, isActive])
  @@index([email])
  @@index([firebaseUid])
}

model EventPlanner {
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName String?
  website     String?
  taxId       String?
  
  // Relationships
  events      Event[]
  bookings    Booking[]
  templates   EventTemplate[]

  @@map("event_planners")
}

model CreativeProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories        String[] 
  portfolioImages   String[] 
  portfolioLinks    String[] 
  hourlyRate        Float?
  dailyRate         Float?
  experience        String?
  equipment         String?
  skills            String[]
  languages         String[]
  availableFrom     DateTime?
  availableTo       DateTime?
  workingHours      Json? 
  isAvailable       Boolean  @default(true)
  responseTime      Int?     @default(24) // hours
  completedProjects Int      @default(0)
  
  // Relationships
  applications      EventApplication[]
  bookings          Booking[]
  unavailableDates  UnavailableDate[]
  certifications    Certification[]

  @@map("creative_profiles")
  @@index([categories])
  @@index([isAvailable])
}

model Event {
  id           String      @id @default(cuid())
  title        String
  description  String
  eventType    EventType
  date         DateTime
  endDate      DateTime?
  location     String
  address      String?
  coordinates  Json?       // lat/lng
  budget       Float?
  minBudget    Float?
  maxBudget    Float?
  requiredRoles String[]
  images       String[]
  tags         String[]
  status       EventStatus @default(ACTIVE)
  isPublic     Boolean     @default(true)
  isFeatured   Boolean     @default(false)
  
  // Relations
  plannerId    String
  planner      EventPlanner @relation(fields: [plannerId], references: [id], onDelete: Cascade)
  applications EventApplication[]
  bookings     Booking[]
  favorites    Favorite[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("events")
  @@index([eventType, status])
  @@index([date])
  @@index([location])
  @@index([isFeatured, status])
}

model EventTemplate {
  id               String @id @default(cuid())
  name             String
  description      String
  eventType        EventType
  defaultBudgetRange Json?
  typicalRoles     String[]
  estimatedDuration Int? // hours
  isPublic         Boolean @default(false)
  
  createdById      String
  createdBy        EventPlanner @relation(fields: [createdById], references: [id], onDelete: Cascade)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("event_templates")
}

model EventApplication {
  id          String            @id @default(cuid())
  eventId     String
  event       Event             @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  creativeId  String
  creative    CreativeProfile   @relation(fields: [creativeId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  message     String?
  proposedRate Float?
  portfolio   String[]
  status      ApplicationStatus @default(PENDING)
  appliedAt   DateTime          @default(now())
  respondedAt DateTime?
  
  @@unique([eventId, creativeId])
  @@map("event_applications")
  @@index([status])
  @@index([appliedAt])
}

model Booking {
  id          String        @id @default(cuid())
  eventId     String
  event       Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  plannerId   String
  planner     EventPlanner  @relation(fields: [plannerId], references: [id], onDelete: Cascade)
  
  creativeId  String
  creative    CreativeProfile @relation(fields: [creativeId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  agreedRate  Float?
  status      BookingStatus @default(PENDING)
  notes       String?
  contractUrl String?
  startDate   DateTime?
  endDate     DateTime?
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@unique([eventId, creativeId])
  @@map("bookings")
  @@index([status])
}

model Review {
  id          String @id @default(cuid())
  rating      Int    @db.SmallInt
  comment     String?
  helpfulCount Int   @default(0)
  
  giverId     String
  giver       User   @relation("ReviewGiver", fields: [giverId], references: [id], onDelete: Cascade)
  
  receiverId  String
  receiver    User   @relation("ReviewReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  eventId     String?
  bookingId   String?
  
  createdAt   DateTime @default(now())
  
  @@map("reviews")
  @@index([receiverId, rating])
}

model Message {
  id          String      @id @default(cuid())
  content     String
  attachments String[]
  messageType MessageType @default(TEXT)
  isRead      Boolean     @default(false)
  isEdited    Boolean     @default(false)
  replyToId   String?
  
  senderId    String
  sender      User        @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  
  receiverId  String
  receiver    User        @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  
  eventId     String?
  roomId      String?
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@map("messages")
  @@index([senderId, receiverId, createdAt])
  @@index([receiverId, isRead])
}

model Certification {
  id                   String  @id @default(cuid())
  creativeProfileId    String
  creative             CreativeProfile @relation(fields: [creativeProfileId], references: [id], onDelete: Cascade)
  
  name                 String
  issuingOrganization  String
  issueDate            DateTime
  expiryDate           DateTime?
  documentUrl          String?
  verifiedAt           DateTime?
  
  createdAt            DateTime @default(now())
  
  @@map("certifications")
}

model UnavailableDate {
  id          String          @id @default(cuid())
  startDate   DateTime
  endDate     DateTime
  reason      String?
  isRecurring Boolean         @default(false)
  recurrencePattern Json?
  
  creativeId  String
  creative    CreativeProfile @relation(fields: [creativeId], references: [id], onDelete: Cascade)
  
  @@map("unavailable_dates")
  @@index([creativeId, startDate, endDate])
}

model Notification {
  id        String           @id @default(cuid())
  title     String
  message   String
  type      NotificationType
  isRead    Boolean          @default(false)
  data      Json?
  actionUrl String?
  
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime         @default(now())
  expiresAt DateTime?
  
  @@map("notifications")
  @@index([userId, isRead, createdAt])
}

model Promotion {
  id          String         @id @default(cuid())
  type        PromotionType
  startDate   DateTime
  endDate     DateTime
  amount      Float
  isActive    Boolean        @default(true)
  clicks      Int            @default(0)
  impressions Int            @default(0)
  
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime       @default(now())
  
  @@map("promotions")
  @@index([userId, isActive])
}

model UserActivity {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  activityType String
  metadata     Json?
  ipAddress    String?
  userAgent    String?
  
  createdAt    DateTime @default(now())
  
  @@map("user_activities")
  @@index([userId, createdAt])
  @@index([activityType])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  eventId   String?
  event     Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // For favoriting professionals (future feature)
  profileId String?
  
  createdAt DateTime @default(now())
  
  @@unique([userId, eventId])
  @@map("favorites")
}

// Enums
enum UserRole {
  EVENT_PLANNER
  CREATIVE_PROFESSIONAL
  ADMIN
  SUPER_ADMIN
}

enum EventType {
  WEDDING
  CORPORATE
  BIRTHDAY
  ANNIVERSARY
  GRADUATION
  BABY_SHOWER
  CONCERT
  FESTIVAL
  CONFERENCE
  WORKSHOP
  EXHIBITION
  CHARITY
  SPORTS
  FASHION_SHOW
  OTHER
}

enum EventStatus {
  ACTIVE
  DRAFT
  CANCELLED
  COMPLETED
  EXPIRED
  POSTPONED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
  EXPIRED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  DISPUTE
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  VOICE
  VIDEO
  LOCATION
}

enum NotificationType {
  APPLICATION_RECEIVED
  APPLICATION_ACCEPTED
  APPLICATION_REJECTED
  BOOKING_CONFIRMED
  BOOKING_CANCELLED
  MESSAGE_RECEIVED
  REVIEW_RECEIVED
  EVENT_REMINDER
  PAYMENT_RECEIVED
  PROMOTION_EXPIRING
  SYSTEM_ANNOUNCEMENT
  VERIFICATION_COMPLETE
}

enum PromotionType {
  PROFILE_BOOST
  FEATURED_EVENT
  PRIORITY_LISTING
  SPONSORED_POST
}
EOF

# Create seed file
echo "🌱 Creating prisma/seed.ts..."
cat > prisma/seed.ts << 'EOF'
import { PrismaClient, UserRole, EventType, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      location: 'Global',
      bio: 'Platform administrator',
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample event planner
  const plannerUser = await prisma.user.upsert({
    where: { email: 'planner@example.com' },
    update: {},
    create: {
      firebaseUid: 'planner-firebase-uid',
      email: 'planner@example.com',
      name: 'Sarah Johnson',
      role: UserRole.EVENT_PLANNER,
      location: 'New York, NY',
      bio: 'Professional event planner with 10+ years experience',
      isVerified: true,
      isActive: true,
    },
  });

  const eventPlanner = await prisma.eventPlanner.upsert({
    where: { userId: plannerUser.id },
    update: {},
    create: {
      userId: plannerUser.id,
      companyName: 'Elite Events NYC',
      website: 'https://eliteevents.com',
    },
  });

  // Create sample creative professional
  const creativeUser = await prisma.user.upsert({
    where: { email: 'photographer@example.com' },
    update: {},
    create: {
      firebaseUid: 'creative-firebase-uid',
      email: 'photographer@example.com',
      name: 'Alex Chen',
      role: UserRole.CREATIVE_PROFESSIONAL,
      location: 'Los Angeles, CA',
      bio: 'Wedding and corporate photographer',
      isVerified: true,
      isActive: true,
    },
  });

  const creativeProfile = await prisma.creativeProfile.upsert({
    where: { userId: creativeUser.id },
    update: {},
    create: {
      userId: creativeUser.id,
      categories: ['photographer', 'videographer'],
      hourlyRate: 150.0,
      experience: '8 years of professional photography',
      equipment: 'Canon 5D Mark IV, professional lighting equipment',
      skills: ['portrait', 'wedding', 'corporate', 'event'],
      languages: ['en', 'es'],
      isAvailable: true,
      responseTime: 6,
      completedProjects: 142,
    },
  });

  // Create sample events
  const sampleEvent = await prisma.event.create({
    data: {
      title: 'Sarah & Mike Wedding',
      description: 'Beautiful outdoor wedding ceremony and reception',
      eventType: EventType.WEDDING,
      date: new Date('2024-06-15T16:00:00Z'),
      endDate: new Date('2024-06-15T23:00:00Z'),
      location: 'Central Park, New York',
      address: 'Central Park Conservatory Garden, New York, NY',
      budget: 5000.0,
      requiredRoles: ['photographer', 'videographer', 'florist'],
      status: EventStatus.ACTIVE,
      isPublic: true,
      plannerId: eventPlanner.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - Admin user: ${adminUser.email}`);
  console.log(`   - Event planner: ${plannerUser.email}`);
  console.log(`   - Creative professional: ${creativeUser.email}`);
  console.log(`   - Sample event: ${sampleEvent.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
EOF

# Create main server file
echo "🚀 Creating src/server.ts..."
cat > src/server.ts << 'EOF'
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`👋 User ${socket.id} left room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start server
async function startServer() {
  try {
    await connectDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🔒 Server closed');
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('🔒 Server closed');
  });
});
EOF

# Create main app file
echo "📱 Creating src/app.ts..."
cat > src/app.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import searchRoutes from './routes/search';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/uploads';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      imgSrc: ['*', 'data:', 'blob:'],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4321',
    'http://localhost:3000',
    'https://vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
EOF

# Create database configuration
echo "🗄️ Creating src/config/database.ts..."
cat > src/config/database.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('📦 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
EOF

# Create Firebase configuration
echo "🔥 Creating src/config/firebase.ts..."
cat > src/config/firebase.ts << 'EOF'
import * as admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export default admin;
EOF

# Create Cloudinary configuration
echo "☁️ Creating src/config/cloudinary.ts..."
cat > src/config/cloudinary.ts << 'EOF'
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'uploads',
  options: any = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};
EOF

# Create error handler middleware
echo "⚠️ Creating src/middleware/errorHandler.ts..."
cat > src/middleware/errorHandler.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
EOF

# Create request logger middleware
echo "📝 Creating src/middleware/requestLogger.ts..."
cat > src/middleware/requestLogger.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };
    
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(JSON.stringify(logData, null, 2));
    }
  });
  
  next();
};
EOF

# Create auth middleware
echo "🔐 Creating src/middleware/auth.ts..."
cat > src/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { prisma } from '../config/database';
import { createError } from './errorHandler';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Access token required', 401);
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(createError(error.message || 'Invalid token', 401));
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw createError('Insufficient permissions', 403);
    }

    next();
  };
};

export const requireVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isVerified) {
    throw createError('Account verification required', 403);
  }
  next();
};
EOF

echo "✅ Backend core files setup complete!"
echo ""
echo "📋 What was created:"
echo "• prisma/schema.prisma - Complete database schema"
echo "• prisma/seed.ts - Database seeding script"
echo "• src/server.ts - Main server with Socket.IO"
echo "• src/app.ts - Express app configuration"
echo "• src/config/database.ts - Prisma database config"
echo "• src/config/firebase.ts - Firebase Admin config"
echo "• src/config/cloudinary.ts - File upload config"
echo "• src/middleware/errorHandler.ts - Error handling"
echo "• src/middleware/requestLogger.ts - Request logging"
echo "• src/middleware/auth.ts - Authentication middleware"
echo ""
echo "🔥 Next: Run ./06_setup_backend_routes.sh"