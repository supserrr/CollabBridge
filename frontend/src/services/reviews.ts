import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  Review, 
  SearchResponse, 
  SearchFilters, 
  ApiResponse 
} from '../types';

class ReviewService {
  async getReviews(filters?: SearchFilters): Promise<SearchResponse<Review>> {
    try {
      const response = await api.get<ApiResponse<SearchResponse<Review>>>('/reviews', {
        params: filters
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReviewById(id: string): Promise<Review> {
    try {
      const response = await api.get<ApiResponse<Review>>(`/reviews/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createReview(data: {
    eventId: string;
    revieweeId: string;
    rating: number;
    title?: string;
    content?: string;
    communicationRating?: number;
    professionalismRating?: number;
    qualityRating?: number;
    skillsRating?: number;
    isPublic: boolean;
  }): Promise<Review> {
    try {
      const response = await api.post<ApiResponse<Review>>('/reviews', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateReview(id: string, data: Partial<{
    rating: number;
    title: string;
    content: string;
    communicationRating: number;
    professionalismRating: number;
    qualityRating: number;
    skillsRating: number;
    isPublic: boolean;
  }>): Promise<Review> {
    try {
      const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await api.delete(`/reviews/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyReviews(): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]>>('/reviews/my');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReceivedReviews(): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]>>('/reviews/received');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]>>(`/reviews/user/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEventReviews(eventId: string): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]>>(`/reviews/event/${eventId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReviewStats(userId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<string, number>;
      }>>(`/reviews/stats/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ReviewService();
