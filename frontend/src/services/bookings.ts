import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  Booking, 
  SearchResponse, 
  SearchFilters, 
  ApiResponse 
} from '../types';

class BookingService {
  async getBookings(filters?: SearchFilters): Promise<SearchResponse<Booking>> {
    try {
      const response = await api.get<ApiResponse<SearchResponse<Booking>>>('/bookings', {
        params: filters
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createBooking(data: {
    eventId: string;
    creativeId: string;
    amount: number;
    currency: string;
    startDate: string;
    endDate: string;
    terms?: string;
    notes?: string;
  }): Promise<Booking> {
    try {
      const response = await api.post<ApiResponse<Booking>>('/bookings', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/payment-status`, { paymentStatus });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async cancelBooking(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyBookings(): Promise<Booking[]> {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/my');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async confirmBooking(id: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async completeBooking(id: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getBookingContract(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/bookings/${id}/contract`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new BookingService();
