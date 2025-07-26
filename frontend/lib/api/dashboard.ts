import { ApiResponse, PaginatedResponse } from '@/lib/types/api';
import { DashboardStats, ActivityItem } from '@/lib/types/dashboard';

class DashboardAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getStats(role: 'professional' | 'planner'): Promise<DashboardStats> {
    const response = await this.request<ApiResponse<DashboardStats>>(
      `/api/dashboard/${role}/stats`
    );
    return response.data;
  }

  async getActivity(
    role: 'professional' | 'planner',
    limit = 10
  ): Promise<ActivityItem[]> {
    const response = await this.request<ApiResponse<ActivityItem[]>>(
      `/api/dashboard/${role}/activity?limit=${limit}`
    );
    return response.data;
  }

  async getUpcomingEvents(
    role: 'professional' | 'planner'
  ): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>(
      `/api/dashboard/${role}/upcoming-events`
    );
    return response.data;
  }
}

export const dashboardAPI = new DashboardAPI();
