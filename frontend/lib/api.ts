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

// Event Planner API calls
export const plannerApi = {
  // Get dashboard stats for event planners
  getDashboardStats: async (username: string) => {
    // Use portfolio stats endpoint for now
    return apiRequest<{
      activeEvents: number;
      pendingApplications: number;
      totalBudget: number;
      avgRating: number;
      totalEvents: number;
      totalApplications: number;
      totalBookings: number;
    }>(`/api/portfolio/${username}/dashboard/stats`).catch(() => ({
      activeEvents: 0,
      pendingApplications: 0,
      totalBudget: 0,
      avgRating: 0,
      totalEvents: 0,
      totalApplications: 0,
      totalBookings: 0
    }));
  },

  // Get events for event planner
  getMyEvents: async () => {
    return apiRequest<Array<{
      id: string;
      title: string;
      date: string;
      location: string;
      budget: number;
      currency: string;
      status: string;
      applications: number;
      confirmedCreatives: number;
      category: string;
      description: string;
    }>>(`/api/events/my/events`);
  },

  // Get applications for event planner's events
  getApplications: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<Array<{
      id: string;
      eventTitle: string;
      creativeName: string;
      role: string;
      experience: string;
      rate: string;
      appliedDate: string;
      event: string;
      skill: string;
      rating: number;
      status: string;
      message?: string;
      proposedRate?: number;
    }>>(`/api/applications/pending${query}`);
  },
};

// Creative Professional API calls
export const creativeApi = {
  // Get dashboard stats for creative professionals
  getDashboardStats: async (username: string) => {
    return apiRequest<{
      totalProjects: number;
      totalViews: number;
      recentViews: number;
      totalApplications: number;
      rating: number;
    }>(`/api/portfolio/${username}/dashboard/stats`);
  },

  // Get projects for creative professional
  getProjects: async (username: string) => {
    return apiRequest<Array<{
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      views: number;
      applications: number;
      status: string;
      tags: string[];
      createdAt: string;
    }>>(`/api/portfolio/${username}/dashboard/projects`);
  },

  // Get applications made by creative professional
  getMyApplications: async () => {
    return apiRequest<Array<{
      id: string;
      eventTitle: string;
      organizer: string;
      date: string;
      status: string;
      budget: string;
      message?: string;
      proposedRate?: number;
    }>>(`/api/applications/my`);
  },
};

// Portfolio API calls
export const portfolioApi = {
  // Get public portfolio
  getPortfolio: async (username: string) => {
    return apiRequest<{
      user: {
        name: string;
        email: string;
        role: string;
        avatar?: string;
        bio?: string;
      };
      projects: Array<{
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        views: number;
        likes: number;
        tags: string[];
        category: string;
      }>;
      reviews: Array<{
        id: string;
        client: string;
        rating: number;
        comment: string;
        event: string;
        date: string;
      }>;
      stats: {
        totalProjects: number;
        totalViews: number;
        averageRating: number;
        totalReviews: number;
      };
    }>(`/api/portfolio/${username}`);
  },
};

// Reviews API calls
export const reviewsApi = {
  // Get reviews for a user
  getReviews: async (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return apiRequest<Array<{
      id: string;
      client: string;
      rating: number;
      comment: string;
      event: string;
      date: string;
    }>>(`/api/reviews${query}`);
  },
};
