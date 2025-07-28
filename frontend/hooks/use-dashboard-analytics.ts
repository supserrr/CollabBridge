import { useState, useEffect } from 'react';
import { analyticsApi, AnalyticsData, ChartDataPoint } from '../lib/api/analytics';

export interface UseDashboardAnalyticsReturn {
  analytics: AnalyticsData | null;
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  refreshChartData: (timeRange?: '7d' | '30d' | '90d', metric?: string) => Promise<void>;
}

export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAnalytics = async () => {
    try {
      setError(null);
      const response = await analyticsApi.getDashboardAnalytics();
      setAnalytics(response.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    }
  };

  const refreshChartData = async (timeRange: '7d' | '30d' | '90d' = '30d', metric: string = 'events') => {
    try {
      setError(null);
      const response = await analyticsApi.getChartData(timeRange, metric);
      setChartData(response.chartData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshAnalytics(),
          refreshChartData()
        ]);
      } catch (err) {
        console.error('Error loading initial analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    analytics,
    chartData,
    isLoading,
    error,
    refreshAnalytics,
    refreshChartData,
  };
}
