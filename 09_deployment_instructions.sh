#!/bin/bash

# CollabBridge - Final Setup and Deployment Instructions
echo "🚀 CollabBridge Final Setup and Deployment Instructions"

cd collabbridge-project

# Create MessageController and UploadController
echo "💬 Creating remaining controllers..."

# MessageController
cat > backend/src/controllers/MessageController.ts << 'EOF'
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { receiverId: req.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ conversations });
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { receiverId, content, messageType = 'TEXT', eventId } = req.body;

      let attachmentUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file: Express.Multer.File) =>
          uploadToCloudinary(file.buffer, 'messages')
        );
        const results = await Promise.all(uploadPromises);
        attachmentUrls = results.map((result) => result.secure_url);
      }

      const message = await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId,
          content,
          messageType,
          attachments: attachmentUrls,
          eventId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      await prisma.message.update({
        where: {
          id,
          receiverId: req.user.id,
        },
        data: { isRead: true },
      });

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const count = await prisma.message.count({
        where: {
          receiverId: req.user.id,
          isRead: false,
        },
      });

      res.json({ unreadCount: count });
    } catch (error) {
      throw error;
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: id },
            { senderId: id, receiverId: req.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      });

      res.json({ messages: messages.reverse() });
    } catch (error) {
      throw error;
    }
  }

  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { participantId } = req.body;

      const participant = await prisma.user.findUnique({
        where: { id: participantId },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      if (!participant) {
        throw createError('Participant not found', 404);
      }

      res.json({
        conversation: {
          participant,
          lastMessage: null,
          unreadCount: 0,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async editMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { content } = req.body;

      const updatedMessage = await prisma.message.update({
        where: {
          id,
          senderId: req.user.id,
        },
        data: {
          content,
          isEdited: true,
        },
      });

      res.json({
        message: 'Message updated successfully',
        data: updatedMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      await prisma.message.delete({
        where: {
          id,
          senderId: req.user.id,
        },
      });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      throw error;
    }
  }

  async markMultipleAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { messageIds } = req.body;

      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: req.user.id,
        },
        data: { isRead: true },
      });

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      throw error;
    }
  }
}
EOF

# UploadController
cat > backend/src/controllers/UploadController.ts << 'EOF'
import { Request, Response } from 'express';
import { uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

export class UploadController {
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'images',
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        }
      );

      res.json({
        message: 'Image uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'documents',
        {
          resource_type: 'auto',
        }
      );

      res.json({
        message: 'Document uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw createError('No files uploaded', 400);
      }

      const uploadPromises = req.files.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.buffer, 'uploads')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        message: 'Files uploaded successfully',
        files: results.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        })),
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { publicId } = req.params;

      await cloudinary.uploader.destroy(publicId);

      res.json({
        message: 'File deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async getSignedUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { publicId, transformation } = req.query;

      const signedUrl = cloudinary.url(publicId as string, {
        sign_url: true,
        type: 'authenticated',
        transformation: transformation as string,
      });

      res.json({
        signedUrl,
      });
    } catch (error) {
      throw error;
    }
  }
}
EOF

# Create types file
echo "📝 Creating TypeScript types..."
cat > backend/src/types/index.ts << 'EOF'
import { UserRole, EventType, EventStatus, ApplicationStatus, BookingStatus, MessageType, NotificationType, PromotionType } from '@prisma/client';

export {
  UserRole,
  EventType,
  EventStatus,
  ApplicationStatus,
  BookingStatus,
  MessageType,
  NotificationType,
  PromotionType,
};

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchFilters {
  categories?: string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  skills?: string[];
  availability?: boolean;
  rating?: number;
}

export interface EventFilters {
  eventType?: EventType;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minBudget?: number;
  maxBudget?: number;
  requiredRoles?: string[];
  tags?: string[];
}
EOF

# Final installation script
echo "📦 Creating final installation script..."
cat > install.sh << 'EOF'
#!/bin/bash

echo "🚀 Installing CollabBridge..."

