import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Extended types for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; };
}

// Validation schemas
const createContractSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['SERVICE', 'EMPLOYMENT', 'NDA', 'VENDOR', 'FREELANCE', 'OTHER']),
  status: z.enum(['DRAFT', 'SENT', 'UNDER_REVIEW', 'PENDING_SIGNATURE', 'SIGNED', 'EXECUTED', 'EXPIRED', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  value: z.number().optional(),
  currency: z.string().length(3).default('USD'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.any().optional()
});

const updateContractSchema = createContractSchema.partial();

// Routes
router.get('/contracts', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const contracts = await prisma.contracts.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { clientId: userId },
          { assignedTo: userId }
        ]
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { contracts }
    });
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

// Create new contract
router.post('/contracts', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validatedData = createContractSchema.parse(req.body);

    const startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    const expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : null;

    if (endDate && startDate && startDate >= endDate) {
      res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
      return;
    }

    const contract = await prisma.contracts.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        type: validatedData.type,
        status: validatedData.status,
        startDate: startDate,
        endDate: endDate,
        expiresAt: expiresAt,
        value: validatedData.value,
        currency: validatedData.currency,
        clientId: validatedData.clientId,
        assignedTo: validatedData.assignedTo,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        metadata: validatedData.metadata,
        userId: userId,
        createdBy: userId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
      return;
    }
    
    logger.error('Error creating contract:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

// Get single contract
router.get('/contracts/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const contractId = req.params.id;

    const contract = await prisma.contracts.findFirst({
      where: { 
        id: contractId,
        OR: [
          { createdBy: userId },
          { clientId: userId },
          { assignedTo: userId }
        ]
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!contract) {
      res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
      return;
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

export default router;
