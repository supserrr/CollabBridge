import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          event: true,
          creative: {
            include: {
              user: true,
            },
          },
          planner: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.planner.user.id === req.user!.id;
      const isCreative = booking.creative.user.id === req.user!.id;

      if (!isPlanner && !isCreative) {
        throw createError('Not authorized to update this booking', 403);
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status, notes },
      });

      // Send notification to the other party
      const recipientId = isPlanner ? booking.creative.user.id : booking.planner.user.id;
      const notificationMessage = `Booking for "${booking.event.title}" has been ${status.toLowerCase()}`;

      await this.notificationService.sendNotification(
        recipientId,
        status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
        'Booking Update',
        notificationMessage,
        { eventId: booking.eventId, bookingId: booking.id }
      );

      res.json({ message: 'Booking status updated successfully', booking: updatedBooking });
    } catch (error) {
      throw error;
    }
  }

  async getBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          event: true,
          creative: {
            include: {
              user: true,
            },
          },
          planner: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.planner.user.id === req.user!.id;
      const isCreative = booking.creative.user.id === req.user!.id;

      if (!isPlanner && !isCreative) {
        throw createError('Not authorized to view this booking', 403);
      }

      res.json(booking);
    } catch (error) {
      throw error;
    }
  }
}
