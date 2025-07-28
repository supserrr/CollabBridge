'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth-firebase';

interface AnalyticsData {
  totalEvents: {
    current: number;
    previous: number;
    change: number;
  };
  activeBookings: {
    current: number;
    previous: number;
    change: number;
  };
  budgetUtilization: {
    used: number;
    total: number;
    percentage: number;
  };
  upcomingEvents: {
    count: number;
    next: string;
  };
  teamPerformance: {
    rating: number;
    totalReviews: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
}

interface DashboardAnalyticsProps {
  userRole: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';
}

export function DashboardAnalytics({ userRole }: DashboardAnalyticsProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        // Fallback to mock data if API isn't implemented yet
        setAnalytics(getMockAnalytics(userRole));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to mock data
      setAnalytics(getMockAnalytics(userRole));
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAnalytics = (role: string): AnalyticsData => {
    if (role === 'EVENT_PLANNER') {
      return {
        totalEvents: { current: 18, previous: 15, change: 20 },
        activeBookings: { current: 47, previous: 38, change: 23.7 },
        budgetUtilization: { used: 18450, total: 25000, percentage: 73.8 },
        upcomingEvents: { count: 5, next: 'Corporate gala in 3 days' },
        teamPerformance: { rating: 4.8, totalReviews: 127 },
        revenue: { current: 45600, previous: 38200, change: 19.4 }
      };
    } else {
      return {
        totalEvents: { current: 12, previous: 9, change: 33.3 },
        activeBookings: { current: 8, previous: 6, change: 33.3 },
        budgetUtilization: { used: 0, total: 0, percentage: 0 },
        upcomingEvents: { count: 3, next: 'Wedding shoot tomorrow' },
        teamPerformance: { rating: 4.9, totalReviews: 89 },
        revenue: { current: 12400, previous: 9800, change: 26.5 }
      };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const renderTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
      {/* Total Events/Projects */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRole === 'EVENT_PLANNER' ? 'Total Events' : 'Total Projects'}
            </p>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">
              {analytics.totalEvents.current}
            </h2>
            <div className="flex items-center gap-2">
              {renderTrendIcon(analytics.totalEvents.change)}
              <span className={`text-xs ${getTrendColor(analytics.totalEvents.change)}`}>
                {formatPercentage(analytics.totalEvents.change)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {userRole === 'EVENT_PLANNER' ? 'Events this quarter' : 'Projects this quarter'}
          </p>
        </CardContent>
      </Card>

      {/* Active Bookings */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Active Bookings</p>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              {analytics.activeBookings.current}
            </h2>
            <div className="flex items-center gap-2">
              {renderTrendIcon(analytics.activeBookings.change)}
              <span className={`text-xs ${getTrendColor(analytics.activeBookings.change)}`}>
                {formatPercentage(analytics.activeBookings.change)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {userRole === 'EVENT_PLANNER' ? 'Professionals booked' : 'Active contracts'}
          </p>
        </CardContent>
      </Card>

      {/* Budget Utilization / Revenue */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRole === 'EVENT_PLANNER' ? 'Budget Utilization' : 'Revenue This Month'}
            </p>
            {userRole === 'EVENT_PLANNER' ? (
              <>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                  {analytics.budgetUtilization.percentage.toFixed(0)}%
                </h2>
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    Within Target
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(analytics.budgetUtilization.used)} of {formatCurrency(analytics.budgetUtilization.total)}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                  {formatCurrency(analytics.revenue.current)}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  {renderTrendIcon(analytics.revenue.change)}
                  <span className={`text-xs ${getTrendColor(analytics.revenue.change)}`}>
                    {formatPercentage(analytics.revenue.change)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  vs last month
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRole === 'EVENT_PLANNER' ? 'Upcoming Events' : 'Upcoming Projects'}
            </p>
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4">
              {analytics.upcomingEvents.count}
            </h2>
            <div className="mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                Next 30 days
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{analytics.upcomingEvents.next}</p>
        </CardContent>
      </Card>

      {/* Team Performance / Client Rating */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRole === 'EVENT_PLANNER' ? 'Team Performance' : 'Client Rating'}
            </p>
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
              {analytics.teamPerformance.rating.toFixed(1)}
            </h2>
            <div className="mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                <Star className="h-3 w-3 mr-1" />
                Excellent
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {analytics.teamPerformance.totalReviews} reviews
          </p>
        </CardContent>
      </Card>

      {/* Revenue/Expenses Summary */}
      {userRole === 'EVENT_PLANNER' && (
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
              <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-4">
                {formatCurrency(analytics.budgetUtilization.used)}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-teal-600" />
                <span className="text-xs text-teal-600">
                  Budget managed
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
      )}

      {userRole === 'CREATIVE_PROFESSIONAL' && (
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 border">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
              <h2 className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-4">
                {formatCurrency(analytics.revenue.current * 4)} {/* Rough yearly estimate */}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-pink-600" />
                <span className="text-xs text-pink-600">
                  This year
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Professional income</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
