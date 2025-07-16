import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { verifyFirebaseToken } from '../../config/firebase';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, name, role, firebaseUid, location, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { firebaseUid }
        ]
      }
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        firebaseUid,
        location,
        bio,
        isVerified: true, // Since Firebase handles email verification
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        location: true,
        bio: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Create role-specific profile
    if (role === 'EVENT_PLANNER') {
      await prisma.eventPlanner.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === 'CREATIVE_PROFESSIONAL') {
      await prisma.creativeProfile.create({
        data: {
          userId: user.id,
          categories: [],
          skills: [],
          languages: ['en'],
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw createError('Token is required', 400);
    }

    const decodedToken = await verifyFirebaseToken(token);
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        location: true,
        bio: true,
        avatar: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 403);
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    res.json({
      success: true,
      user,
    });
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyFirebaseToken(token);
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        eventPlanner: true,
        creativeProfile: {
          include: {
            _count: {
              select: {
                bookings: true,
                receivedReviews: true,
              }
            }
          }
        },
        _count: {
          select: {
            receivedReviews: true,
            givenReviews: true,
          }
        }
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      user,
    });
  }
}
