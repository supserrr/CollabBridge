"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class AnalyticsService {
    async getPlatformStatistics(dateRange) {
        try {
            const { startDate, endDate } = dateRange || this.getDefaultDateRange();
            const [userStats, eventStats, bookingStats, reviewStats, revenueStats, monthlyGrowth] = await Promise.all([
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
        }
        catch (error) {
            logger_1.logger.error('Get platform statistics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch platform statistics', 500);
        }
    }
    async getUsersAnalytics(dateRange) {
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
        }
        catch (error) {
            logger_1.logger.error('Get user analytics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch user analytics', 500);
        }
    }
    async getEventAnalytics(dateRange) {
        try {
            const { startDate, endDate } = dateRange || this.getDefaultDateRange();
            const [eventCreationTrend, eventTypeDistribution, averageEventBudget, popularCategories, eventStatusDistribution] = await Promise.all([
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
        }
        catch (error) {
            logger_1.logger.error('Get event analytics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch event analytics', 500);
        }
    }
    async getBookingAnalytics(dateRange) {
        try {
            const { startDate, endDate } = dateRange || this.getDefaultDateRange();
            const [bookingTrend, bookingStatusDistribution, averageBookingValue, topProfessionals, conversionRate] = await Promise.all([
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
        }
        catch (error) {
            logger_1.logger.error('Get booking analytics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch booking analytics', 500);
        }
    }
    async getRevenueAnalytics(dateRange) {
        try {
            const { startDate, endDate } = dateRange || this.getDefaultDateRange();
            const [totalRevenue, monthlyRevenue, revenueByCategory, revenueGrowthRate, averageTransactionValue] = await Promise.all([
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
        }
        catch (error) {
            logger_1.logger.error('Get revenue analytics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch revenue analytics', 500);
        }
    }
    // Private helper methods
    getDefaultDateRange() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
        return { startDate, endDate };
    }
    async getUsersStatistics(startDate, endDate) {
        const [totaluserss, roleDistribution, activeuserss] = await Promise.all([
            database_1.prisma.users.count(),
            database_1.prisma.users.groupBy({
                by: ['role'],
                _count: { role: true }
            }),
            database_1.prisma.users.count({
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
    async getEventStatistics(startDate, endDate) {
        const [totalEvents, publishedEvents, completedEvents] = await Promise.all([
            database_1.prisma.events.count(),
            database_1.prisma.events.count({ where: { status: 'PUBLISHED' } }),
            database_1.prisma.events.count({ where: { status: 'COMPLETED' } })
        ]);
        return {
            totalEvents,
            publishedEvents,
            completedEvents
        };
    }
    async getBookingStatistics(startDate, endDate) {
        const [totalBookings, confirmedBookings, completedBookings] = await Promise.all([
            database_1.prisma.bookings.count(),
            database_1.prisma.bookings.count({ where: { status: 'CONFIRMED' } }),
            database_1.prisma.bookings.count({ where: { status: 'COMPLETED' } })
        ]);
        return {
            totalBookings,
            confirmedBookings,
            completedBookings
        };
    }
    async getReviewStatistics(startDate, endDate) {
        const [totalReviews, averageRatingResult] = await Promise.all([
            database_1.prisma.reviews.count({ where: { isPublic: true } }),
            database_1.prisma.reviews.aggregate({
                where: { isPublic: true },
                _avg: { rating: true }
            })
        ]);
        return {
            totalReviews,
            averageRating: averageRatingResult._avg.rating || 0
        };
    }
    async getRevenueStatistics(startDate, endDate) {
        const result = await database_1.prisma.bookings.aggregate({
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
    async getMonthlyGrowth(startDate, endDate) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const [usersThisMonth, usersLastMonth, eventsThisMonth, eventsLastMonth, bookingsThisMonth, bookingsLastMonth] = await Promise.all([
            database_1.prisma.users.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
            database_1.prisma.users.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
            database_1.prisma.events.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
            database_1.prisma.events.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
            database_1.prisma.bookings.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
            database_1.prisma.bookings.count({ where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } })
        ]);
        return {
            users: this.calculateGrowthPercentage(usersThisMonth, usersLastMonth),
            events: this.calculateGrowthPercentage(eventsThisMonth, eventsLastMonth),
            bookings: this.calculateGrowthPercentage(bookingsThisMonth, bookingsLastMonth),
            revenue: 0 // Calculate based on revenue data
        };
    }
    async getUsersRegistrationTrend(startDate, endDate) {
        const result = await database_1.prisma.$queryRaw `
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
    async getUserRoleDistribution() {
        const result = await database_1.prisma.users.groupBy({
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
    async getActiveuserssTrend(startDate, endDate) {
        const result = await database_1.prisma.$queryRaw `
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
    async getTopusersLocations() {
        const result = await database_1.prisma.users.groupBy({
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
    async getEventCreationTrend(startDate, endDate) {
        const result = await database_1.prisma.$queryRaw `
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
    async getEventTypeDistribution() {
        const result = await database_1.prisma.events.groupBy({
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
    async getAverageEventBudget() {
        const result = await database_1.prisma.events.aggregate({
            where: { budget: { not: null } },
            _avg: { budget: true }
        });
        return result._avg.budget || 0;
    }
    async getPopularEventCategories() {
        const result = await database_1.prisma.$queryRaw `
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
    async getEventStatusDistribution() {
        const result = await database_1.prisma.events.groupBy({
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
    async getBookingTrend(startDate, endDate) {
        const result = await database_1.prisma.$queryRaw `
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
    async getBookingStatusDistribution() {
        const result = await database_1.prisma.bookings.groupBy({
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
    async getAverageBookingValue() {
        const result = await database_1.prisma.bookings.aggregate({
            _avg: { rate: true }
        });
        return result._avg.rate || 0;
    }
    async getTopProfessionals(limit = 10) {
        const result = await database_1.prisma.$queryRaw `
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
    async getEventToBookingConversionRate() {
        const [totalEvents, totalBookings] = await Promise.all([
            database_1.prisma.events.count({ where: { status: 'PUBLISHED' } }),
            database_1.prisma.bookings.count()
        ]);
        return totalEvents > 0 ? (totalBookings / totalEvents) * 100 : 0;
    }
    async getTotalRevenue(startDate, endDate) {
        const result = await database_1.prisma.bookings.aggregate({
            where: {
                status: 'COMPLETED',
                completedAt: { gte: startDate, lte: endDate }
            },
            _sum: { rate: true }
        });
        return result._sum.rate || 0;
    }
    async getMonthlyRevenueBreakdown(startDate, endDate) {
        const result = await database_1.prisma.$queryRaw `
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
    async getRevenueByCategoryBreakdown() {
        const result = await database_1.prisma.$queryRaw `
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
    async getRevenueGrowthRate() {
        const currentMonth = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const [currentRevenue, lastRevenue] = await Promise.all([
            this.getTotalRevenue(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), currentMonth),
            this.getTotalRevenue(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
        ]);
        return this.calculateGrowthPercentage(currentRevenue, lastRevenue);
    }
    async getAverageTransactionValue() {
        const result = await database_1.prisma.bookings.aggregate({
            where: { status: 'COMPLETED' },
            _avg: { rate: true }
        });
        return result._avg.rate || 0;
    }
    calculateGrowthPercentage(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=AnalyticsService.js.map