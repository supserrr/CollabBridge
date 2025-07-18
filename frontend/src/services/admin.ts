import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  AdminStats, 
  User, 
  Event, 
  Report, 
  Promotion, 
  ApiResponse 
} from '../types';

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await api.get<ApiResponse<AdminStats>>('/admin/dashboard');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAllUsers(page = 1, limit = 20, filters?: any): Promise<{
    users: User[];
    pagination: any;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        users: User[];
        pagination: any;
      }>>('/admin/users', {
        params: { page, limit, ...filters }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAllEvents(page = 1, limit = 20, filters?: any): Promise<{
    events: Event[];
    pagination: any;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        events: Event[];
        pagination: any;
      }>>('/admin/events', {
        params: { page, limit, ...filters }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, { status });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async verifyUser(userId: string): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/verify`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async featureEvent(eventId: string, featured: boolean): Promise<Event> {
    try {
      const response = await api.patch<ApiResponse<Event>>(`/admin/events/${eventId}/featured`, { featured });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async featureProfile(userId: string, featured: boolean): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/featured`, { featured });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReports(page = 1, limit = 20, status?: string): Promise<{
    reports: Report[];
    pagination: any;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        reports: Report[];
        pagination: any;
      }>>('/admin/reports', {
        params: { page, limit, status }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateReportStatus(reportId: string, status: string, resolution?: string): Promise<Report> {
    try {
      const response = await api.patch<ApiResponse<Report>>(`/admin/reports/${reportId}`, { 
        status, 
        resolution 
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await api.delete(`/admin/events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPromotions(): Promise<Promotion[]> {
    try {
      const response = await api.get<ApiResponse<Promotion[]>>('/admin/promotions');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPromotion(data: {
    userId: string;
    type: string;
    amount: number;
    currency: string;
    startDate: string;
    endDate: string;
  }): Promise<Promotion> {
    try {
      const response = await api.post<ApiResponse<Promotion>>('/admin/promotions', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion> {
    try {
      const response = await api.put<ApiResponse<Promotion>>(`/admin/promotions/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePromotion(id: string): Promise<void> {
    try {
      await api.delete(`/admin/promotions/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/analytics', {
        params: { period }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new AdminService();