# Backend installation
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Frontend installation
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Return to root
cd ..

echo "✅ CollabBridge installation complete!"
echo ""
echo "🔥 Next steps:"
echo "1. Set up your environment variables:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Copy frontend/.env.example to frontend/.env"
echo "   - Fill in your Firebase, Cloudinary, and database credentials"
echo ""
echo "2. Initialize database:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:push"
echo "   npm run prisma:seed"
echo ""
echo "3. Start development:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "4. For production deployment, see DEPLOYMENT.md"
EOF

chmod +x install.sh

echo "🚀 Creating deployment guide..."

# Create comprehensive deployment instructions
cat > RENDER_DEPLOYMENT_GUIDE.md << 'EOF'
# CollabBridge Render Deployment Guide

This guide will walk you through deploying CollabBridge to production using Render for both backend and database.

## Prerequisites

- [Render Account](https://render.com) (free tier available)
- [GitHub Repository](https://github.com) with your CollabBridge code
- [Firebase Project](https://console.firebase.google.com)
- [Cloudinary Account](https://cloudinary.com)
- [Vercel Account](https://vercel.com) for frontend

## Step 1: Database Setup on Render

### 1.1 Create PostgreSQL Database

1. Log into your Render Dashboard
2. Click **"New"** → **"PostgreSQL"**
3. Configure your database:
   - **Name**: `collabbridge-db`
   - **Database**: `collabbridge`
   - **User**: `collabbridge_user`
   - **Region**: Choose closest to your target users
   - **PostgreSQL Version**: 15
   - **Plan**: Start with Free (can upgrade later)

4. Click **"Create Database"**
5. Wait for provisioning to complete
6. **Important**: Save the connection details from the database dashboard

### 1.2 Note Database Connection Details

From your database dashboard, copy:
- **Internal Database URL** (for backend service)
- **External Database URL** (for local development)

## Step 2: Backend Deployment on Render

### 2.1 Create Web Service

1. In Render Dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `collabbridge-api`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### 2.2 Environment Variables

Set these environment variables in your Render web service:

```bash
# Application
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database (use your actual database URL from Step 1.2)
DATABASE_URL=postgresql://collabbridge_user:password@host:port/collabbridge

# JWT (let Render auto-generate this)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp,pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
```

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the build and deployment to complete
3. Your backend will be available at: `https://collabbridge-api.onrender.com`

### 2.4 Initialize Database

After successful deployment:

1. Go to your web service dashboard
2. Open the **"Shell"** tab
3. Run these commands:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Step 3: Frontend Deployment on Vercel

### 3.1 Create Vercel Project

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Astro
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Environment Variables

Set these in Vercel project settings:

```bash
# API Configuration
PUBLIC_API_URL=https://collabbridge-api.onrender.com/api
PUBLIC_FRONTEND_URL=https://your-project.vercel.app

# Firebase Client SDK
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary (for client-side uploads)
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_API_KEY=your_api_key
PUBLIC_MAX_FILE_SIZE=10485760
PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

### 3.3 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your frontend will be available at your Vercel URL

## Step 4: Firebase Configuration

### 4.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `your-vercel-app.vercel.app`
   - `collabbridge-api.onrender.com`

### 4.2 Update CORS in Backend

Update your backend environment variables to include your actual frontend URL:

```bash
FRONTEND_URL=https://your-actual-vercel-domain.vercel.app
```

## Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain for Backend

1. In Render, go to your web service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

### 5.2 Custom Domain for Frontend

1. In Vercel, go to your project settings
2. Click **"Domains"**
3. Add your custom domain (e.g., `yourdomain.com`)
4. Update DNS records as instructed

## Step 6: Testing Your Deployment

### 6.1 Backend Health Check

Visit: `https://collabbridge-api.onrender.com/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": "...",
  "environment": "production"
}
```

### 6.2 Frontend Testing

1. Visit your Vercel URL
2. Test user registration/login
3. Test event creation
4. Test file uploads
5. Test real-time messaging

## Step 7: Monitoring & Maintenance

### 7.1 Monitoring

- **Render**: Check logs in the web service dashboard
- **Vercel**: Monitor function logs and analytics
- **Database**: Check connection and query performance

### 7.2 Scaling

- **Database**: Upgrade plan as needed
- **Backend**: Render auto-scales, but monitor performance
- **Frontend**: Vercel handles scaling automatically

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database status in Render dashboard

2. **CORS Errors**
   - Ensure FRONTEND_URL matches your Vercel domain
   - Check Firebase authorized domains

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all environment variables are set

4. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

### Getting Help

- **Render Support**: [render.com/docs](https://render.com/docs)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase Support**: [firebase.google.com/docs](https://firebase.google.com/docs)

## Security Checklist

- [ ] All environment variables are properly set
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (automatic on Render/Vercel)
- [ ] Database access is restricted
- [ ] File upload restrictions are in place

## Cost Estimation

### Free Tier Limits

- **Render Free**: 750 hours/month, sleeps after 15min inactivity
- **Vercel Free**: 100GB bandwidth, unlimited hobby projects
- **PostgreSQL Free**: 1GB storage, 97 hours uptime

### Recommended Upgrades for Production

- **Render Starter Plan**: $7/month (no sleep, custom domains)
- **PostgreSQL Standard**: $7/month (shared, 1GB RAM)
- **Vercel Pro**: $20/month (commercial use, more bandwidth)

Your CollabBridge application is now ready for production! 🚀
EOF

echo ""
echo "🎉 CollabBridge project setup is complete!"
echo ""
echo "📁 Project structure created:"
echo "├── backend/          # Node.js + Express + Prisma API"
echo "├── frontend/         # Astro + React + TypeScript"
echo "├── README.md         # Project documentation"
echo "├── DEPLOYMENT.md     # Deployment instructions"
echo "├── docker-compose.yml # Local development"
echo "└── install.sh        # Installation script"
echo ""
echo "🔥 Quick start:"
echo "1. Run: chmod +x install.sh && ./install.sh"
echo "2. Configure your .env files with credentials"
echo "3. Follow RENDER_DEPLOYMENT_GUIDE.md for production deployment"
echo ""
echo "💡 What's included:"
echo "• Complete backend API with authentication"
echo "• Frontend with Astro + React + Tailwind"
echo "• Database schema with all models"
echo "• File upload with Cloudinary"
echo "• Real-time messaging with Socket.IO"
echo "• Search and filtering capabilities"
echo "• User profiles and event management"
echo "• Application and booking system"
echo "• Admin panel ready"
echo "• Production deployment configs"
echo ""
echo "📚 Documentation:"
echo "• README.md - Setup and development"
echo "• DEPLOYMENT.md - Deployment guide"
echo "• RENDER_DEPLOYMENT_GUIDE.md - Render-specific instructions"
echo ""
echo "⚡ Your CollabBridge platform is ready to launch!"
EOF

echo "✅ All setup scripts completed successfully!"
echo ""
echo "📋 Summary of created files:"
echo "1. 01_setup_project_structure.sh - Creates folder structure"
echo "2. 02_setup_backend.sh - Backend configuration & dependencies" 
echo "3. 03_setup_frontend.sh - Frontend configuration & dependencies"
echo "4. 04_setup_configs.sh - Project-wide configuration files"
echo "5. 05_setup_backend_files.sh - Core backend files (server, database, auth)"
echo "6. 06_setup_backend_routes.sh - API routes"
echo "7. 07_setup_backend_controllers.sh - Auth & User controllers"
echo "8. 08_setup_remaining_controllers.sh - Event & Search controllers"
echo "9. 09_deployment_instructions.sh - Final controllers & deployment guide"
echo ""
echo "🚀 To get started:"
echo "1. Make all scripts executable: chmod +x *.sh"
echo "2. Run scripts in order: ./01_setup_project_structure.sh"
echo "3. Follow the instructions in each script"
echo "4. Use RENDER_DEPLOYMENT_GUIDE.md for production deployment"