/**
 * Authentication Middleware
 * 
 * Provides secure authentication for API endpoints using both JWT tokens and Firebase Auth.
 * Handles token verification, user data extraction, and request authorization.
 * Supports hybrid authentication system for flexibility and security.
 * 
 * Key Features:
 * - JWT token verification for API access
 * - Firebase token verification for client authentication
 * - User data injection into request object
 * - Error handling for invalid/expired tokens
 * - Database user lookup and validation
 * - Role-based access control preparation
 * 
 * @middleware
 * @example
 * ```typescript
 * // Protect an endpoint
 * router.get('/protected', authenticate, (req: AuthenticatedRequest, res) => {
 *   const user = req.user; // User data available here
 *   res.json({ user });
 * });
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { users } from '@prisma/client';

/**
 * Legacy auth request interface - maintained for backward compatibility
 * @deprecated Use AuthenticatedRequest instead
 */
export interface AuthRequest extends Request {
  user?: users;
}

import { verifyFirebaseToken } from '../config/firebase';
import { logger } from '../utils/logger';

/**
 * Enhanced authenticated request interface
 * Extends Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;              // Unique user identifier
    email: string;           // User's email address
    role: string;            // User's role (EVENT_PLANNER, CREATIVE_PROFESSIONAL)
    firebaseUid: string | null;  // Firebase UID for integration
    isActive: boolean;       // Account status
  };
}

/**
 * Authentication middleware function
 * Verifies JWT or Firebase tokens and injects user data into request
 * 
 * @param req - Express request object (enhanced with user data)
 * @param res - Express response object
 * @param next - Express next function for middleware chain
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for Authorization header with Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Primary authentication: Try JWT token verification first
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firebaseUid: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ message: 'Invalid or inactive user' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Try Firebase token as fallback
      try {
        const decodedToken = await verifyFirebaseToken(token);
        const user = await prisma.users.findUnique({
          where: { firebaseUid: decodedToken.uid },
          select: {
            id: true,
            email: true,
            role: true,
            firebaseUid: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          res.status(401).json({ message: 'users not found or inactive' });
          return;
        }

        req.user = user;
        next();
      } catch (firebaseError) {
        logger.error('Authentication failed:', firebaseError);
        res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
