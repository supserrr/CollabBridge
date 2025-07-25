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
    registrationTrend: Array<{
        date: string;
        count: number;
    }>;
    roleDistribution: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
    activeuserssTrend: Array<{
        date: string;
        count: number;
    }>;
    topLocations: Array<{
        location: string;
        count: number;
    }>;
}
export interface EventAnalytics {
    eventCreationTrend: Array<{
        date: string;
        count: number;
    }>;
    eventTypeDistribution: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    averageEventBudget: number;
    popularCategories: Array<{
        category: string;
        count: number;
    }>;
    eventStatusDistribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
}
export interface BookingAnalytics {
    bookingTrend: Array<{
        date: string;
        count: number;
        revenue: number;
    }>;
    bookingStatusDistribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    averageBookingValue: number;
    topProfessionals: Array<{
        professionalId: string;
        name: string;
        bookingCount: number;
        revenue: number;
    }>;
    conversionRate: number;
}
export interface RevenueAnalytics {
    totalRevenue: number;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
    }>;
    revenueByCategory: Array<{
        category: string;
        revenue: number;
    }>;
    revenueGrowthRate: number;
    averageTransactionValue: number;
}
export declare class AnalyticsService {
    getPlatformStatistics(dateRange?: DateRange): Promise<PlatformStatistics>;
    getUsersAnalytics(dateRange?: DateRange): Promise<usersAnalytics>;
    getEventAnalytics(dateRange?: DateRange): Promise<EventAnalytics>;
    getBookingAnalytics(dateRange?: DateRange): Promise<BookingAnalytics>;
    getRevenueAnalytics(dateRange?: DateRange): Promise<RevenueAnalytics>;
    private getDefaultDateRange;
    private getUsersStatistics;
    private getEventStatistics;
    private getBookingStatistics;
    private getReviewStatistics;
    private getRevenueStatistics;
    private getMonthlyGrowth;
    private getUsersRegistrationTrend;
    private getUserRoleDistribution;
    private getActiveuserssTrend;
    private getTopusersLocations;
    private getEventCreationTrend;
    private getEventTypeDistribution;
    private getAverageEventBudget;
    private getPopularEventCategories;
    private getEventStatusDistribution;
    private getBookingTrend;
    private getBookingStatusDistribution;
    private getAverageBookingValue;
    private getTopProfessionals;
    private getEventToBookingConversionRate;
    private getTotalRevenue;
    private getMonthlyRevenueBreakdown;
    private getRevenueByCategoryBreakdown;
    private getRevenueGrowthRate;
    private getAverageTransactionValue;
    private calculateGrowthPercentage;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=AnalyticsService.d.ts.map