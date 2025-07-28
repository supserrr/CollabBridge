import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';
import { z } from 'zod';
import ical from 'ical-generator';
const PDFDocument = require('pdfkit');
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Extended types for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; };
}

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  eventType: z.enum(['booking', 'event', 'meeting', 'deadline', 'personal']),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive().default(1),
    endTime: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional()
  }).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
  isPublic: z.boolean().default(false),
  metadata: z.any().optional(),
  attendees: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    status: z.enum(['invited', 'accepted', 'declined', 'tentative']).default('invited')
  })).optional(),
  reminders: z.array(z.object({
    minutes: z.number().int().positive(),
    method: z.enum(['email', 'sms', 'push'])
  })).default([{ minutes: 30, method: 'email' }])
});

const updateEventSchema = createEventSchema.partial();

// Routes
router.get('/events', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const events = await prisma.calendar_events.findMany({
      where: { userId: userId },
      include: {
        attendees: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        reminders: true
      },
      orderBy: { startTime: 'asc' }
    });

    const formattedEvents = events.map(event => ({
      ...event,
      recurrenceRule: event.recurrenceRule ? JSON.parse(event.recurrenceRule) : null
    }));

    res.json({
      success: true,
      data: { events: formattedEvents }
    });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

// Create new event
router.post('/events', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validatedData = createEventSchema.parse(req.body);

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    if (startTime >= endTime) {
      res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
      return;
    }

    const event = await prisma.calendar_events.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: startTime,
        endTime: endTime,
        location: validatedData.location,
        eventType: validatedData.eventType,
        isRecurring: validatedData.isRecurring,
        recurrenceRule: validatedData.recurrenceRule ? JSON.stringify(validatedData.recurrenceRule) : null,
        color: validatedData.color,
        isPublic: validatedData.isPublic,
        metadata: validatedData.metadata,
        createdBy: userId,
        userId: userId,
        status: 'SCHEDULED',
        attendees: validatedData.attendees ? {
          create: validatedData.attendees.map(attendee => ({
            name: attendee.name,
            email: attendee.email,
            status: 'INVITED'
          }))
        } : undefined,
        reminders: validatedData.reminders ? {
          create: validatedData.reminders.map(reminder => ({
            minutesBefore: reminder.minutes,
            type: reminder.method === 'email' ? 'EMAIL' : 
                  reminder.method === 'sms' ? 'SMS' : 'PUSH'
          }))
        } : undefined
      },
      include: {
        attendees: true,
        reminders: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...event,
        recurrenceRule: event.recurrenceRule ? JSON.parse(event.recurrenceRule) : null
      }
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
    
    logger.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

// Get single event
router.get('/events/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const eventId = req.params.id;

    const event = await prisma.calendar_events.findFirst({
      where: { 
        id: eventId,
        OR: [
          { userId: userId },
          { isPublic: true }
        ]
      },
      include: {
        attendees: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        reminders: true
      }
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...event,
        recurrenceRule: event.recurrenceRule ? JSON.parse(event.recurrenceRule) : null
      }
    });
  } catch (error) {
    logger.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
});

export default router;
