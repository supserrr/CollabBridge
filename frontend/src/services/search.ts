import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  CreativeProfile, 
  SearchFilters, 
  SearchResponse, 
  ApiResponse 
} from '../types';

class SearchService {
  async searchProfessionals(filters?: SearchFilters): Promise<SearchResponse<CreativeProfile>> {
    try {
      const response = await api.get<ApiResponse<SearchResponse<CreativeProfile>>>('/search/professionals', {
        params: filters
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFeaturedProfessionals(): Promise<CreativeProfile[]> {
    try {
      const response = await api.get<ApiResponse<CreativeProfile[]>>('/search/professionals/featured');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getProfessionalById(id: string): Promise<CreativeProfile> {
    try {
      const response = await api.get<ApiResponse<CreativeProfile>>(`/search/professionals/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPopularSkills(): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<string[]>>('/search/skills/popular');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPopularCategories(): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<string[]>>('/search/categories/popular');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<string[]>>('/search/locations', {
        params: { q: query }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new SearchService();
