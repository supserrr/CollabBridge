import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { verifyFirebaseToken } from '../config/firebase';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firebaseUid: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Try JWT first (for our API tokens)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
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
        const user = await prisma.user.findUnique({
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
          res.status(401).json({ message: 'User not found or inactive' });
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
