import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PlatformStatistics {
  totaluserss: number;
  totalEventPlanners: number;
  totalCreativeProfessionals: number;
  totalAdmins: number;
  activeuserss: number;
  totalEvents: number;
  publishedEvents: number;
  completedEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    events: number;
    bookings: number;
    revenue: number;
  };
}

export interface usersAnalytics {
  registrationTrend: Array<{ date: string; count: number }>;
  roleDistribution: Array<{ role: string; count: number; percentage: number }>;
  activeuserssTrend: Array<{ date: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

export interface EventAnalytics {
  eventCreationTrend: Array<{ date: string; count: number }>;
  eventTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  averageEventBudget: number;
  popularCategories: Array<{ category: string; count: number }>;
  eventStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
}

export interface BookingAnalytics {
  bookingTrend: Array<{ date: string; count: number; revenue: number }>;
  bookingStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  averageBookingValue: number;
  topProfessionals: Array<{ professionalId: string; name: string; bookingCount: number; revenue: number }>;
  conversionRate: number; // events to bookings
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  revenueGrowthRate: number;
  averageTransactionValue: number;
}

export class AnalyticsService {
  async getPlatformStatistics(dateRange?: DateRange): Promise<PlatformStatistics> {
    try {
      const { startDate, endDate } = dateRange || this.getDefaultDateRange();

      const [
        userStats,
        eventStats,
        bookingStats,
        reviewStats,
        revenueStats,
        monthlyGrowth
      ] = await Promise.all([
        this.getUsersStatistics(startDate, endDate),
        this.getEventStatistics(startDate, endDate),
        this.getBookingStatistics(startDate, endDate),
        this.getReviewStatistics(startDate, endDate),
        this.getRevenueStatistics(startDate, endDate),
        this.getMonthlyGrowth(startDate, endDate)
      ]);

      return {
        ...userStats,
        ...eventStats,
        ...bookingStats,
        ...reviewStats,
        totalRevenue: revenueStats.totalRevenue,
        monthlyGrowth
      };
    } catch (error) {
      logger.error('Get platform statistics error:', error);
      throw createError('Failed to fetch platform statistics', 500);
    }
  }

  async getUsersAnalytics(dateRange?: DateRange): Promise<usersAnalytics> {
    try {
      const { startDate, endDate } = dateRange || this.getDefaultDateRange();

      const [registrationTrend, roleDistribution, activeuserssTrend, topLocations] = await Promise.all([
        this.getUsersRegistrationTrend(startDate, endDate),
        this.getUserRoleDistribution(),
        this.getActiveuserssTrend(startDate, endDate),
        this.getTopusersLocations()
      ]);

      return {
        registrationTrend,
        roleDistribution,
        activeuserssTrend,
        topLocations
      };
    } catch (error) {
      logger.error('Get user analytics error:', error);
      throw createError('Failed to fetch user analytics', 500);
    }
  }

  async getEventAnalytics(dateRange?: DateRange): Promise<EventAnalytics> {
    try {
      const { startDate, endDate } = dateRange || this.getDefaultDateRange();

      const [
        eventCreationTrend,
        eventTypeDistribution,
        averageEventBudget,
        popularCategories,
        eventStatusDistribution
      ] = await Promise.all([
        this.getEventCreationTrend(startDate, endDate),
        this.getEventTypeDistribution(),
        this.getAverageEventBudget(),
        this.getPopularEventCategories(),
        this.getEventStatusDistribution()
      ]);

      return {
        eventCreationTrend,
        eventTypeDistribution,
        averageEventBudget,
        popularCategories,
        eventStatusDistribution
      };
    } catch (error) {
      logger.error('Get event analytics error:', error);
      throw createError('Failed to fetch event analytics', 500);
    }
  }

  async getBookingAnalytics(dateRange?: DateRange): Promise<BookingAnalytics> {
    try {
      const { startDate, endDate } = dateRange || this.getDefaultDateRange();

      const [
        bookingTrend,
        bookingStatusDistribution,
        averageBookingValue,
        topProfessionals,
        conversionRate
      ] = await Promise.all([
        this.getBookingTrend(startDate, endDate),
        this.getBookingStatusDistribution(),
        this.getAverageBookingValue(),
        this.getTopProfessionals(10),
        this.getEventToBookingConversionRate()
      ]);

      return {
        bookingTrend,
        bookingStatusDistribution,
        averageBookingValue,
        topProfessionals,
        conversionRate
      };
    } catch (error) {
      logger.error('Get booking analytics error:', error);
      throw createError('Failed to fetch booking analytics', 500);
    }
  }

  async getRevenueAnalytics(dateRange?: DateRange): Promise<RevenueAnalytics> {
    try {
      const { startDate, endDate } = dateRange || this.getDefaultDateRange();

      const [
        totalRevenue,
        monthlyRevenue,
        revenueByCategory,
        revenueGrowthRate,
        averageTransactionValue
      ] = await Promise.all([
        this.getTotalRevenue(startDate, endDate),
        this.getMonthlyRevenueBreakdown(startDate, endDate),
        this.getRevenueByCategoryBreakdown(),
        this.getRevenueGrowthRate(),
        this.getAverageTransactionValue()
      ]);

      return {
        totalRevenue,
        monthlyRevenue,
        revenueByCategory,
        revenueGrowthRate,
        averageTransactionValue
      };
    } catch (error) {
      logger.error('Get revenue analytics error:', error);
      throw createError('Failed to fetch revenue analytics', 500);
    }
  }

  // Private helper methods
  private getDefaultDateRange(): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
    return { startDate, endDate };
  }

  private async getUsersStatistics(startDate: Date, endDate: Date) {
    const [totaluserss, roleDistribution, activeuserss] = await Promise.all([
      prisma.users.count(),
      prisma.users.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.users.count({
        where: {
          lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      })
    ]);

    const totalEventPlanners = roleDistribution.find(r => r.role === 'EVENT_PLANNER')?._count.role || 0;
    const totalCreativeProfessionals = roleDistribution.find(r => r.role === 'CREATIVE_PROFESSIONAL')?._count.role || 0;
    const totalAdmins = roleDistribution.find(r => r.role === 'ADMIN')?._count.role || 0;

    return {
      totaluserss,
      totalEventPlanners,
      totalCreativeProfessionals,
      totalAdmins,
      activeuserss
    };
  }

  private async getEventStatistics(startDate: Date, endDate: Date) {
    const [totalEvents, publishedEvents, completedEvents] = await Promise.all([
      prisma.events.count(),
      prisma.events.count({ where: { status: 'PUBLISHED' } }),
      prisma.events.count({ where: { status: 'COMPLETED' } })
    ]);

    return {
      totalEvents,
      publishedEvents,
      completedEvents
    };
  }

  private async getBookingStatistics(startDate: Date, endDate: Date) {
    const [totalBookings, confirmedBookings, completedBookings] = await Promise.all([
      prisma.bookings.count(),
      prisma.bookings.count({ where: { status: 'CONFIRMED' } }),
      prisma.bookings.count({ where: { status: 'COMPLETED' } })
    ]);

    return {
      totalBookings,
      confirmedBookings,
      completedBookings
    };
  }

  private async getReviewStatistics(startDate: Date, endDate: Date) {
    const [totalReviews, averageRatingResult] = await Promise.all([
      prisma.reviews.count({ where: { isPublic: true } }),
      prisma.reviews.aggregate({
        where: { isPublic: true },
        _avg: { rating: true }
      })
    ]);

    return {
      totalReviews,
      averageRating: averageRatingResult._avg.rating || 0
    };
  }

  private async getRevenueStatistics(startDate: Date, endDate: Date) {
    const result = await prisma.bookings.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate, lte: endDate }
      },
      _sum: { rate: true }
    });

    return {
      totalRevenue: result._sum.rate || 0
    };
  }

  private async getMonthlyGrowth(startDate: Date, endDate: Date) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [usersThisMonth, usersLastMonth, eventsThisMonth, eventsLastMonth, bookingsThisMonth, bookingsLastMonth] = await Promise.all([
      prisma.users.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.users.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.events.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.events.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.bookings.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.bookings.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } })
    ]);

    return {
      users: this.calculateGrowthPercentage(usersThisMonth, usersLastMonth),
      events: this.calculateGrowthPercentage(eventsThisMonth, eventsLastMonth),
      bookings: this.calculateGrowthPercentage(bookingsThisMonth, bookingsLastMonth),
      revenue: 0 // Calculate based on revenue data
    };
  }

  private async getUsersRegistrationTrend(startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*)::bigint as count
      FROM users 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    return result.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));
  }

  private async getUserRoleDistribution() {
    const result = await prisma.users.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const total = result.reduce((sum, item) => sum + item._count.role, 0);

    return result.map(item => ({
      role: item.role,
      count: item._count.role,
      percentage: total > 0 ? (item._count.role / total) * 100 : 0
    }));
  }

  private async getActiveuserssTrend(startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(last_active_at) as date, COUNT(DISTINCT id)::bigint as count
      FROM users 
      WHERE last_active_at >= ${startDate} AND last_active_at <= ${endDate}
      GROUP BY DATE(last_active_at)
      ORDER BY date
    `;

    return result.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));
  }

  private async getTopusersLocations() {
    const result = await prisma.users.groupBy({
      by: ['location'],
      where: { location: { not: null } },
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    });

    return result.map(item => ({
      location: item.location || 'Unknown',
      count: item._count.location
    }));
  }

  private async getEventCreationTrend(startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*)::bigint as count
      FROM events 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    return result.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));
  }

  private async getEventTypeDistribution() {
    const result = await prisma.events.groupBy({
      by: ['eventType'],
      _count: { eventType: true }
    });

    const total = result.reduce((sum, item) => sum + item._count.eventType, 0);

    return result.map(item => ({
      type: item.eventType,
      count: item._count.eventType,
      percentage: total > 0 ? (item._count.eventType / total) * 100 : 0
    }));
  }

  private async getAverageEventBudget() {
    const result = await prisma.events.aggregate({
      where: { budget: { not: null } },
      _avg: { budget: true }
    });

    return result._avg.budget || 0;
  }

  private async getPopularEventCategories() {
    const result = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT 
        unnest(required_roles) as category,
        COUNT(*)::bigint as count
      FROM events
      WHERE is_public = true
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;

    return result.map(row => ({
      category: row.category,
      count: Number(row.count)
    }));
  }

  private async getEventStatusDistribution() {
    const result = await prisma.events.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const total = result.reduce((sum, item) => sum + item._count.status, 0);

    return result.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: total > 0 ? (item._count.status / total) * 100 : 0
    }));
  }

  private async getBookingTrend(startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw<Array<{ date: string; count: bigint; revenue: number }>>`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*)::bigint as count,
        COALESCE(SUM(rate), 0) as revenue
      FROM bookings 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    return result.map(row => ({
      date: row.date,
      count: Number(row.count),
      revenue: Number(row.revenue)
    }));
  }

  private async getBookingStatusDistribution() {
    const result = await prisma.bookings.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const total = result.reduce((sum, item) => sum + item._count.status, 0);

    return result.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: total > 0 ? (item._count.status / total) * 100 : 0
    }));
  }

  private async getAverageBookingValue() {
    const result = await prisma.bookings.aggregate({
      _avg: { rate: true }
    });

    return result._avg.rate || 0;
  }

  private async getTopProfessionals(limit: number = 10) {
    const result = await prisma.$queryRaw<Array<{
      professionalId: string;
      name: string;
      bookingCount: bigint;
      revenue: number;
    }>>`
      SELECT 
        cp.id as "professionalId",
        u.name,
        COUNT(b.id)::bigint as "bookingCount",
        COALESCE(SUM(b.rate), 0) as revenue
      FROM creative_profiles cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN bookings b ON cp.id = b.professional_id AND b.status = 'COMPLETED'
      GROUP BY cp.id, u.name
      ORDER BY "bookingCount" DESC, revenue DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      professionalId: row.professionalId,
      name: row.name,
      bookingCount: Number(row.bookingCount),
      revenue: Number(row.revenue)
    }));
  }

  private async getEventToBookingConversionRate() {
    const [totalEvents, totalBookings] = await Promise.all([
      prisma.events.count({ where: { status: 'PUBLISHED' } }),
      prisma.bookings.count()
    ]);

    return totalEvents > 0 ? (totalBookings / totalEvents) * 100 : 0;
  }

  private async getTotalRevenue(startDate: Date, endDate: Date) {
    const result = await prisma.bookings.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate, lte: endDate }
      },
      _sum: { rate: true }
    });

    return result._sum.rate || 0;
  }

  private async getMonthlyRevenueBreakdown(startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT 
        TO_CHAR(completed_at, 'YYYY-MM') as month,
        COALESCE(SUM(rate), 0) as revenue
      FROM bookings 
      WHERE status = 'COMPLETED' 
        AND completed_at >= ${startDate} 
        AND completed_at <= ${endDate}
      GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
      ORDER BY month
    `;

    return result.map(row => ({
      month: row.month,
      revenue: Number(row.revenue)
    }));
  }

  private async getRevenueByCategoryBreakdown() {
    const result = await prisma.$queryRaw<Array<{ category: string; revenue: number }>>`
      SELECT 
        unnest(cp.categories) as category,
        COALESCE(SUM(b.rate), 0) as revenue
      FROM bookings b
      JOIN creative_profiles cp ON b.professional_id = cp.id
      WHERE b.status = 'COMPLETED'
      GROUP BY category
      ORDER BY revenue DESC
      LIMIT 10
    `;

    return result.map(row => ({
      category: row.category,
      revenue: Number(row.revenue)
    }));
  }

  private async getRevenueGrowthRate() {
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [currentRevenue, lastRevenue] = await Promise.all([
      this.getTotalRevenue(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
        currentMonth
      ),
      this.getTotalRevenue(
        new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      )
    ]);

    return this.calculateGrowthPercentage(currentRevenue, lastRevenue);
  }

  private async getAverageTransactionValue() {
    const result = await prisma.bookings.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { rate: true }
    });

    return result._avg.rate || 0;
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

export const analyticsService = new AnalyticsService();
