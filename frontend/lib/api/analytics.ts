const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Helper function to get Firebase token
async function getAuthToken(): Promise<string | null> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export interface AnalyticsData {
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

export interface ChartDataPoint {
  date: string;
  value: number;
  desktop: number;
  mobile: number;
}

export const analyticsApi = {
  async getDashboardAnalytics(): Promise<{ analytics: AnalyticsData }> {
    return apiRequest('/api/analytics/dashboard', {
      method: 'GET',
    });
  },

  async getChartData(timeRange: '7d' | '30d' | '90d' = '30d', metric: string = 'events'): Promise<{ chartData: ChartDataPoint[] }> {
    return apiRequest(`/api/analytics/chart-data?timeRange=${timeRange}&metric=${metric}`, {
      method: 'GET',
    });
  },
};
