import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AnalyticsController {
  
  async getDashboardAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (userRole === 'EVENT_PLANNER') {
        const analytics = await this.getEventPlannerAnalytics(userId);
        return res.json({ analytics });
      } else if (userRole === 'CREATIVE_PROFESSIONAL') {
        const analytics = await this.getCreativeProfessionalAnalytics(userId);
        return res.json({ analytics });
      } else {
        return res.status(400).json({ error: 'Invalid user role' });
      }
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  private async getEventPlannerAnalytics(userId: string) {
    // Get current date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get event planner record
    const eventPlanner = await prisma.event_planners.findUnique({
      where: { userId },
      include: { events: true }
    });

    if (!eventPlanner) {
      throw new Error('Event planner not found');
    }

    // Total events
    const currentEvents = await prisma.events.count({
      where: {
        eventPlannerId: eventPlanner.id,
        createdAt: { gte: startOfMonth }
      }
    });

    const previousEvents = await prisma.events.count({
      where: {
        eventPlannerId: eventPlanner.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    });

    // Active bookings 
    const currentBookings = await prisma.bookings.count({
      where: {
        eventPlannerId: eventPlanner.id,
        createdAt: { gte: startOfMonth }
      }
    });

    const previousBookings = await prisma.bookings.count({
      where: {
        eventPlannerId: eventPlanner.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    });

    // Budget utilization (sum of event budgets)
    const totalBudget = await prisma.events.aggregate({
      where: { eventPlannerId: eventPlanner.id },
      _sum: { budget: true }
    });

    // Upcoming events
    const upcomingEvents = await prisma.events.findMany({
      where: {
        eventPlannerId: eventPlanner.id,
        startDate: { gte: now }
      },
      orderBy: { startDate: 'asc' },
      take: 1
    });

    // Team performance (reviews)
    const reviews = await prisma.reviews.findMany({
      where: { revieweeId: userId }
    });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Revenue calculation (sum of booking rates for completed bookings)
    const currentRevenue = await prisma.bookings.aggregate({
      where: {
        eventPlannerId: eventPlanner.id,
        status: 'COMPLETED',
        endDate: { gte: startOfMonth }
      },
      _sum: { rate: true }
    });

    const previousRevenue = await prisma.bookings.aggregate({
      where: {
        eventPlannerId: eventPlanner.id,
        status: 'COMPLETED',
        endDate: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { rate: true }
    });

    return {
      totalEvents: {
        current: currentEvents,
        previous: previousEvents,
        change: previousEvents > 0 ? ((currentEvents - previousEvents) / previousEvents * 100) : 0
      },
      activeBookings: {
        current: currentBookings,
        previous: previousBookings,
        change: previousBookings > 0 ? ((currentBookings - previousBookings) / previousBookings * 100) : 0
      },
      budgetUtilization: {
        used: totalBudget._sum.budget || 0,
        total: totalBudget._sum.budget || 0,
        percentage: 100
      },
      upcomingEvents: {
        count: upcomingEvents.length,
        next: upcomingEvents[0] ? `${upcomingEvents[0].title} in ${Math.ceil((upcomingEvents[0].startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days` : 'No upcoming events'
      },
      teamPerformance: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      },
      revenue: {
        current: currentRevenue._sum.rate || 0,
        previous: previousRevenue._sum.rate || 0,
        change: (previousRevenue._sum.rate || 0) > 0 ? (((currentRevenue._sum.rate || 0) - (previousRevenue._sum.rate || 0)) / (previousRevenue._sum.rate || 0) * 100) : 0
      }
    };
  }

  private async getCreativeProfessionalAnalytics(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get creative professional record
    const creativeProfessional = await prisma.creative_profiles.findUnique({
      where: { userId }
    });

    if (!creativeProfessional) {
      throw new Error('Creative professional not found');
    }

    // Active bookings
    const currentBookings = await prisma.bookings.count({
      where: {
        professionalId: creativeProfessional.id,
        createdAt: { gte: startOfMonth }
      }
    });

    const previousBookings = await prisma.bookings.count({
      where: {
        professionalId: creativeProfessional.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    });

    // Applications (for this we'll use bookings as proxy since applications might convert to bookings)
    const currentApplications = currentBookings;
    const previousApplications = previousBookings;

    // Upcoming bookings
    const upcomingBookings = await prisma.bookings.findMany({
      where: {
        professionalId: creativeProfessional.id,
        startDate: { gte: now }
      },
      orderBy: { startDate: 'asc' },
      take: 1,
      include: { events: true }
    });

    // Reviews and ratings
    const reviews = await prisma.reviews.findMany({
      where: { revieweeId: userId }
    });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Revenue from completed bookings
    const currentRevenue = await prisma.bookings.aggregate({
      where: {
        professionalId: creativeProfessional.id,
        status: 'COMPLETED',
        endDate: { gte: startOfMonth }
      },
      _sum: { rate: true }
    });

    const previousRevenue = await prisma.bookings.aggregate({
      where: {
        professionalId: creativeProfessional.id,
        status: 'COMPLETED',
        endDate: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { rate: true }
    });

    return {
      totalEvents: {
        current: currentApplications,
        previous: previousApplications,
        change: previousApplications > 0 ? ((currentApplications - previousApplications) / previousApplications * 100) : 0
      },
      activeBookings: {
        current: currentBookings,
        previous: previousBookings,
        change: previousBookings > 0 ? ((currentBookings - previousBookings) / previousBookings * 100) : 0
      },
      budgetUtilization: {
        used: 0,
        total: 0,
        percentage: 0
      },
      upcomingEvents: {
        count: upcomingBookings.length,
        next: upcomingBookings[0] ? `${upcomingBookings[0].events?.title || 'Event'} in ${Math.ceil((upcomingBookings[0].startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days` : 'No upcoming bookings'
      },
      teamPerformance: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      },
      revenue: {
        current: currentRevenue._sum.rate || 0,
        previous: previousRevenue._sum.rate || 0,
        change: (previousRevenue._sum.rate || 0) > 0 ? (((currentRevenue._sum.rate || 0) - (previousRevenue._sum.rate || 0)) / (previousRevenue._sum.rate || 0) * 100) : 0
      }
    };
  }

  async getChartData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { timeRange = '30d', metric = 'events' } = req.query;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const chartData = [];
      
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);

        let value = 0;
        
        if (userRole === 'EVENT_PLANNER') {
          const eventPlanner = await prisma.event_planners.findUnique({
            where: { userId }
          });

          if (eventPlanner) {
            if (metric === 'events') {
              value = await prisma.events.count({
                where: {
                  eventPlannerId: eventPlanner.id,
                  createdAt: { gte: currentDate, lt: nextDate }
                }
              });
            } else if (metric === 'bookings') {
              value = await prisma.bookings.count({
                where: {
                  eventPlannerId: eventPlanner.id,
                  createdAt: { gte: currentDate, lt: nextDate }
                }
              });
            }
          }
        } else if (userRole === 'CREATIVE_PROFESSIONAL') {
          const creativeProfessional = await prisma.creative_profiles.findUnique({
            where: { userId }
          });

          if (creativeProfessional) {
            if (metric === 'bookings') {
              value = await prisma.bookings.count({
                where: {
                  professionalId: creativeProfessional.id,
                  createdAt: { gte: currentDate, lt: nextDate }
                }
              });
            }
          }
        }

        chartData.push({
          date: currentDate.toISOString().split('T')[0],
          value,
          // Add some variety for demo purposes
          desktop: Math.max(value, Math.floor(Math.random() * 100)),
          mobile: Math.max(Math.floor(value * 0.7), Math.floor(Math.random() * 80))
        });
      }

      return res.json({ chartData });
    } catch (error) {
      console.error('Error getting chart data:', error);
      return res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  }
}
